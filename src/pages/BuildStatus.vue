
<template>
  <q-page padding>
    <div class="build-status-container">
      <!-- 빌드 상태 헤더 -->
      <div class="status-header q-mb-lg">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <h4 class="q-mt-none q-mb-sm">
              빌드 상태: {{ projectName }}
            </h4>
            <q-badge
              :color="statusColor"
              :label="statusLabel"
              class="q-px-md q-py-sm text-weight-bold"
            />
          </div>
          <div class="col-auto" v-if="buildStatus?.deploymentUrl">
            <q-btn
              color="primary"
              :href="buildStatus.deploymentUrl || ''"
              target="_blank"
              icon="launch"
              label="사이트 방문"
            />
          </div>
        </div>
      </div>

      <!-- 진행 상태 타임라인 -->
      <q-timeline color="secondary">
        <q-timeline-entry
          title="빌드 시작"
          :subtitle="buildStatus?.startTime ? formatDate(buildStatus.startTime) : ''"
          icon="engineering"
          :done="true"
        />
        <q-timeline-entry
          title="빌드 진행중"
          icon="build"
          :color="buildStatus?.status === 'running' ? 'orange' : 'grey'"
          :done="buildStatus?.status !== 'queued'"
        />
        <q-timeline-entry
          title="배포"
          icon="cloud_upload"
          :color="buildStatus?.status === 'success' ? 'positive' : 'grey'"
          :done="buildStatus?.status === 'success'"
        />
      </q-timeline>

      <!-- 빌드 정보 카드 -->
      <q-card v-if="buildStatus?.status === 'success'" class="q-mt-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- URL 정보 -->
            <div class="col-12 col-md-6">
              <q-input
                readonly
                :model-value="buildStatus.deploymentUrl || ''"
                label="배포 URL"
                stack-label
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    icon="content_copy"
                    @click="buildStatus.deploymentUrl && copyToClipboard(buildStatus.deploymentUrl)"
                  />
                </template>
              </q-input>
            </div>
            <!-- SSL 상태 -->
            <div class="col-12 col-md-6">
              <div class="ssl-status">
                <q-icon
                  :name="tlsIcon"
                  :color="tlsColor"
                  size="24px"
                  class="q-mr-sm"
                />
                SSL 인증서: {{ tlsStatusLabel }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- 미리보기 이미지 -->
        <q-card-section v-if="buildStatus.previewImageUrl">
          <q-img
            :src="buildStatus.previewImageUrl"
            style="max-height: 300px"
            fit="contain"
          />
        </q-card-section>

        <!-- 공유 버튼 -->
        <q-card-actions align="right">
          <q-btn-group flat>
            <q-btn
              v-for="target in shareTargets"
              :key="target.platform"
              :icon="shareIcon(target.platform)"
              :color="shareColor(target.platform)"
              @click="share(target)"
              flat
              round
            />
          </q-btn-group>
        </q-card-actions>
      </q-card>

      <!-- 빌드 로그 -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">빌드 로그</div>
          <q-scroll-area style="height: 400px" dark>
            <pre class="build-log" :class="{ 'error-log': buildStatus?.status === 'failed' }">
              {{ buildLogs.join('\n') }}
            </pre>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import type { BuildStatus, ShareTarget } from 'components/models'

const $q = useQuasar()
const route = useRoute()
const projectId = route.params.projectId as string
const projectName = ref('My Project')
const buildStatus = ref<BuildStatus | null>(null)
const buildLogs = ref<string[]>([])

// 상태 관련 계산된 속성들
const statusColor = computed(() => {
  switch (buildStatus.value?.status) {
    case 'queued': return 'grey'
    case 'running': return 'orange'
    case 'success': return 'positive'
    case 'failed': return 'negative'
    default: return 'grey'
  }
})

const statusLabel = computed(() => {
  switch (buildStatus.value?.status) {
    case 'queued': return '대기 중'
    case 'running': return '진행 중'
    case 'success': return '완료'
    case 'failed': return '실패'
    default: return '알 수 없음'
  }
})

const tlsIcon = computed(() => {
  switch (buildStatus.value?.tlsStatus) {
    case 'active': return 'lock'
    case 'pending': return 'hourglass_empty'
    case 'failed': return 'error'
    default: return 'lock_open'
  }
})

const tlsColor = computed(() => {
  switch (buildStatus.value?.tlsStatus) {
    case 'active': return 'positive'
    case 'pending': return 'orange'
    case 'failed': return 'negative'
    default: return 'grey'
  }
})

const tlsStatusLabel = computed(() => {
  switch (buildStatus.value?.tlsStatus) {
    case 'active': return '활성화'
    case 'pending': return '발급 중'
    case 'failed': return '실패'
    default: return '대기 중'
  }
})

// 공유 관련
const shareTargets = computed<ShareTarget[]>(() => {
  if (!buildStatus.value?.deploymentUrl) return []
  return [
    { platform: 'twitter', url: buildStatus.value.deploymentUrl },
    { platform: 'facebook', url: buildStatus.value.deploymentUrl },
    { platform: 'kkumz', url: buildStatus.value.deploymentUrl }
  ]
})

const shareIcon = (platform: string) => {
  switch (platform) {
    case 'twitter': return 'fab fa-twitter'
    case 'facebook': return 'fab fa-facebook'
    case 'kkumz': return 'people'
    default: return 'share'
  }
}

const shareColor = (platform: string) => {
  switch (platform) {
    case 'twitter': return 'blue'
    case 'facebook': return 'primary'
    case 'kkumz': return 'secondary'
    default: return 'grey'
  }
}

// 메서드들
const fetchBuildStatus = async () => {
  // 샘플 빌드 데이터
  const sampleBuildData: BuildStatus = {
    id: '1',
    projectId: projectId,
    status: 'success',
    logs: [
      '[INFO] 프로젝트 빌드 시작...',
      '[INFO] 의존성 설치 중...',
      '[SUCCESS] npm 패키지 설치 완료',
      '[INFO] TypeScript 컴파일 중...',
      '[SUCCESS] 컴파일 완료',
      '[INFO] Vite 빌드 실행 중...',
      '[SUCCESS] 빌드 완료',
      '[INFO] 정적 파일 최적화 중...',
      '[SUCCESS] 최적화 완료',
      '[INFO] 배포 준비 중...',
      '[INFO] SSL 인증서 발급 중...',
      '[SUCCESS] SSL 인증서 발급 완료',
      '[SUCCESS] 배포 완료: https://myproject.kkumz.com'
    ],
    startTime: new Date(Date.now() - 300000).toISOString(), // 5분 전
    endTime: new Date().toISOString(),
    deploymentUrl: 'https://myproject.kkumz.com',
    tlsStatus: 'active',
    previewImageUrl: 'https://placehold.co/800x400' // 샘플 이미지
  }

  try {
    // API 호출 대신 샘플 데이터 사용
    buildStatus.value = sampleBuildData
    buildLogs.value = sampleBuildData.logs
  } catch (error) {
    console.error('빌드 상태 조회 실패:', error)
    $q.notify({
      color: 'negative',
      message: '빌드 상태를 불러오는데 실패했습니다.',
      icon: 'error'
    })
  }
}


const copyToClipboard = (text: string) => {
  // null 체크를 추가하여 타입 안전성 보장
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      $q.notify({
        color: 'positive',
        message: 'URL이 클립보드에 복사되었습니다.',
        icon: 'content_copy'
      })
    }).catch((error) => {
      console.error('클립보드 복사 실패:', error)
      $q.notify({
        color: 'negative',
        message: 'URL 복사에 실패했습니다.',
        icon: 'error'
      })
    })
  }
}

const share = (target: ShareTarget) => {
  // 실제 공유 로직 구현
  console.log(`Sharing to ${target.platform}: ${target.url}`)
  $q.notify({
    color: 'positive',
    message: `${target.platform}에 공유되었습니다.`,
    icon: 'share'
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// 컴포넌트 마운트 시 빌드 상태 조회
onMounted(() => {
  void fetchBuildStatus()
  // 실시간 업데이트를 위한 폴링 설정
  const interval = setInterval(() => void fetchBuildStatus(), 5000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style lang="scss" scoped>
.build-status-container {
  max-width: 1200px;
  margin: 0 auto;
}

.build-log {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  color: #fff;
  font-family: monospace;
  white-space: pre-wrap;

  &.error-log {
    color: #ff5252;
  }
}

.ssl-status {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.03);
}
</style>
