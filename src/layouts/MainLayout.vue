
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar v-if="isLoggedIn">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title @click="goToMain" class="cursor-pointer">
          꿈즈
        </q-toolbar-title>

          <q-btn flat round dense icon="notifications">
            <q-badge color="red" floating>
              {{ unreadCount }}
            </q-badge>
            <q-menu anchor="bottom right" self="top right" :offset="[0, 8]">
              <q-card style="width: 360px; max-height: 60vh;">
                <q-card-section class="row items-center justify-between">
                  <div class="text-subtitle2">알림</div>
                  <q-btn
                    size="sm"
                    flat
                    dense
                    icon="done_all"
                    label="모두 읽음"
                    :disable="unreadCount === 0"
                    @click="markAllRead"
                  />
                </q-card-section>

                <q-separator />

                <q-scroll-area style="height: 48vh">
                  <q-list separator>
                    <template v-if="notifications.length">
                      <q-item
                        v-for="n in notifications"
                        :key="n.id"
                        clickable
                        v-close-popup
                        @click="openNotification(n)"
                      >
                        <q-item-section avatar>
                          <q-icon :name="iconFor(n)" :color="n.read ? 'grey-6' : 'primary'" />
                        </q-item-section>

                        <q-item-section>
                          <q-item-label class="ellipsis">{{ n.title }}</q-item-label>
                          <q-item-label caption class="text-grey-7 two-lines">
                            {{ n.message }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section side top>
                          <q-item-label caption>{{ formatTime(n.createdAt) }}</q-item-label>
                          <q-badge v-if="!n.read" color="primary" rounded class="q-mt-xs" />
                        </q-item-section>
                      </q-item>
                    </template>

                    <template v-else>
                      <div class="column items-center q-pa-md text-grey">
                        <q-icon name="notifications_off" size="sm" />
                        <div class="q-mt-sm">새 알림이 없습니다</div>
                      </div>
                    </template>
                  </q-list>
                </q-scroll-area>

                <q-separator />

                <q-card-actions align="right">
                  <q-btn flat size="sm" label="모든 알림 보기" @click="goAll" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-menu>

          </q-btn>
          <q-btn-dropdown flat dense>
            <template v-slot:label>
              <q-avatar size="28px">
                <img src="https://cdn.quasar.dev/img/avatar.png">
              </q-avatar>
            </template>
            <q-list>
              <q-item clickable v-close-popup to="/settings">
                <q-item-section>설정</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section>로그아웃</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      v-if="isLoggedIn"
    >
      <q-list>
        <q-item-label header>
          메뉴
        </q-item-label>

        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>대시보드</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/idea/new">
          <q-item-section avatar>
            <q-icon name="add_circle" />
          </q-item-section>
          <q-item-section>새 프로젝트</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/community">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>커뮤니티</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'


interface UiNotification {
  id: string
  title: string
  message: string
  createdAt: string // ISO
  read: boolean
  type?: 'system' | 'comment' | 'issue' | 'mention'
  link?: string // 라우팅 경로(선택)
}


const auth = useAuthStore()

const router = useRouter()
const leftDrawerOpen = ref(false)

// 로그인 상태 체크 (실제로는 상태 관리 라이브러리나 컴포지션 함수를 사용)
const isLoggedIn = computed(() => auth.isAuthenticated)



// 예시 데이터: 실제로는 API/스토어 연동
const notifications = ref<UiNotification[]>([
    {
      id: 'n001',
      title: '새 댓글',
      message: '프로젝트 채팅에 새 메시지가 도착했습니다.',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
      read: false,
      type: 'comment',
      link: '/projects/sample'
    },
    {
      id: 'n002',
      title: '이슈가 할당되었습니다',
      message: '#42 로그인 오류 이슈가 당신에게 배정되었어요.',
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8분 전
      read: false,
      type: 'issue',
      link: '/projects/sample'
    },
    {
      id: 'n003',
      title: '멘션',
      message: '@you 대시보드 레이아웃 확인 부탁드립니다.',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15분 전
      read: false,
      type: 'mention',
      link: '/projects/sample'
    },
    {
      id: 'n004',
      title: '시스템 알림',
      message: '빌드가 성공적으로 완료되었습니다.',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45분 전
      read: true,
      type: 'system',
      link: '/projects/sample'
    },
    {
      id: 'n005',
      title: '이슈 상태 변경',
      message: '#105 결제 오류 이슈가 in_progress로 변경되었습니다.',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2시간 전
      read: false,
      type: 'issue',
      link: '/projects/sample'
    },
    {
      id: 'n006',
      title: '새 스크린이 추가되었습니다',
      message: 'Onboarding.png가 업로드되었습니다.',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5시간 전
      read: true,
      type: 'system',
      link: '/projects/sample'
    },
    {
      id: 'n007',
      title: '팀 초대가 수락되었습니다',
      message: '새 멤버가 프로젝트에 합류했습니다.',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12시간 전
      read: true,
      type: 'system',
      link: '/projects/sample'
    },
    {
      id: 'n008',
      title: '멘션',
      message: '@you 디자인 가이드 PR 리뷰 부탁해요.',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1일 전
      read: true,
      type: 'mention',
      link: '/projects/sample'
    },
    {
      id: 'n009',
      title: '결제 알림',
      message: '결제 수단 만료 예정: 30일 이내 갱신 필요.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2일 전
      read: true,
      type: 'system',
      link: '/projects/sample'
    },
    {
      id: 'n010',
      title: '새 댓글',
      message: '이슈 #88에 새로운 논의가 있습니다.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3일 전
      read: true,
      type: 'comment',
      link: '/projects/sample'
    },
    {
      id: 'n011',
      title: '이슈가 종료되었습니다',
      message: '#73 성능 최적화 작업이 closed로 변경되었습니다.',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // 7일 전
      read: true,
      type: 'issue',
      link: '/projects/sample'
    },
    {
      id: 'n012',
      title: '알림 설정 안내',
      message: '원치 않는 알림은 설정에서 끌 수 있어요.',
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), // 14일 전
      read: true,
      type: 'system',
      link: '/projects/sample'
    },
    {
      id: 'n013',
      title: '새 스크린 코멘트',
      message: 'Home.png에 피드백이 남겨졌습니다.',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), // 30일 전
      read: true,
      type: 'comment',
      link: '/projects/sample'
    }
  ]
)

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function markAllRead() {
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))
}

function openNotification(n: UiNotification) {
  if (!n.read) n.read = true
  if (n.link) router.push(n.link)
}

function iconFor(n: UiNotification) {
  switch (n.type) {
    case 'issue': return 'bug_report'
    case 'comment': return 'chat_bubble'
    case 'mention': return 'alternate_email'
    case 'system': return 'notifications'
    default: return 'notifications'
  }
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const diffSec = (Date.now() - d.getTime()) / 1000
  if (diffSec < 60) return '방금 전'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`
  return d.toLocaleDateString()
}

function goAll() {
  // 전체 알림 페이지/섹션으로 이동
  router.push({ name: 'project-settings-notifications', params: { projectId: '<PROJECT_ID>' } })
}


const goToMain = () => {
  router.push('/dashboard')
}

const handleLogout = () => {
  auth.clearAuth()

  router.push('/login')
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="scss" scoped>
.two-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.q-toolbar-title {
  font-size: 1.5rem;
  font-weight: bold;

  &:hover {
    opacity: 0.8;
  }
}
</style>
