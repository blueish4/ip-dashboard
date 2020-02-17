<template>
  <div>
    <dbGraph
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
    chartData: null,
    date: new Date(),
  }),
  async mounted() {
    const res = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-latest-frequencies');
    const json = await res.json();
    this.date = new Date(json.timestamp.seconds);
    console.log(json);
  },
});
</script>

<style>

</style>
