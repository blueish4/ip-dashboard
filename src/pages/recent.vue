<template>
  <div>
    <dbGraph
      class="graph"
      v-if="loaded"
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
    loaded: false,
    chartData: {},
    options: {
      maintainAspectRatio: false,
    },
    date: new Date(),
  }),
  async mounted() {
    const res = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-latest-frequencies');
    const json = await res.json();

    // eslint-disable-next-line dot-notation
    const timestamp = json.timestamp['_seconds'] * 1000;
    this.date = new Date(timestamp);

    this.chartData = {
      labels: ['63', '125', '250', '500', '1000', '2000', '4000', '8000'],
      datasets: [
        {
          data: json.spectra,
          label: 'spectra',
        },
      ],
    };
    this.loaded = true;
  },
});
</script>

<style>
.graph {
  height: calc(90vh - 56px);
}
</style>
