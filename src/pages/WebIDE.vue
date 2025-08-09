<template>
  <q-page class="row no-wrap">
    <!-- 왼쪽: 파일 트리 -->
    <div class="col-2 bg-grey-2">
      <FileTree  @file-select="handleFileSelect"/>
    </div>

    <!-- 중앙: 코드 에디터 -->
    <div class="col-7">
      <CodeEditor v-model="code" :language="language"/>
    </div>

    <!-- 오른쪽: 터미널/빌드/AI 도움말 탭 -->
    <div class="col-3">
      <q-tabs v-model="rightTab" dense>
        <q-tab name="terminal" label="터미널" />
        <q-tab name="build" label="빌드" />
        <q-tab name="ai" label="AI 도움말" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="rightTab" animated>
        <q-tab-panel name="terminal">
          <TerminalView />
        </q-tab-panel>

        <q-tab-panel name="build">
          <q-btn color="primary" label="빌드" @click="startBuild" />
          <q-btn color="secondary" label="실행" @click="runProject" class="q-ml-sm" />
          <BuildLog :logs="buildLogs" :errorLines="errorLines" />
        </q-tab-panel>

        <q-tab-panel name="ai">
          <AIAssistant :logs="buildLogs" :code="code" @applyPatch="applyPatch" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

import FileTree from 'components/FileTree.vue'
import CodeEditor from 'components/CodeEditor.vue'
import TerminalView from 'components/TerminalView.vue'
import BuildLog from 'components/BuildLog.vue'
import AIAssistant from 'components/AIAssistant.vue'

const rightTab = ref<'terminal' | 'build' | 'ai'>('terminal')
const code = ref<string>('')
const language = ref<string>('typescript')
const buildLogs = ref<string[]>([])
const errorLines = ref<number[]>([])

function startBuild() {
  // 빌드 API 호출 로직
  router.push('/idea/sample/build')
}
function runProject() {
  router.push('/idea/sample/build')
  // 실행 로직
}
function applyPatch(patch: string) {
  code.value = patch
}


function handleFileSelect(filePath: string) {

// 파일 확장자에 따른 샘플 코드 맵
  const sampleCodeMap: Record<string, { code: string, language: string }> = {
    '.vue': {
      code: `<template>
  <div>
    <h1>Hello Vue!</h1>
  </div>
</template>

<script setup lang="ts">
// Your component logic here
<\/script>

<style>
/* Your styles here */
</style>`,
      language: 'vue'
    },
    '.ts': {
      code: `import { defineComponent } from 'vue'

export default defineComponent({
name: 'MyComponent',
setup() {
// Component setup logic here
return {}
}
})`,
      language: 'typescript'
    },
    '.json': {
      code: `{
"name": "my-project",
"version": "1.0.0",
"dependencies": {
"vue": "^3.0.0"
}
}`,
      language: 'json'
    }
  }

  const ext = filePath.substring(filePath.lastIndexOf('.'))
  const sampleData = sampleCodeMap[ext] || {
    code: `// ${filePath}\n// No sample code available for this file type`,
    language: 'plaintext'
  }

  code.value = sampleData.code
  language.value = sampleData.language
}

</script>
