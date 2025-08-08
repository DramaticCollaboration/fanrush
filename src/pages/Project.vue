<template>
  <q-page class="project-page">
    <!-- 프로젝트 헤더 -->
    <div class="project-header bg-primary text-white q-pa-md">
      <div class="container">
        <div class="row items-center justify-between">
          <div class="col-8">
            <h2 class="text-h4 q-my-none">{{ project.name }}</h2>
            <p class="text-h6 q-mt-sm q-mb-none">{{ project.summary }}</p>
          </div>
          <div class="col-auto">
            <q-btn-group>
              <q-btn color="white" text-color="primary" label="팀원 초대" icon="person_add" @click="showInviteDialog = true" />
              <q-btn color="white" text-color="primary" label="프로젝트 설정" icon="settings" />
            </q-btn-group>
          </div>
        </div>
      </div>
    </div>

    <div class="container q-pa-md">
      <!-- 화면 미리보기 캐러셀 -->
      <div class="row q-mb-lg">
        <div class="col-12">
          <q-carousel
            v-model="slide"
            animated
            arrows
            navigation
            infinite
            height="400px"
          >
            <q-carousel-slide
              v-for="screen in project.screens"
              :key="screen.id"
              :name="screen.id"
              :img-src="screen.imageUrl"
            >
              <div class="absolute-bottom custom-caption">
                <div class="text-h6">{{ screen.title }}</div>
                <div class="text-subtitle1">{{ screen.description }}</div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="row q-col-gutter-md">
        <!-- 왼쪽: 프로젝트 정보 탭 -->
        <div class="col-12 col-md-8">
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
              <q-tab name="overview" label="개요" icon="info" />
              <q-tab name="screens" label="화면" icon="web" />
              <q-tab name="specs" label="기능 명세" icon="description" />
              <q-tab name="issues" label="이슈" icon="bug_report" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated>
              <q-tab-panel name="overview">
                <div class="text-body1" v-html="project.description"></div>
              </q-tab-panel>

              <q-tab-panel name="screens">
                <div class="row q-col-gutter-md">
                  <div v-for="screen in project.screens" :key="screen.id" class="col-12 col-sm-6">
                    <q-card>
                      <q-img :src="screen.imageUrl" />
                      <q-card-section>
                        <div class="text-h6">{{ screen.title }}</div>
                        <p>{{ screen.description }}</p>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="specs">
                <div class="text-body1" v-html="project.specification"></div>
              </q-tab-panel>

              <q-tab-panel name="issues">
                <q-list bordered separator>
                  <q-item v-for="issue in project.issues" :key="issue.id" clickable v-ripple>
                    <q-item-section avatar>
                      <q-icon :name="issueStatusIcon(issue.status)" :color="issueStatusColor(issue.status)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ issue.title }}</q-item-label>
                      <q-item-label caption>
                        {{ formatDate(issue.createdAt) }} 생성됨
                        <template v-if="issue.assignee">
                          • 담당: {{ issue.assignee.name }}
                        </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge :color="issueStatusColor(issue.status)">
                        {{ issueStatusLabel(issue.status) }}
                      </q-badge>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>

        <!-- 오른쪽: 팀 정보 및 채팅 -->
        <div class="col-12 col-md-4">
          <!-- 팀 멤버 -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">팀 구성원</div>
            </q-card-section>
            <q-list>
              <q-item v-for="member in project.team" :key="member.id">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="member.avatar">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ member.name }}</q-item-label>
                  <q-item-label caption>{{ member.role }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="isOwner">
                  <q-btn flat round icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="changeRole(member)">
                          <q-item-section>역할 변경</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="removeMember(member)">
                          <q-item-section>제거</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <!-- 채팅 -->
          <q-card class="chat-card">
            <q-card-section>
              <div class="text-h6">팀 채팅</div>
            </q-card-section>
            <q-card-section class="chat-messages q-pa-none">
              <q-scroll-area style="height: 300px">
                <q-list padding>
                  <q-item v-for="message in project.chat" :key="message.id">
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="message.userAvatar">
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ message.userName }}</q-item-label>
                      <q-item-label caption>{{ message.content }}</q-item-label>
                      <q-item-label caption>{{ formatDate(message.timestamp) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </q-card-section>
            <q-card-section>
              <q-input
                v-model="newMessage"
                label="메시지 입력"
                dense
                @keyup.enter="sendMessage"
              >
                <template v-slot:after>
                  <q-btn round dense flat icon="send" @click="sendMessage" />
                </template>
              </q-input>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 초대 다이얼로그 -->
    <q-dialog v-model="showInviteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">팀원 초대</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="inviteEmail" label="이메일" type="email" />
          <q-select
            v-model="inviteRole"
            :options="roleOptions"
            label="역할"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="primary" v-close-popup />
          <q-btn flat label="초대" color="primary" @click="sendInvite" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TeamMember, ProjectScreen, ChatMessage, ProjectIssue } from 'components/models'

const slide = ref('')
const activeTab = ref('overview')
const showInviteDialog = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('viewer')
const newMessage = ref('')

const roleOptions = [
  { label: '관리자', value: 'owner' },
  { label: '편집자', value: 'editor' },
  { label: '열람자', value: 'viewer' }
]

// 샘플 프로젝트 데이터
const project = ref({
  name: '꿈즈 프로젝트',
  summary: 'AI 기반 웹 서비스 개발 플랫폼',
  description: `<p>꿈즈는 AI를 활용하여 웹 서비스 개발을 도와주는 혁신적인 플랫폼입니다.</p>
                <p>주요 기능:</p>
                <ul>
                  <li>AI 기반 코드 생성</li>
                  <li>실시간 협업</li>
                  <li>자동 배포</li>
                </ul>`,
  specification: '상세 기능 명세...',
  screens: [
    {
      id: '1',
      title: '메인 대시보드',
      imageUrl: 'https://placehold.co/1200x600',
      description: '프로젝트 현황을 한눈에 볼 수 있는 대시보드'
    },
    {
      id: '2',
      title: 'AI 코드 에디터',
      imageUrl: 'https://placehold.co/1200x601',
      description: 'AI 지원 코드 편집기'
    }
  ] as ProjectScreen[],
  team: [
    {
      id: '1',
      name: '김개발',
      avatar: 'https://placehold.co/100x100',
      role: 'owner',
      joinedAt: '2024-01-01'
    }
  ] as TeamMember[],
  chat: [] as ChatMessage[],
  issues: [
    {
      id: '1',
      title: 'AI 응답 속도 개선 필요',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as ProjectIssue[]
})

const isOwner = computed(() => true) // 실제로는 현재 사용자 권한 체크

function issueStatusIcon(status: string) {
  switch (status) {
    case 'open': return 'error_outline'
    case 'in_progress': return 'hourglass_empty'
    case 'closed': return 'check_circle_outline'
    default: return 'help_outline'
  }
}

function issueStatusColor(status: string) {
  switch (status) {
    case 'open': return 'negative'
    case 'in_progress': return 'warning'
    case 'closed': return 'positive'
    default: return 'grey'
  }
}

function issueStatusLabel(status: string) {
  switch (status) {
    case 'open': return '미해결'
    case 'in_progress': return '진행중'
    case 'closed': return '해결됨'
    default: return '알 수 없음'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function sendMessage() {
  if (!newMessage.value.trim()) return

  project.value.chat.push({
    id: Date.now().toString(),
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://placehold.co/100x100',
    content: newMessage.value,
    timestamp: new Date().toISOString()
  })

  newMessage.value = ''
}

function changeRole(member: TeamMember) {
  // 역할 변경 로직
  console.log('Change role for member:', member)
}

function removeMember(member: TeamMember) {
  // 멤버 제거 로직
  console.log('Remove member:', member)
}

function sendInvite() {
  // 초대 로직
  console.log('Invite sent to:', inviteEmail.value, 'with role:', inviteRole.value)
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  margin-bottom: 2rem;
}

.custom-caption {
  text-align: center;
  padding: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
}

.chat-card {
  .chat-messages {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style>
