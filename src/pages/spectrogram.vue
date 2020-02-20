<template>
  <div class="parent" @resize="resize" v-if="loaded">
    <canvas id="canvas">
      <p>A canvas showing the previous history</p>
    </canvas>
    <p v-if="!loaded">Loading...</p>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-bitwise */
import Vue from 'vue';
import Vuex from 'vuex';

function genCell(value: number, lower: number, upper: number): number[] {
  const intensity = value / 65535;

  const channels = [];
  for (let channel = 2; channel >= 0; channel -= 1) {
    const chanSelect = 8 * channel; // 8 bits per channel
    const mask = 0xff << chanSelect;
    const range = (upper & mask) - (lower & mask);

    const chanValue = ((range >> chanSelect) * value * intensity) & 0xff;
    channels.push(chanValue);
  }
  channels.push(255); // full alpha channel
  return channels;
}

function genColumn(values: number[], lower: number, upper: number): number[][] {
  const colors: number[][] = [];
  values.forEach((e) => {
    colors.push(genCell(e, lower, upper));
  });
  return colors;
}

function drawColumn(ctx: CanvasRenderingContext2D, colors: number[][]) {
  const imageData = ctx.createImageData(1, colors.length);
  let i = 0;
  colors.reverse().forEach((element) => {
    imageData.data[i + 0] = element[0]; // eslint-disable-line prefer-destructuring
    imageData.data[i + 1] = element[1]; // eslint-disable-line prefer-destructuring
    imageData.data[i + 2] = element[2]; // eslint-disable-line prefer-destructuring
    imageData.data[i + 3] = element[3]; // eslint-disable-line prefer-destructuring
    i += 4;
  });
  ctx.putImageData(imageData, 0, 0);
}

function prerenderColumn(colors: number[][]) {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.height = colors.length;
  offscreenCanvas.width = 1;
  const offscreenCtx = offscreenCanvas.getContext('2d') as CanvasRenderingContext2D;
  drawColumn(offscreenCtx, colors);
  return offscreenCanvas;
}

export default Vue.extend({
  data() {
    return {
      loaded: false,
    };
  },
  async mounted() {
    await this.getMoreData();
    this.resize();
  },
  methods: {
    async getMoreData(): Promise<void> {
      const data = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-history');
      const spectralData = await data.json();
      this.$store.commit('importNewData', spectralData);
      this.loaded = true;
      window.setInterval(async () => {
        await this.fetchUpdate();
        this.redraw();
      }, 5000);
    },
    async fetchUpdate() {
      const res = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-latest-frequencies');
      const json = await res.json();
      this.$store.commit('importNewData', json);
    },
    resize() {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      canvas.width = (canvas.parentElement as HTMLElement).offsetWidth;
      this.redraw();
    },
    redraw() {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const plottable = this.$store.getters.lastEntries;

      context.save(); // save default drawing context
      context.scale(canvas.width / plottable.length, canvas.height / 8);
      let counter = 0;
      plottable.forEach((point: {spectra: number[]}) => {
        const colors = genColumn(point.spectra, 0, 0xff0000);
        context.drawImage(prerenderColumn(colors), counter, 0);
        counter += 1;
      });
      context.restore(); // restore default drawing context
      context.save();
      context.fillStyle = '#e9f409';
      context.strokeStyle = '#e9f409';
      context.fillText('8000Hz', 100, 12);
      context.fillText('63Hz', 100, canvas.height - 2);

      // eslint-disable-next-line dot-notation
      const latestDate = new Date(plottable[plottable.length - 1].timestamp['_seconds'] * 1000);
      // eslint-disable-next-line dot-notation
      const oldestDate = new Date(plottable[0].timestamp['_seconds'] * 1000);
      const timeLocaleOptions:Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: '2-digit',
      };
      const dateLocaleOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'numeric',
        year: '2-digit',
      };
      context.fillText(latestDate.toLocaleTimeString('en-GB', timeLocaleOptions), canvas.width - 50, canvas.height - 12);
      context.fillText(latestDate.toLocaleDateString('en-GB', dateLocaleOptions), canvas.width - 50, canvas.height - 2);
      context.fillText(oldestDate.toLocaleTimeString('en-GB', timeLocaleOptions), 0, canvas.height - 12);
      context.fillText(oldestDate.toLocaleDateString('en-GB', dateLocaleOptions), 0, canvas.height - 2);

      context.restore();
    },
  },
});
</script>

<style scoped>
.parent {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(8, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}
</style>
