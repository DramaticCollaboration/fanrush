<template>
  <iframe class="preview" :srcdoc="code"></iframe>
</template>

<script setup lang="ts">
interface Props {
  code: string
}
const props = defineProps<Props>()
</script>

<style>
.preview {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
