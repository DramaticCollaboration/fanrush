<!-- Vue -->
<!-- components/ProjectSettingsDialog.vue -->
<template>
  <q-dialog v-model="model" persistent maximized>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">프로젝트 설정</div>
        <div class="row items-center">
          <q-btn
            flat
            color="primary"
            icon="save"
            label="저장"
            :loading="saving"
            :disable="!isDirty"
            @click="saveAll"
            class="q-mr-sm"
          />
          <q-btn flat icon="close" v-close-popup />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-tabs v-model="tab" active-color="primary" align="justify" narrow-indicator>
          <q-tab name="general" label="일반" icon="tune" />
          <q-tab name="members" label="멤버" icon="group" />
          <q-tab name="notifications" label="알림" icon="notifications" />
          <q-tab name="integrations" label="연동" icon="link" />
          <q-tab name="danger" label="위험 구역" icon="warning" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- 일반 -->
          <q-tab-panel name="general">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="state.general.name" label="프로젝트 이름" outlined />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="state.general.visibility"
                  :options="[
                    { label: '비공개', value: 'private' },
                    { label: '팀 공개', value: 'team' },
                    { label: '공개', value: 'public' }
                  ]"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  label="공개 범위"
                  outlined
                />
              </div>
              <div class="col-12">
                <q-input v-model="state.general.description" label="설명" type="textarea" outlined />
              </div>
            </div>
          </q-tab-panel>

          <!-- 멤버 -->
          <q-tab-panel name="members">
            <div class="row items-center q-col-gutter-sm q-mb-md">
              <div class="col">
                <q-input v-model="newMemberEmail" label="멤버 이메일" outlined />
              </div>
              <div class="col-auto">
                <q-select
                  v-model="newMemberRole"
                  :options="roleOptions"
                  emit-value
                  map-options
                  outlined
                  style="min-width: 140px"
                />
              </div>
              <div class="col-auto">
                <q-btn color="primary" label="추가" @click="addMember" :disable="!newMemberEmail" />
              </div>
            </div>

            <q-list bordered separator>
              <q-item v-for="m in state.members" :key="m.id">
                <q-item-section>
                  <q-item-label>{{ m.name || m.email }}</q-item-label>
                  <q-item-label caption>{{ m.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-select
                    v-model="m.role"
                    :options="roleOptions"
                    emit-value
                    map-options
                    dense
                    outlined
                    style="min-width: 120px"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-btn flat color="negative" icon="delete" @click="removeMember(m.id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- 알림 -->
          <q-tab-panel name="notifications">
            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>이메일 알림</q-item-label>
                  <q-item-label caption>중요 업데이트를 이메일로 수신</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="state.notifications.email" color="primary" />
                </q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>인앱 알림</q-item-label>
                  <q-item-label caption>앱 내 배지와 목록</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="state.notifications.inApp" color="primary" />
                </q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>푸시 알림</q-item-label>
                  <q-item-label caption>브라우저 푸시</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="state.notifications.push" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- 연동 -->
          <q-tab-panel name="integrations">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="state.integrations.webhookUrl" label="웹훅 URL" outlined placeholder="https://example.com/webhook" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="state.integrations.githubRepo" label="GitHub 저장소" outlined placeholder="owner/repo" />
              </div>
              <div class="col-12">
                <q-input
                  v-model="state.integrations.slackWebhook"
                  label="Slack Webhook"
                  outlined
                  placeholder="https://hooks.slack.com/services/<PLACEHOLDER>"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- 위험 구역 -->
          <q-tab-panel name="danger">
            <q-banner class="bg-red-1 text-red-10 q-mb-md" rounded>
              <q-icon name="warning" class="q-mr-sm" />
              이 작업은 되돌릴 수 없습니다. 신중히 진행하세요.
            </q-banner>
            <q-btn
              color="negative"
              icon="delete_forever"
              label="프로젝트 삭제"
              @click="confirmDelete"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <!-- 삭제 확인 -->
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section class="text-h6">프로젝트 삭제</q-card-section>
        <q-card-section>
          정말로 삭제하시겠어요? 이 작업은 취소할 수 없습니다.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn flat color="negative" label="삭제" @click="deleteProject" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

type Role = 'owner' | 'admin' | 'editor' | 'viewer'
type ProjectSettings = {
  general: { name: string; description: string; visibility: 'private' | 'team' | 'public' }
  members: Array<{ id: string; email: string; name?: string; role: Role }>
  notifications: { email: boolean; inApp: boolean; push: boolean }
  integrations: { webhookUrl: string; githubRepo: string; slackWebhook: string }
}

const props = defineProps<{
  modelValue: boolean
  projectId: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'saved', settings: ProjectSettings): void
}>()

const $q = useQuasar()
const model = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const tab = ref<'general' | 'members' | 'notifications' | 'integrations' | 'danger'>('general')
const roleOptions = [
  { label: '소유자', value: 'owner' },
  { label: '관리자', value: 'admin' },
  { label: '편집자', value: 'editor' },
  { label: '뷰어', value: 'viewer' },
]

const state = ref<ProjectSettings>({
  general: { name: '', description: '', visibility: 'private' },
  members: [],
  notifications: { email: true, inApp: true, push: false },
  integrations: { webhookUrl: '', githubRepo: '', slackWebhook: '' },
})

const baseline = ref<ProjectSettings | null>(null)
const saving = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

const isDirty = computed(() => JSON.stringify(state.value) !== JSON.stringify(baseline.value))

// 신규 멤버 입력
const newMemberEmail = ref('')
const newMemberRole = ref<Role>('viewer')

// 초기 로드(목업)
async function loadSettings() {
  // 실제 API로 교체하세요
  await new Promise(r => setTimeout(r, 300))
  const mock: ProjectSettings = {
    general: { name: '샘플 프로젝트', description: '설명 텍스트', visibility: 'team' },
    members: [
      { id: 'u-1', email: 'owner@example.com', name: '프로덕트오너', role: 'owner' },
      { id: 'u-2', email: 'dev@example.com', name: '개발자', role: 'editor' },
    ],
    notifications: { email: true, inApp: true, push: false },
    integrations: { webhookUrl: '', githubRepo: '', slackWebhook: '' },
  }
  state.value = JSON.parse(JSON.stringify(mock))
  baseline.value = JSON.parse(JSON.stringify(mock))
}

async function saveAll() {
  saving.value = true
  try {
    // 실제 API로 교체하세요
    await new Promise(r => setTimeout(r, 400))
    baseline.value = JSON.parse(JSON.stringify(state.value))
    $q.notify({ type: 'positive', message: '설정이 저장되었습니다.' })
    emit('saved', state.value)
  } catch (e) {
    $q.notify({ type: 'negative', message: '저장 중 오류가 발생했어요.' })
  } finally {
    saving.value = false
  }
}

function addMember() {
  if (!newMemberEmail.value) return
  state.value.members.push({
    id: `tmp-${Date.now()}`,
    email: newMemberEmail.value,
    role: newMemberRole.value,
  })
  newMemberEmail.value = ''
  newMemberRole.value = 'viewer'
}

function removeMember(id: string) {
  state.value.members = state.value.members.filter(m => m.id !== id)
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

async function deleteProject() {
  deleting.value = true
  try {
    // 실제 삭제 API로 교체하세요
    await new Promise(r => setTimeout(r, 600))
    $q.notify({ type: 'positive', message: '프로젝트가 삭제되었습니다.' })
    model.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: '삭제 실패. 잠시 후 다시 시도하세요.' })
  } finally {
    deleting.value = false
  }
}

watch(() => props.projectId, () => { void loadSettings() })
onMounted(() => { void loadSettings() })
</script>

<style scoped>
/* 필요 시 스타일 보강 */
</style>
