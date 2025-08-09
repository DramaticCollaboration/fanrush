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
              <q-btn color="white" text-color="primary" label="프로젝트 설정" icon="settings" @click="showSettings = true"/>
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
                <div class="text-body1" v-html="descriptionHtml"></div>
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
                <div class="text-body1" v-html="specHtml"></div>
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
    <ProjectSettingsDialog
      v-model="showSettings"
      :project-id="currentProjectId"
      @saved="afterSaved"
    />

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ProjectSettingsDialog from '@/components/ProjectSettingsDialog.vue'


import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

import type { Project, TeamMember, ProjectScreen, ChatMessage, ProjectIssue } from 'components/models'

const slide = ref('')
const activeTab = ref('overview')
const showInviteDialog = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('viewer')
const newMessage = ref('')


const showSettings = ref(false)
const currentProjectId = 'prj-<ID>' // 실제 프로젝트 ID로 대체

function afterSaved() {
  // 저장 후 목록/헤더 등 갱신이 필요하면 여기서 처리
  // e.g., 프로젝트 이름/가시성 갱신
}


const roleOptions = [
  { label: '관리자', value: 'owner' },
  { label: '편집자', value: 'editor' },
  { label: '열람자', value: 'viewer' }
]

const sampleIssues: ProjectIssue[] = [
  {
    id: '1',
    title: '로그인 실패 시 에러 메시지 정제',
    status: 'open',
    assignee: {
      id: '1',
      name: '김개발',
      avatar: 'https://placehold.co/100x100',
      role: 'owner',
      joinedAt: '2024-01-01'
    },
    createdAt: '2025-08-01T09:00:00.000Z',
    updatedAt: '2025-08-01T09:30:00.000Z'
  },
  {
    id: '2',
    title: '대시보드 위젯 로딩 지연',
    status: 'in_progress',
    assignee: {
      id: '3',
      name: '박테스터',
      avatar: 'https://placehold.co/100x100',
      role: 'viewer',
      joinedAt: '2024-03-05'
    },
    createdAt: '2025-08-02T03:20:00.000Z',
    updatedAt: '2025-08-03T10:10:00.000Z'
  },
  {
    id: '3',
    title: '이미지 업로드 10MB 이상 실패',
    status: 'open',
    assignee: {
      id: '2',
      name: '이기획',
      avatar: 'https://placehold.co/100x100',
      role: 'editor',
      joinedAt: '2024-02-10'
    },
    createdAt: '2025-08-02T11:15:00.000Z',
    updatedAt: '2025-08-02T11:15:00.000Z'
  },
  {
    id: '4',
    title: '모바일 Safari에서 스크롤 버그',
    status: 'open',
    createdAt: '2025-08-03T08:00:00.000Z',
    updatedAt: '2025-08-03T08:00:00.000Z'
  },
  {
    id: '5',
    title: '알림 토글 저장 안됨',
    status: 'closed',
    assignee: {
      id: '1',
      name: '김개발',
      avatar: 'https://placehold.co/100x100',
      role: 'owner',
      joinedAt: '2024-01-01'
    },
    createdAt: '2025-07-28T14:00:00.000Z',
    updatedAt: '2025-07-29T09:00:00.000Z'
  },
  {
    id: '6',
    title: '다크모드에서 텍스트 대비 부족',
    status: 'in_progress',
    assignee: {
      id: '2',
      name: '이기획',
      avatar: 'https://placehold.co/100x100',
      role: 'editor',
      joinedAt: '2024-02-10'
    },
    createdAt: '2025-08-04T07:45:00.000Z',
    updatedAt: '2025-08-05T13:25:00.000Z'
  },
  {
    id: '7',
    title: 'AI 코드 에디터 자동완성 느림',
    status: 'open',
    createdAt: '2025-08-05T18:40:00.000Z',
    updatedAt: '2025-08-05T18:40:00.000Z'
  },
  {
    id: '8',
    title: '프로젝트 초대 이메일 중복 발송',
    status: 'closed',
    assignee: {
      id: '3',
      name: '박테스터',
      avatar: 'https://placehold.co/100x100',
      role: 'viewer',
      joinedAt: '2024-03-05'
    },
    createdAt: '2025-07-30T10:05:00.000Z',
    updatedAt: '2025-07-31T16:22:00.000Z'
  },
  {
    id: '9',
    title: '빌드 로그 스크롤 고정 기능 추가',
    status: 'in_progress',
    assignee: {
      id: '1',
      name: '김개발',
      avatar: 'https://placehold.co/100x100',
      role: 'owner',
      joinedAt: '2024-01-01'
    },
    createdAt: '2025-08-06T09:12:00.000Z',
    updatedAt: '2025-08-07T02:01:00.000Z'
  },
  {
    id: '10',
    title: '캐러셀 첫 슬라이드 미표시',
    status: 'closed',
    assignee: {
      id: '1',
      name: '김개발',
      avatar: 'https://placehold.co/100x100',
      role: 'owner',
      joinedAt: '2024-01-01'
    },
    createdAt: '2025-08-06T12:00:00.000Z',
    updatedAt: '2025-08-06T12:30:00.000Z'
  },
  {
    id: '11',
    title: '검색 결과 페이징 불일치',
    status: 'open',
    assignee: {
      id: '3',
      name: '박테스터',
      avatar: 'https://placehold.co/100x100',
      role: 'viewer',
      joinedAt: '2024-03-05'
    },
    createdAt: '2025-08-07T08:33:00.000Z',
    updatedAt: '2025-08-07T08:33:00.000Z'
  },
  {
    id: '12',
    title: '팀 채팅에서 이모지 깨짐',
    status: 'in_progress',
    assignee: {
      id: '2',
      name: '이기획',
      avatar: 'https://placehold.co/100x100',
      role: 'editor',
      joinedAt: '2024-02-10'
    },
    createdAt: '2025-08-07T21:10:00.000Z',
    updatedAt: '2025-08-08T06:55:00.000Z'
  },
  {
    id: '13',
    title: '접근성: 키보드 포커스 링 누락',
    status: 'open',
    createdAt: '2025-08-08T15:00:00.000Z',
    updatedAt: '2025-08-08T15:00:00.000Z'
  }
]

const sampleChat: ChatMessage[] = [
  {
    id: 'cm-001',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://placehold.co/100x100?u=1',
    content: '안녕하세요! 오늘 일정 공유드립니다.',
    timestamp: '2025-08-09T09:00:00.000Z'
  },
  {
    id: 'cm-002',
    userId: '2',
    userName: '이기획',
    userAvatar: 'https://placehold.co/100x100?u=2',
    content: '어제 회의록 확인했습니다. 대시보드 우선 진행 맞죠?',
    timestamp: '2025-08-09T09:02:15.000Z'
  },
  {
    id: 'cm-003',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://placehold.co/100x100?u=1',
    content: '네, 오늘은 대시보드 위젯 최적화부터 들어가겠습니다. 🚀',
    timestamp: '2025-08-09T09:03:40.000Z'
  },
  {
    id: 'cm-004',
    userId: '3',
    userName: '박테스터',
    userAvatar: 'https://placehold.co/100x100?u=3',
    content: '테스트 환경 재배포 완료됐습니다. 새로운 빌드로 확인할게요.',
    timestamp: '2025-08-09T09:05:10.000Z'
  },
  {
    id: 'cm-005',
    userId: '4',
    userName: '최디자이너',
    userAvatar: 'https://placehold.co/100x100?u=4',
    content: '대시보드 카드 간격을 16px로 맞춰주세요. 가이드 업데이트했습니다.',
    timestamp: '2025-08-09T09:06:55.000Z'
  },
  {
    id: 'cm-006',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://placehold.co/100x100?u=1',
    content: '확인했습니다. 스타일 수정 후 PR 올리겠습니다.',
    timestamp: '2025-08-09T09:10:20.000Z'
  },
  {
    id: 'cm-007',
    userId: '3',
    userName: '박테스터',
    userAvatar: 'https://placehold.co/100x100?u=3',
    content: '모바일 Safari에서 스크롤 끊김 이슈 여전히 재현됩니다. 영상 첨부했어요.',
    timestamp: '2025-08-09T09:12:48.000Z'
  },
  {
    id: 'cm-008',
    userId: '2',
    userName: '이기획',
    userAvatar: 'https://placehold.co/100x100?u=2',
    content: '스크롤 이슈는 이번 스프린트에 포함하겠습니다.',
    timestamp: '2025-08-09T09:14:03.000Z'
  },
  {
    id: 'cm-009',
    userId: '4',
    userName: '최디자이너',
    userAvatar: 'https://placehold.co/100x100?u=4',
    content: '컬러 토큰 업데이트했습니다. 다크모드 대비도 개선했어요. 🎨',
    timestamp: '2025-08-09T09:16:27.000Z'
  },
  {
    id: 'cm-010',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://placehold.co/100x100?u=1',
    content: 'AI 에디터 자동완성 캐시 적용해봤습니다. 체감 속도 한번 봐주세요.',
    timestamp: '2025-08-09T09:20:00.000Z'
  },
  {
    id: 'cm-011',
    userId: '3',
    userName: '박테스터',
    userAvatar: 'https://placehold.co/100x100?u=3',
    content: '신규 빌드로 재테스트 중입니다. 자동완성 확실히 빨라졌네요! ✅',
    timestamp: '2025-08-09T09:28:42.000Z'
  },
  {
    id: 'cm-012',
    userId: '2',
    userName: '이기획',
    userAvatar: 'https://placehold.co/100x100?u=2',
    content: '좋습니다. 관련 이슈 상태를 진행중으로 변경할게요.',
    timestamp: '2025-08-09T09:30:05.000Z'
  },
  {
    id: 'cm-013',
    userId: '1',
    userName: '김개발',
    userAvatar: 'https://placehold.co/100x100?u=1',
    content: '오늘 목표: 대시보드 성능 개선 + 스크롤 이슈 원인 파악. 모두 파이팅!',
    timestamp: '2025-08-09T09:35:30.000Z'
  }
]

const sampleTeam: TeamMember[] = [
  {
    id: 'u-001',
    name: '김개발',
    avatar: 'https://placehold.co/100x100?u=dev',
    role: 'owner',
    joinedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'u-002',
    name: '이기획',
    avatar: 'https://placehold.co/100x100?u=pm',
    role: 'editor',
    joinedAt: '2024-02-10T09:30:00.000Z'
  },
  {
    id: 'u-003',
    name: '박테스터',
    avatar: 'https://placehold.co/100x100?u=qa',
    role: 'viewer',
    joinedAt: '2024-03-05T12:15:00.000Z'
  },
  {
    id: 'u-004',
    name: '최디자이너',
    avatar: 'https://placehold.co/100x100?u=design',
    role: 'editor',
    joinedAt: '2024-04-20T08:00:00.000Z'
  },
  {
    id: 'u-005',
    name: '조마케터',
    avatar: 'https://placehold.co/100x100?u=marketing',
    role: 'viewer',
    joinedAt: '2024-05-12T15:45:00.000Z'
  }
]

const sampleScreens: ProjectScreen[] = [
  {
    id: 'scr-001',
    title: '온보딩',
    imageUrl: 'https://placehold.co/800x600?text=Screen+01',
    description: '앱 소개와 핵심 기능을 간단히 안내하는 온보딩 화면'
  },
  {
    id: 'scr-002',
    title: '로그인',
    imageUrl: 'https://placehold.co/800x600?text=Screen+02',
    description: '이메일/소셜 계정으로 로그인하는 화면'
  },
  {
    id: 'scr-003',
    title: '대시보드',
    imageUrl: 'https://placehold.co/800x600?text=Screen+03',
    description: '프로젝트 요약, 진행 현황 카드, 최근 활동을 보여주는 메인 대시보드'
  },
  {
    id: 'scr-004',
    title: '알림 센터',
    imageUrl: 'https://placehold.co/800x600?text=Screen+04',
    description: '읽지 않은 알림과 시스템 업데이트를 확인하는 화면'
  },
  {
    id: 'scr-005',
    title: '프로젝트 목록',
    imageUrl: 'https://placehold.co/800x600?text=Screen+05',
    description: '사용자 소유/참여 중인 프로젝트를 카드/리스트로 표시'
  },
  {
    id: 'scr-006',
    title: '프로젝트 상세',
    imageUrl: 'https://placehold.co/800x600?text=Screen+06',
    description: '프로젝트 개요, 팀, 스크린, 이슈 등 핵심 정보를 요약'
  },
  {
    id: 'scr-007',
    title: '이슈 목록',
    imageUrl: 'https://placehold.co/800x600?text=Screen+07',
    description: '상태별 필터와 검색이 가능한 이슈 리스트 화면'
  },
  {
    id: 'scr-008',
    title: '이슈 상세',
    imageUrl: 'https://placehold.co/800x600?text=Screen+08',
    description: '이슈 설명, 담당자, 활동 로그, 댓글을 확인/편집'
  },
  {
    id: 'scr-009',
    title: '팀 관리',
    imageUrl: 'https://placehold.co/800x600?text=Screen+09',
    description: '팀 멤버 역할 변경 및 초대/삭제를 수행'
  },
  {
    id: 'scr-010',
    title: '채팅',
    imageUrl: 'https://placehold.co/800x600?text=Screen+10',
    description: '프로젝트별 실시간 대화와 파일 공유를 제공'
  },
  {
    id: 'scr-011',
    title: '설정 - 프로필',
    imageUrl: 'https://placehold.co/800x600?text=Screen+11',
    description: '사용자 프로필 정보와 아바타 변경'
  },
  {
    id: 'scr-012',
    title: '설정 - 알림',
    imageUrl: 'https://placehold.co/800x600?text=Screen+12',
    description: '이메일/인앱/푸시 알림 수신 설정 관리'
  },
  {
    id: 'scr-013',
    title: '분석 리포트',
    imageUrl: 'https://placehold.co/800x600?text=Screen+13',
    description: '트래픽, 전환, 성능 지표를 차트로 시각화'
  },
  {
    id: 'scr-014',
    title: '결제/청구',
    imageUrl: 'https://placehold.co/800x600?text=Screen+14',
    description: '플랜, 결제 수단, 청구 내역 확인 및 변경'
  },
  {
    id: 'scr-015',
    title: '도움말 센터',
    imageUrl: 'https://placehold.co/800x600?text=Screen+15',
    description: '가이드, 자주 묻는 질문, 문의 링크 제공'
  },
  {
    id: 'scr-016',
    title: '404 Not Found',
    imageUrl: 'https://placehold.co/800x600?text=Screen+16',
    description: '존재하지 않는 경로 접근 시 보여주는 오류 화면'
  }
]

const sampleSpecification: string = `
# 프로젝트 스펙: 협업형 프로젝트 관리 앱
- 버전: 1.0.0
- 최종 수정: 2025-08-09
- 문서 소유: <OWNER_NAME>
- 대상 플랫폼: 웹(데스크톱/모바일 반응형)

## 1. 개요
팀이 프로젝트를 생성하고, 스크린(화면)과 이슈를 관리하며, 실시간 채팅으로 협업하는 앱입니다. 알림, 분석, 결제/청구, 도움말 등 운영에 필요한 기능을 제공합니다.

## 2. 목표/비범위
- 목표: 프로젝트 가시성 향상, 커뮤니케이션 비용 감소, 변경 추적 용이성 확보
- 비범위: 외부 서드파티형 고급 리포팅, 오프라인 모드

## 3. 사용자 역할과 권한
- Owner: 모든 권한(프로젝트/팀/결제/설정)
- Editor: 콘텐츠 편집(스크린, 이슈, 채팅), 팀 초대는 불가
- Viewer: 읽기 전용, 채팅 참여 가능
권한 규칙 예시: 이슈 생성(Owner/Editor), 이슈 상태 변경(Owner/Editor), 팀 역할 변경(Owner)

## 4. 주요 기능 요구사항
- 온보딩/로그인: 이메일 또는 소셜 로그인(이메일 인증 필수)
- 대시보드: 진행중 이슈/최근 채팅/빌드 상태 요약 위젯
- 프로젝트: 목록/상세, 스크린 16개까지 썸네일 그리드, 검색/필터
- 이슈: 생성/수정/상태 변경(open/in_progress/closed), 담당자 지정, 활동 로그
- 팀 관리: 멤버 초대/역할 변경/삭제, 아바타/입사일 노출
- 채팅: 프로젝트 단위 메시지 스트림, 이미지/파일 첨부(선택), 타임스탬프 정렬
- 설정: 프로필, 알림 설정(이메일/인앱/푸시)
- 분석: 페이지뷰, 빈도 높은 액션(이슈 생성, 메시지 전송)
- 결제/청구: 플랜 변경, 결제 수단 관리, 청구 내역 조회
- 도움말: 가이드/FAQ/문의 링크
- 오류 페이지: 404, 공통 에러 처리 화면

## 5. 정보 구조(요약)
- Project
  - screens: ProjectScreen[]
  - team: TeamMember[]
  - chat: ChatMessage[]
  - issues: ProjectIssue[]
- 공통 메타: createdAt/updatedAt, id는 문자열 프리픽스 사용(scr-, u-, cm-, iss- 등)

## 6. UX 흐름(핵심 시나리오)
1) 프로젝트 생성 → 팀원 초대 → 스크린 업로드/등록 → 이슈 생성/할당 → 채팅으로 논의 → 상태 변경/종료
2) 대시보드 진입 → 미해결 이슈와 최근 메시지 확인 → 상세 화면 이동

## 7. 상태/에러/빈 화면
- 로딩: 스켈레톤 UI 제공
- 빈 화면: "아직 등록된 스크린이 없습니다" 등 행동 유도(CTA) 노출
- 에러: 공통 에러 바인딩(재시도, 지원 링크)

## 8. 성능/품질 기준(예시)
- 초기 로드 TTI ≤ 3s(중간 네트워크 기준)
- 이미지 썸네일 지연 로딩, 800x600 권장
- 리스트 가상 스크롤(채팅/이슈 1000개+ 대응)
- Lighthouse 성능 80점 이상 목표

## 9. 접근성
- 키보드 포커스 순서 보장, 포커스 링 표시
- 색 대비 WCAG AA 준수
- 이미지 대체 텍스트 제공

## 10. 보안/개인정보
- 전송 구간 TLS
- 민감 데이터 마스킹 및 최소 수집 원칙
- 권한 기반 API 접근 제어

## 11. 국제화/지역화
- 언어 키 기반 번역 파일
- 날짜/숫자/통화 로케일 포맷 적용

## 12. API 설계(요약 예시)
- GET /api/projects
- GET /api/projects/{projectId}
- POST /api/projects
- GET /api/projects/{projectId}/screens
- POST /api/projects/{projectId}/screens
- GET /api/projects/{projectId}/issues?status=open|in_progress|closed
- POST /api/projects/{projectId}/issues
- PATCH /api/projects/{projectId}/issues/{issueId}
- GET /api/projects/{projectId}/chat
- POST /api/projects/{projectId}/chat
- GET /api/projects/{projectId}/team
- POST /api/projects/{projectId}/team/invite

응답 공통 형식: { data, meta?, error? }, 에러는 code/message 포함

## 13. 데이터 유효성(예시)
- 제목: 2~80자
- 설명: 최대 5000자
- 파일: 이미지(JPEG/PNG/WebP), 최대 5MB
- 이름 중복 금지(id는 유니크)

## 14. 로깅/분석 이벤트(예시)
- project_open, screen_add, issue_create, issue_status_change, chat_send
- 이벤트 필수 필드: projectId, userId, timestamp

## 15. 출시 계획
- M1: 프로젝트/팀/스크린 CRUD, 기본 채팅
- M2: 이슈 트래킹 확장, 알림 설정
- M3: 분석/결제/도움말, 성능 튜닝

## 16. 오픈 이슈
- 파일 첨부 버전관리 필요 여부
- 채팅 메시지 편집/삭제 허용 범위
- 오프라인 캐시 전략
`;

// 샘플 프로젝트 데이터
const project = ref<Project>({
  name: '꿈즈 프로젝트',
  summary: 'AI 기반 웹 서비스 개발 플랫폼',
  description: `# 꿈즈 소개

꿈즈는 아이디어를 빠르게 실험 가능한 목업과 프로토타입으로 전환하고, 팀과 함께 즉시 협업·배포까지 이어지는 AI 기반 웹 서비스 제작 플랫폼입니다. 한 번의 초안으로 끝나지 않고, 피드백-수정-배포 주기를 짧게 가져가며 “만들어 보며 배우는” 흐름을 지향합니다.

## 한눈에 보기
- 초안에서 배포까지를 하나의 흐름으로 단축
- AI 도우미로 화면/컴포넌트/코드 스니펫 자동 생성
- 실시간 공동 편집과 코멘트로 빠른 합의
- 미리보기 URL과 히스토리로 변경 추적
- 알림과 워크플로 자동화로 운영 부담 최소화

## 주요 기능
1. AI 기반 코드 생성
   - 요구사항을 자연어로 입력하면 화면 스켈레톤, 상태 관리, API 호출 코드 등을 제안합니다.
   - 예: “회원가입 폼과 유효성 검사, 제출 후 토스트 노출”을 요청하면 관련 폼 컴포넌트/검증 로직/피드백 UI를 함께 생성합니다.

2. 실시간 협업
   - 동시 편집, 커서 위치 표시, 인라인 코멘트로 의견을 남기고 해결 상태를 관리합니다.
   - 멘션으로 담당자 호출, 변경점에 대한 스레드 논의가 가능합니다.

3. 자동 배포
   - 브랜치/버전별 프리뷰 URL 제공
   - 커밋/버튼 한 번으로 스테이징/프로덕션 빌드
   - TLS 상태와 배포 로그를 대시보드에서 확인

4. 알림·워크플로
   - 이슈 상태 변경, 리뷰 요청, 배포 완료 등 주요 이벤트를 알림으로 받아보세요.
   - 필요 없는 알림은 설정에서 끌 수 있습니다. [알림 설정](/projects/{PROJECT_ID}/settings/notifications)

5. 보안 및 거버넌스
   - 역할 기반 권한(Owner/Editor/Viewer)
   - 감사 로그로 변경 이력 추적
   - 프로젝트 단위 접근 제어

## 시작하기
1. 새 프로젝트 만들기
   - 아이디어 요약을 작성하고 템플릿(예: 대시보드, 랜딩, 폼)을 선택합니다.
2. 요구사항 정리하기
   - 스펙 탭에 핵심 사용자 플로우, 화면 목록, API 스펙을 작성하세요.
3. AI로 초안 생성
   - “화면 만들기”를 실행하면 초기 컴포넌트와 네비게이션이 생성됩니다.
4. 미리보기·피드백
   - 프리뷰 URL을 공유해 팀 피드백을 받고, 코멘트로 개선을 트래킹합니다.

## 예시 코드 스니펫`,
  specification: sampleSpecification,
  screens: sampleScreens,
  team: sampleTeam,
  chat: sampleChat,
  issues: sampleIssues
})
const md = new MarkdownIt({
  html: false,     // 원본 HTML 입력 차단
  linkify: true,   // URL 자동 링크
  breaks: true     // 줄바꿈을 <br>로
})

const specHtml = computed(() =>
  DOMPurify.sanitize(md.render(project.value.specification || ''))
)

const descriptionHtml = computed(() =>
  DOMPurify.sanitize(md.render(project.value.description || ''))
)


const isOwner = computed(() => true) // 실제로는 현재 사용자 권한 체크

// 캐러셀 초기 선택 슬라이드 설정
onMounted(() => {
  const first = project.value?.screens?.at(0)
  if (first) {
    slide.value = String(first.id)
  }
})


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
