<template>
  <div class="parent">
    <canvas id="canvas">
      <p>A canvas showing the previous history</p>
    </canvas>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-bitwise */
import Vue from 'vue';

function getRatioPoint(value: number): number {
  return value / 65535;
}

function genCell(value: number, lower: number, upper: number): string {
  const intensity = getRatioPoint(value);

  function getChannelValue(channel: number) {
    const chanSelect = 8 * channel; // 8 bits per channel
    const mask = 0xff << chanSelect;
    const range = (upper & mask) - (lower & mask);

    return (((range >> chanSelect) * value * intensity) << chanSelect) & mask;
  }
  // Generate a gradient colour between the optional lower and upper
  // Split into R, G, and B channels and process individually
  // TODO: Convert to a loop, can probably be done
  const R:number = getChannelValue(2);
  const G:number = getChannelValue(1);
  const B:number = getChannelValue(0);
  const color = R | G | B;
  return color.toString(16);
}

function genColumn(values: number[]): string[] {
  const colors: string[] = [];
  values.forEach((e) => {
    colors.push(genCell(e, 0x000000, 0xFFFFFF));
  });
  return colors;
}

function drawColumn(ctx: CanvasRenderingContext2D, colors: string[]) {

}

export default Vue.extend({
  data() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    return {
      canvas,
      context,
    };
  },
  async mounted() {
    const data = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-latest-frequencies');
    const spectralData = await data.json();
    console.log(genCell(30000, 0, 0xffffff));
    const colors = genColumn(spectralData.spectra);
    drawColumn(this.context, colors);
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
