<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  modelValue: string
  language: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript'
})


const emit = defineEmits(['update:modelValue'])

const editorContainer = ref<HTMLDivElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (editorContainer.value) {
    editorInstance = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || 'typescript',
      theme: 'vs-dark',
      automaticLayout: true
    })

    editorInstance.onDidChangeModelContent(() => {
      emit('update:modelValue', editorInstance!.getValue())
    })
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editorInstance && newVal !== editorInstance.getValue()) {
    editorInstance.setValue(newVal)
  }
})

onBeforeUnmount(() => {
  editorInstance?.dispose()
})
</script>

<style scoped>
.editor-container {
  height: 100%;
  width: 100%;
  border: 1px solid #444;
}
</style>
