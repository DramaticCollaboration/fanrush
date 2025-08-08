<template>
  <q-page padding>
    <div class="settings-container">
      <div class="row q-col-gutter-md">
        <!-- 왼쪽: 사이드바 메뉴 -->
        <div class="col-12 col-md-3">
          <q-list bordered separator class="settings-menu">
            <q-item
              v-for="menu in menuItems"
              :key="menu.value"
              clickable
              :active="currentSection === menu.value"
              @click="currentSection = menu.value"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="menu.icon" />
              </q-item-section>
              <q-item-section>{{ menu.label }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 오른쪽: 설정 내용 -->
        <div class="col-12 col-md-9">
          <q-card>
            <!-- 프로필 설정 -->
            <q-card-section v-if="currentSection === 'profile'">
              <div class="text-h6 q-mb-md">프로필 설정</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 text-center">
                  <q-avatar size="150px" class="q-mb-md">
                    <img :src="profile.avatar">
                    <q-badge floating round color="primary" icon="edit" style="cursor: pointer">
                      <q-file v-model="avatarFile" accept=".jpg,.png" @update:model-value="handleAvatarChange" style="display: none">
                        <template v-slot:default>
                          <div style="display: none"></div>
                        </template>
                      </q-file>
                    </q-badge>
                  </q-avatar>
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="profile.nickname" label="닉네임" outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="profile.email" label="이메일" outlined readonly />
                </div>
                <div class="col-12">
                  <q-input v-model="profile.bio" label="소개" type="textarea" outlined />
                </div>
              </div>
            </q-card-section>

            <!-- 알림 설정 -->
            <q-card-section v-if="currentSection === 'notifications'">
              <div class="text-h6 q-mb-md">알림 설정</div>
              <q-list>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>이메일 알림</q-item-label>
                    <q-item-label caption>중요 업데이트 및 알림을 이메일로 받기</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notifications.email" color="primary" />
                  </q-item-section>
                </q-item>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>인앱 알림</q-item-label>
                    <q-item-label caption>앱 내에서 실시간 알림 받기</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notifications.inApp" color="primary" />
                  </q-item-section>
                </q-item>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>푸시 알림</q-item-label>
                    <q-item-label caption>브라우저 푸시 알림 받기</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notifications.push" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <!-- 결제 정보 -->
            <q-card-section v-if="currentSection === 'payment'">
              <div class="text-h6 q-mb-md">결제 정보</div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-list bordered separator>
                    <q-item v-for="method in paymentMethods" :key="method.id">
                      <q-item-section avatar>
                        <q-icon :name="method.type === 'card' ? 'credit_card' : 'account_balance'" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ method.type === 'card' ? '카드' : '계좌' }} (**** {{ method.last4 }})</q-item-label>
                        <q-item-label caption>
                          {{ method.type === 'card' ? `만료: ${method.expiry}` : '' }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat round icon="delete" color="negative" @click="removePaymentMethod(method.id)" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <q-btn color="primary" class="q-mt-md" @click="showAddPaymentDialog = true">
                    결제 수단 추가
                  </q-btn>
                </div>
              </div>
            </q-card-section>

            <!-- 활동 내역 -->
            <q-card-section v-if="currentSection === 'activity'">
              <div class="text-h6 q-mb-md">활동 내역</div>
              <q-timeline color="primary">
                <q-timeline-entry
                  v-for="activity in activityLogs"
                  :key="activity.id"
                  :title="activity.description"
                  :subtitle="formatDate(activity.timestamp)"
                  :icon="getActivityIcon(activity.type)"
                />
              </q-timeline>
            </q-card-section>

            <!-- 테마 설정 -->
            <q-card-section v-if="currentSection === 'appearance'">
              <div class="text-h6 q-mb-md">테마 설정</div>
              <q-list>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>다크 모드</q-item-label>
                    <q-item-label caption>어두운 테마 사용</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="darkMode" color="primary" @update:model-value="toggleDarkMode" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <!-- 도움말 -->
            <q-card-section v-if="currentSection === 'help'">
              <div class="text-h6 q-mb-md">도움말 및 문의</div>
              <q-list bordered separator>
                <q-expansion-item
                  v-for="(faq, index) in faqs"
                  :key="index"
                  :label="faq.question"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      {{ faq.answer }}
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>

              <div class="q-mt-lg">
                <div class="text-h6 q-mb-md">문의하기</div>
                <q-input
                  v-model="feedback.subject"
                  label="제목"
                  outlined
                  class="q-mb-md"
                />
                <q-input
                  v-model="feedback.message"
                  label="내용"
                  type="textarea"
                  outlined
                  class="q-mb-md"
                />
                <q-btn color="primary" label="문의 보내기" @click="sendFeedback" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 결제 수단 추가 다이얼로그 -->
    <q-dialog v-model="showAddPaymentDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">결제 수단 추가</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="newPayment.type"
            :options="[
              { label: '신용카드', value: 'card' },
              { label: '계좌이체', value: 'bank' }
            ]"
            label="결제 수단 유형"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newPayment.number"
            :label="newPayment.type === 'card' ? '카드 번호' : '계좌 번호'"
            outlined
            class="q-mb-md"
          />
          <template v-if="newPayment.type === 'card'">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="newPayment.expiry" label="만료일" outlined mask="##/##" />
              </div>
              <div class="col-6">
                <q-input v-model="newPayment.cvv" label="CVV" outlined type="password" />
              </div>
            </div>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="primary" v-close-popup />
          <q-btn flat label="추가" color="primary" @click="addPaymentMethod" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import type { UserProfile, NotificationSettings, PaymentMethod, ActivityLog } from 'components/models'

const $q = useQuasar()
const currentSection = ref('profile')
const showAddPaymentDialog = ref(false)
const avatarFile = ref<File | null>(null)
const darkMode = ref($q.dark.isActive)

const menuItems = [
  { label: '프로필', value: 'profile', icon: 'person' },
  { label: '알림', value: 'notifications', icon: 'notifications' },
  { label: '결제 정보', value: 'payment', icon: 'payment' },
  { label: '활동 내역', value: 'activity', icon: 'history' },
  { label: '테마', value: 'appearance', icon: 'palette' },
  { label: '도움말', value: 'help', icon: 'help' }
]

// 샘플 데이터
const profile = ref<UserProfile>({
  id: '1',
  email: 'user@example.com',
  nickname: '김개발',
  avatar: 'https://placehold.co/200x200',
  bio: '열정적인 개발자입니다.',
  createdAt: new Date().toISOString()
})

const notifications = ref<NotificationSettings>({
  email: true,
  inApp: true,
  push: false,
  projectUpdates: true,
  teamInvites: true,
  comments: true
})

const paymentMethods = ref<PaymentMethod[]>([
  {
    id: '1',
    type: 'card',
    last4: '4242',
    expiry: '12/24',
    isDefault: true
  }
])

const activityLogs = ref<ActivityLog[]>([
  {
    id: '1',
    type: 'project_create',
    description: '새 프로젝트 "AI 채팅봇" 생성',
    timestamp: new Date().toISOString()
  }
])

const newPayment = ref({
  type: 'card',
  number: '',
  expiry: '',
  cvv: ''
})

const feedback = ref({
  subject: '',
  message: ''
})

const faqs = [
  {
    question: '꿈즈는 어떤 서비스인가요?',
    answer: 'AI를 활용하여 웹 서비스 개발을 도와주는 혁신적인 플랫폼입니다.'
  },
  {
    question: '어떻게 시작하나요?',
    answer: '새 프로젝트 생성 버튼을 클릭하여 아이디어를 입력하시면 됩니다.'
  }
]

function handleAvatarChange(file: File) {
  if (!file) return
  // 프로필 이미지 업로드 로직
  console.log('Avatar file:', file)
}

function toggleDarkMode(value: boolean) {
  $q.dark.set(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'project_create': return 'add_circle'
    case 'project_update': return 'update'
    case 'team_join': return 'group_add'
    case 'comment': return 'comment'
    case 'like': return 'favorite'
    default: return 'circle'
  }
}

function removePaymentMethod(id: string) {
  paymentMethods.value = paymentMethods.value.filter(method => method.id !== id)
}

function addPaymentMethod() {
  // 결제 수단 추가 로직
  console.log('New payment method:', newPayment.value)
}

function sendFeedback() {
  // 피드백 전송 로직
  console.log('Feedback:', feedback.value)
  $q.notify({
    color: 'positive',
    message: '문의가 접수되었습니다.',
    icon: 'check'
  })
  feedback.value.subject = ''
  feedback.value.message = ''
}
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-menu {
  position: sticky;
  top: 20px;
}

@media (max-width: 1023px) {
  .settings-menu {
    position: static;
    margin-bottom: 20px;
  }
}
</style>
