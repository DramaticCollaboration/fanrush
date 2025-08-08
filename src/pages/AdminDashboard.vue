<template>
  <q-page padding>
    <div class="admin-dashboard">
      <!-- 상단 통계 카드 -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-primary text-white">
            <q-card-section>
              <div class="text-h6">신규 신고</div>
              <div class="text-h4">{{ stats.newReports }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-warning text-white">
            <q-card-section>
              <div class="text-h6">처리 대기</div>
              <div class="text-h4">{{ stats.pendingReports }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-negative text-white">
            <q-card-section>
              <div class="text-h6">제재 계정</div>
              <div class="text-h4">{{ stats.bannedUsers }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-positive text-white">
            <q-card-section>
              <div class="text-h6">활성 빌드</div>
              <div class="text-h4">{{ stats.activeBuilds }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="row q-col-gutter-md">
        <!-- 왼쪽: 신고 처리 및 사용자 관리 -->
        <div class="col-12 col-lg-8">
          <q-card>
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="reports" label="신고 관리" icon="flag" />
              <q-tab name="users" label="사용자 관리" icon="people" />
              <q-tab name="builds" label="빌드 모니터링" icon="build" />
              <q-tab name="filters" label="콘텐츠 필터" icon="security" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated>
              <!-- 신고 관리 -->
              <q-tab-panel name="reports">
                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col">
                    <q-select
                      v-model="reportsFilter"
                      :options="reportStatusOptions"
                      label="상태 필터"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col">
                    <q-select
                      v-model="reportsAssignee"
                      :options="adminUsers"
                      label="담당자"
                      outlined
                      dense
                    />
                  </div>
                </div>

                <q-table
                  :rows="reports"
                  :columns="reportsColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="status" :props="props">
                        <q-chip :color="getStatusColor(props.row.status)" text-color="white">
                          {{ props.row.status }}
                        </q-chip>
                      </q-td>
                      <q-td key="type" :props="props">{{ props.row.type }}</q-td>
                      <q-td key="description" :props="props">{{ props.row.description }}</q-td>
                      <q-td key="createdAt" :props="props">
                        {{ formatDate(props.row.createdAt) }}
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn-group flat>
                          <q-btn flat round size="sm" icon="visibility" @click="viewReport(props.row)" />
                          <q-btn flat round size="sm" icon="check" @click="resolveReport(props.row)" />
                          <q-btn flat round size="sm" icon="close" @click="dismissReport(props.row)" />
                        </q-btn-group>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-tab-panel>

              <!-- 사용자 관리 -->
              <q-tab-panel name="users">
                <q-table
                  :rows="users"
                  :columns="usersColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="avatar" :props="props">
                        <q-avatar size="32px">
                          <img :src="props.row.avatar">
                        </q-avatar>
                      </q-td>
                      <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                      <q-td key="email" :props="props">{{ props.row.email }}</q-td>
                      <q-td key="violations" :props="props">
                        <q-chip
                          v-if="props.row.violations > 0"
                          color="negative"
                          text-color="white"
                        >
                          {{ props.row.violations }}
                        </q-chip>
                        <span v-else>0</span>
                      </q-td>
                      <q-td key="status" :props="props">
                        <q-chip :color="getUserStatusColor(props.row.status)">
                          {{ props.row.status }}
                        </q-chip>
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn-group flat>
                          <q-btn flat round size="sm" icon="edit" @click="editUser(props.row)" />
                          <q-btn
                            flat
                            round
                            size="sm"
                            :icon="props.row.status === 'banned' ? 'how_to_reg' : 'block'"
                            @click="toggleUserBan(props.row)"
                          />
                        </q-btn-group>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-tab-panel>

              <!-- 빌드 모니터링 -->
              <q-tab-panel name="builds">
                <q-table
                  :rows="builds"
                  :columns="buildsColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="status" :props="props">
                        <q-chip :color="getBuildStatusColor(props.row.status)">
                          {{ props.row.status }}
                        </q-chip>
                      </q-td>
                      <q-td key="project" :props="props">{{ props.row.project }}</q-td>
                      <q-td key="startTime" :props="props">
                        {{ formatDate(props.row.startTime) }}
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn-group flat>
                          <q-btn flat round size="sm" icon="visibility" @click="viewBuildLogs(props.row)" />
                          <q-btn
                            flat
                            round
                            size="sm"
                            icon="stop"
                            @click="stopBuild(props.row)"
                            :disable="props.row.status !== 'running'"
                          />
                        </q-btn-group>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-tab-panel>

              <!-- 콘텐츠 필터 -->
              <q-tab-panel name="filters">
                <div class="q-mb-md">
                  <q-btn color="primary" label="필터 규칙 추가" @click="showAddFilterDialog = true" />
                </div>

                <q-table
                  :rows="filterRules"
                  :columns="filterColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="type" :props="props">{{ props.row.type }}</q-td>
                      <q-td key="pattern" :props="props">{{ props.row.pattern }}</q-td>
                      <q-td key="action" :props="props">
                        <q-chip :color="getActionColor(props.row.action)">
                          {{ props.row.action }}
                        </q-chip>
                      </q-td>
                      <q-td key="isActive" :props="props">
                        <q-toggle v-model="props.row.isActive" />
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn-group flat>
                          <q-btn flat round size="sm" icon="edit" @click="editFilter(props.row)" />
                          <q-btn flat round size="sm" icon="delete" @click="deleteFilter(props.row)" />
                        </q-btn-group>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>

        <!-- 오른쪽: 알림 및 로그 -->
        <div class="col-12 col-lg-4">
          <q-card>
            <q-card-section>
              <div class="text-h6">최근 활동</div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-none">
              <q-list separator>
                <q-item v-for="activity in recentActivities" :key="activity.id">
                  <q-item-section avatar>
                    <q-icon :name="getActivityIcon(activity.type)" :color="getActivityColor(activity.type)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ activity.description }}</q-item-label>
                    <q-item-label caption>{{ formatDate(activity.timestamp) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 필터 규칙 추가/수정 다이얼로그 -->
    <q-dialog v-model="showAddFilterDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">필터 규칙 {{ editingFilter ? '수정' : '추가' }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="newFilter.type"
            :options="filterTypeOptions"
            label="필터 유형"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newFilter.pattern"
            label="패턴"
            outlined
            class="q-mb-md"
          />
          <q-select
            v-model="newFilter.action"
            :options="filterActionOptions"
            label="작업"
            outlined
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="primary" v-close-popup />
          <q-btn flat label="저장" color="primary" @click="saveFilter" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Report, ContentFilterRule, AdminUser } from 'components/models'

const activeTab = ref('reports')
const showAddFilterDialog = ref(false)
const editingFilter = ref<ContentFilterRule | null>(null)

// 샘플 데이터
const stats = ref({
  newReports: 12,
  pendingReports: 5,
  bannedUsers: 3,
  activeBuilds: 8
})

const reportsFilter = ref('all')
const reportsAssignee = ref(null)

const reports = ref<Report[]>([
  {
    id: '1',
    type: 'post',
    targetId: 'post-1',
    reporterId: 'user-1',
    reason: 'inappropriate',
    description: '부적절한 내용이 포함되어 있습니다.',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

const users = ref([
  {
    id: '1',
    name: '김개발',
    email: 'user@example.com',
    avatar: 'https://placekitten.com/100/100',
    violations: 2,
    status: 'active'
  }
])

const builds = ref([
  {
    id: '1',
    project: '프로젝트 A',
    status: 'running',
    startTime: new Date().toISOString()
  }
])

const filterRules = ref<ContentFilterRule[]>([
  {
    id: '1',
    type: 'keyword',
    pattern: '부적절한 단어',
    action: 'flag',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date().toISOString()
  }
])

const recentActivities = ref([
  {
    id: '1',
    type: 'report',
    description: '새로운 신고가 접수되었습니다.',
    timestamp: new Date().toISOString()
  }
])

const newFilter = ref({
  type: 'keyword',
  pattern: '',
  action: 'flag'
})

// 컬럼 정의
const reportsColumns = [
  { name: 'status', label: '상태', field: 'status', sortable: true },
  { name: 'type', label: '유형', field: 'type', sortable: true },
  { name: 'description', label: '설명', field: 'description' },
  { name: 'createdAt', label: '생성일', field: 'createdAt', sortable: true },
  { name: 'actions', label: '작업', field: 'actions' }
]

const usersColumns = [
  { name: 'avatar', label: '', field: 'avatar' },
  { name: 'name', label: '이름', field: 'name', sortable: true },
  { name: 'email', label: '이메일', field: 'email', sortable: true },
  { name: 'violations', label: '위반', field: 'violations', sortable: true },
  { name: 'status', label: '상태', field: 'status', sortable: true },
  { name: 'actions', label: '작업', field: 'actions' }
]

const buildsColumns = [
  { name: 'status', label: '상태', field: 'status', sortable: true },
  { name: 'project', label: '프로젝트', field: 'project', sortable: true },
  { name: 'startTime', label: '시작 시간', field: 'startTime', sortable: true },
  { name: 'actions', label: '작업', field: 'actions' }
]

const filterColumns = [
  { name: 'type', label: '유형', field: 'type', sortable: true },
  { name: 'pattern', label: '패턴', field: 'pattern' },
  { name: 'action', label: '작업', field: 'action', sortable: true },
  { name: 'isActive', label: '활성화', field: 'isActive', sortable: true },
  { name: 'actions', label: '작업', field: 'actions' }
]

const reportStatusOptions = [
  { label: '전체', value: 'all' },
  { label: '대기 중', value: 'pending' },
  { label: '검토 중', value: 'in_review' },
  { label: '해결됨', value: 'resolved' },
  { label: '기각됨', value: 'dismissed' }
]

const filterTypeOptions = [
  { label: '키워드', value: 'keyword' },
  { label: '정규식', value: 'regex' },
  { label: 'AI', value: 'ai' }
]

const filterActionOptions = [
  { label: '플래그', value: 'flag' },
  { label: '차단', value: 'block' },
  { label: '삭제', value: 'delete' }
]

const adminUsers = [
  { label: '전체', value: null },
  { label: '관리자 A', value: 'admin-1' },
  { label: '관리자 B', value: 'admin-2' }
]

// 유틸리티 함수
function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'warning'
    case 'in_review': return 'info'
    case 'resolved': return 'positive'
    case 'dismissed': return 'grey'
    default: return 'grey'
  }
}

function getUserStatusColor(status: string) {
  switch (status) {
    case 'active': return 'positive'
    case 'warning': return 'warning'
    case 'banned': return 'negative'
    default: return 'grey'
  }
}

function getBuildStatusColor(status: string) {
  switch (status) {
    case 'running': return 'info'
    case 'success': return 'positive'
    case 'failed': return 'negative'
    default: return 'grey'
  }
}

function getActionColor(action: string) {
  switch (action) {
    case 'flag': return 'warning'
    case 'block': return 'negative'
    case 'delete': return 'negative'
    default: return 'grey'
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'report': return 'flag'
    case 'user': return 'person'
    case 'build': return 'build'
    case 'filter': return 'security'
    default: return 'circle'
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'report': return 'warning'
    case 'user': return 'primary'
    case 'build': return 'positive'
    case 'filter': return 'info'
    default: return 'grey'
  }
}

// 액션 함수
function viewReport(report: Report) {
  console.log('View report:', report)
}

function resolveReport(report: Report) {
  console.log('Resolve report:', report)
}

function dismissReport(report: Report) {
  console.log('Dismiss report:', report)
}

function editUser(user: any) {
  console.log('Edit user:', user)
}

function toggleUserBan(user: any) {
  console.log('Toggle user ban:', user)
}

function viewBuildLogs(build: any) {
  console.log('View build logs:', build)
}

function stopBuild(build: any) {
  console.log('Stop build:', build)
}

function editFilter(filter: ContentFilterRule) {
  editingFilter.value = filter
  newFilter.value = { ...filter }
  showAddFilterDialog.value = true
}

function deleteFilter(filter: ContentFilterRule) {
  console.log('Delete filter:', filter)
}

function saveFilter() {
  if (editingFilter.value) {
    console.log('Update filter:', newFilter.value)
  } else {
    console.log('Add filter:', newFilter.value)
  }
  newFilter.value = { type: 'keyword', pattern: '', action: 'flag' }
  editingFilter.value = null
}
</script>

<style lang="scss" scoped>
.admin-dashboard {
  max-width: 1600px;
  margin: 0 auto;
}
</style>
