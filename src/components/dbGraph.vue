<script lang="ts">
import Vue from 'vue';
import { Bar, mixins } from 'vue-chartjs';

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
  },
  mounted() {
    // Overwriting base render method with actual data.
    this.renderChart(this.chartData, this.options);
  },
};
</script>
