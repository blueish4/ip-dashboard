<template>
  <div class="parent" @resize="resize">
    <div>
    <canvas id="canvas">
      <p>A canvas showing the previous history</p>
    </canvas>
    <p v-if="!loaded">Loading...</p>
    </div>
    <div>
    <db-history-graph
      class="graph"
      v-if="loaded"
      :chartData="this.dbHistory"
      :options="options"
    />
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-bitwise */
import Vue from 'vue';
import Vuex from 'vuex';
import dbHistoryGraph from '../components/dbHistoryGraph.vue';

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
interface record {
  dba:number,
  majorPeak: number,
  timestamp:{_seconds: number}
}

export default Vue.extend({
  components: {
    dbHistoryGraph,
  },
  computed: {
    dbHistory() {
      const history = this.$store.getters.lastEntries;
      const bundle = history.map((e: record) => {
        // eslint-disable-next-line no-underscore-dangle
        const timestamp = new Date(e.timestamp._seconds * 1000);
        return [{
          y: e.dba,
          x: timestamp,
        }, {
          y: e.majorPeak,
          x: timestamp,
        }];
      });

      return {
        datasets: [{
          label: 'dBA reading',
          data: bundle.map((e:Object[]) => e[0]),
          borderColor: '#ff0000',
          backgroundColor: '#f00',
          yAxisID: 'dba',
        }, {
          label: 'Peak Frequency',
          data: bundle.map((e:Object[]) => e[1]),
          yAxisID: 'peak',
        }],
      };
    },
    loaded() {
      return this.$store.getters.lastEntries.length > 0;
    },
  },
  data() {
    return {
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'linear',
            ticks: {
              // maxRotation: 0,
              sampleSize: 20,
              source: 'auto',
            },
            time: {
              stepSize: 20,
              displayFormats: {
                second: 'h:mm:ss',
              },
            },
            scaleLabel: {
              labelString: 'Time',
              display: true,
            },
          }],
          yAxes: [{
            type: 'linear',
            scaleLabel: {
              labelString: 'Loudness (dBA)',
              display: true,
            },
            ticks: {
              min: 30,
            },
            id: 'dba',
            position: 'left',
          }, {
            id: 'peak',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              labelString: 'Peak frequency',
              display: true,
            },
          }],
        },
      },
    };
  },
  async mounted() {
    if (this.$store.getters.lastEntries.length > 0) {
      this.resize();
    }
    window.setInterval(() => {
      if (this.$route.path === '/spectrogram') {
        this.resize();
      }
    }, 5000);
  },
  methods: {
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
