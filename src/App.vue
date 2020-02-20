<template>
  <b-container>
    <b-navbar toggleable="lg" variant="dark" type="dark">
      <b-navbar-brand to="/">
        Listener
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item to="/recent">
              Recent
            </b-nav-item>
            <b-nav-item to="/spectrogram">
              Spectrogram
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>
    </b-navbar>
    <div v-if="loaded">
      <router-view/>
    </div>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {
  mounted() {
    this.getMoreData();
  }

  loaded() {
    return this.$store && this.$store.getters.lastEntries.length > 0;
  }

  async getMoreData(): Promise<void> {
    const data = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-history');
    const spectralData = await data.json();
    this.$store.commit('importNewData', spectralData);
    window.setInterval(async () => {
      await this.fetchUpdate();
    }, 5000);
  }

  async fetchUpdate() {
    const res = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-latest-frequencies');
    const json = await res.json();
    this.$store.commit('importNewData', json);
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
