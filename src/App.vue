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
    <router-view />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';

@Component({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {}
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
