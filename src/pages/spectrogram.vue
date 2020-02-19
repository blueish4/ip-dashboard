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

function genCell(value: number, lower: number, upper: number): number[] {
  const intensity = getRatioPoint(value);

  function getChannelValue(channel: number) {
    const chanSelect = 8 * channel; // 8 bits per channel
    const mask = 0xff << chanSelect;
    const range = (upper & mask) - (lower & mask);

    return ((((range >> chanSelect) * value * intensity) << chanSelect) & mask) >> chanSelect;
  }
  // Generate a gradient colour between the optional lower and upper
  // Split into R, G, and B channels and process individually
  // TODO: Convert to a loop, can probably be done
  const R:number = getChannelValue(2);
  const G:number = getChannelValue(1);
  const B:number = getChannelValue(0);
  return [R, G, B, 255]; // Constant full alpha value
}

function genColumn(values: number[], lower: number, upper: number): number[][] {
  console.log(values);
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
  async mounted() {
    const data = await fetch('https://europe-west1-individual-project-265621.cloudfunctions.net/get-latest-frequencies');
    const spectralData = await data.json();
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.scale(10, 10); // TODO: these values are constant
    const colors = genColumn(spectralData.spectra, 0, 0xff0000);
    context.drawImage(prerenderColumn(colors), 0, 0);
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
