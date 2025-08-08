<template>
  <div class="terminal-container">
    <pre v-for="(line, idx) in output" :key="idx">{{ line }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const output = ref<string[]>(['$ npm run dev', 'Starting dev server...'])
</script>

<style>
.terminal-container {
  height: 300px;
  background: #000;
  color: #0f0;
  overflow-y: auto;
  padding: 8px;
}
</style>
