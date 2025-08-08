<template>
  <div class="log-container">
    <pre v-for="(line, idx) in logs" :key="idx" :class="{'text-negative': errorLines.includes(idx)}">
      {{ line }}
    </pre>
  </div>
</template>

<script setup lang="ts">
interface Props {
  logs: string[]
  errorLines: number[]
}
const props = defineProps<Props>()
</script>

<style>
.log-container {
  height: 300px;
  overflow-y: auto;
  background: #000;
  color: #fff;
  padding: 8px;
}
</style>
