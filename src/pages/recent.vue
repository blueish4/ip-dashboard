<template>
  <div v-if="loaded">
    <dbGraph
      class="graph"
      :chartData="chartData"
      :options="options"
    />
    <p>Last seen at {{ date }}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import dbGraph from '../components/dbGraph.vue';


export default Vue.extend({
  components: {
    dbGraph,
  },
  data: () => ({
    options: {
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          scaleLabel: {
            labelString: 'Frequency (Hz)',
            display: true,
          },
        }],
        yAxes: [{
          scaleLabel: {
            labelString: 'Relative loudness',
            display: true,
          },
        }],
      },
    },
  }),
  computed: {
    loaded() {
      return this.$store.getters.lastEntries.length > 0;
    },
    chartData() {
      const history = this.$store.getters.lastEntries;
      return {
        labels: ['63', '125', '250', '500', '1000', '2000', '4000', '8000'],
        datasets: [
          {
            data: history[history.length - 1].spectra.map((e: number) => e / 65535),
            label: 'spectra',
          },
        ],
      };
    },
    date() {
      const history = this.$store.getters.lastEntries;
      // eslint-disable-next-line dot-notation
      const timestamp = history[history.length - 1].timestamp['_seconds'] * 1000;
      return new Date(timestamp);
    },
  },
});
</script>

<style>
.graph {
  height: calc(90vh - 56px);
}
</style>
