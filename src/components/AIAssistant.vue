<template>
  <div>
    <q-card>
      <q-card-section>
        <div class="text-h6">AI 빌드 오류 분석</div>
      </q-card-section>
      <q-card-section>
        <pre>{{ analysis }}</pre>
        <q-btn color="primary" label="패치 적용" @click="apply" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
interface Props { logs: string[]; code: string }
const props = defineProps<Props>()
const emit = defineEmits(['applyPatch'])
const analysis = ref('')

watch(() => props.logs, (newLogs) => {
  // AI API 호출 예시
  analysis.value = '오류 원인 분석 및 수정 제안'
})

function apply() {
  emit('applyPatch', '// 수정된 코드')
}
</script>
