<template>
  <q-list bordered separator>
    <q-item v-for="(file, idx) in files" :key="idx" clickable @click="selectFile(file)">
      <q-item-section>
        <q-item-label>{{ file }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'fileSelect', file: string): void
}>()

const files = ref<string[]>([
  'src/main.ts',
  'src/App.vue',
  'src/pages/WebIDE.vue',
  'src/components/FileTree.vue',
  'package.json',
  'quasar.config.ts'
])

function selectFile(file: string) {
  emit('fileSelect', file)
}
</script>
