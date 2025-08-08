<template>
  <q-page class="onboarding-page flex items-center justify-center q-px-lg q-py-xl">
    <div class="login-card shadow-2 rounded bg-white q-pa-lg" style="max-width: 400px; width: 100%;">
      <!-- Logo -->
      <q-img src="@/assets/logo.png" class="q-mb-md" style="max-width: 200px; margin: 0 auto;" />

      <!-- Welcome Message -->
      <div class="text-center q-mb-md">
        <h2 class="text-primary">Welcome to Kkumz</h2>
        <p>Your journey starts here!</p>
      </div>

      <!-- Tabs for Login / Signup -->
      <q-tabs v-model="activeTab" align="justify" dense>
        <q-tab name="login" label="Login" />
        <q-tab name="signup" label="Signup" />
      </q-tabs>

      <q-separator class="q-my-md" />

      <!-- Form Sections -->
      <div v-if="activeTab === 'login'">
        <q-form @submit="submitLogin">
          <q-input
            v-model="loginForm.email"
            filled
            label="Email"
            type="email"
            class="q-mb-md"
            :rules="[val => !!val || 'Email is required']"
          />
          <q-input
            v-model="loginForm.password"
            filled
            type="password"
            label="Password"
            :rules="[val => !!val || 'Password is required']"
          />
          <q-btn
            type="submit"
            label="Login"
            color="primary"
            class="full-width q-mt-md"
            unelevated
          />
        </q-form>
        <div class="q-mt-sm text-right">
          <q-btn flat label="Forgot password?" @click="redirectToReset" color="primary" />
        </div>
      </div>

      <div v-if="activeTab === 'signup'">
        <q-form @submit="submitSignup">
          <q-input
            v-model="signupForm.email"
            filled
            label="Email"
            type="email"
            class="q-mb-md"
            :rules="[val => !!val || 'Email is required']"
          />
          <q-input
            v-model="signupForm.password"
            filled
            type="password"
            label="Password"
            class="q-mb-md"
            :rules="[val => !!val || 'Password is required']"
          />
          <q-input
            v-model="signupForm.displayName"
            filled
            label="Nickname"
            :rules="[val => !!val || 'Nickname is required']"
          />
          <q-checkbox
            v-model="acceptTerms"
            label="I agree to the terms and conditions"
            color="primary"
            :rules="[val => val || 'You must agree to continue']"
          />
          <q-btn
            type="submit"
            label="Sign Up"
            color="primary"
            class="full-width q-mt-md"
            unelevated
            :disable="!acceptTerms"
          />
        </q-form>
      </div>

      <q-separator class="q-my-md" />

      <!-- Social Login Section -->
      <div>
        <p class="text-center">Or continue with</p>
        <div class="row justify-around q-mt-md">
          <q-btn flat class="q-pa-none" color="google" @click="handleSocialLogin('google')">
            <q-img src="https://www.google.com/favicon.ico" style="width: 24px; height: 24px;" />
          </q-btn>
            <q-btn flat class="q-pa-none" color="yellow-8" @click="handleSocialLogin('kakao')">
              <q-img src="https://www.kakaocorp.com/page/favicon.ico" style="width: 24px; height: 24px;"/>
            </q-btn>
          <q-btn flat class="q-pa-none" color="black" @click="handleSocialLogin('github')">
            <q-img src="https://github.githubassets.com/favicons/favicon.png" style="width: 24px; height: 24px;"/>
          </q-btn>
          <q-btn flat class="q-pa-none" color="green-6" @click="handleSocialLogin('naver')">
            <q-img src="https://www.naver.com/favicon.ico" style="width: 24px; height: 24px;"/>
          </q-btn>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore, User } from 'stores/auth'

const auth = useAuthStore()

const router = useRouter()
const $q = useQuasar()

// Data properties for login/signup forms
const activeTab = ref('login');
const loginForm = ref({ email: '', password: '' });
const signupForm = ref({ email: '', password: '', displayName: '' });
const acceptTerms = ref(false);

// Methods
async function submitLogin() {
  try {
    // TODO: API 호출로 변경
    const response = await mockLoginAPI(loginForm.value)

    if (response.success) {
      // 로그인 성공 처리
      auth.setAuth(response.token, response.user as User)


      $q.notify({
        type: 'positive',
        message: '로그인 성공!'
      })

      // 관리자인 경우 관리자 대시보드로, 일반 사용자인 경우 일반 대시보드로 이동
      if (response.user.role === 'admin') {
        await router.push('/admin')
      } else {
        await router.push('/dashboard')
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
    })
    console.error('Login error:', error)
  }
}

// 임시 목업 API
async function mockLoginAPI({ email, password }: { email: string; password: string }) {
  // 실제 API 구현 전까지 사용할 목업 데이터
  await new Promise(resolve => setTimeout(resolve, 1000)) // API 호출 시뮬레이션

  if (email === 'admin@kkumz.com' && password === 'admin') {
    return {
      success: true,
      token: 'mock-admin-token',
      user: {
        id: '1',
        email: 'admin@kkumz.com',
        name: '관리자',
        role: 'admin'
      }
    }
  } else if (email && password) {
    return {
      success: true,
      token: 'mock-user-token',
      user: {
        id: '2',
        email: email,
        name: '일반 사용자',
        role: 'user'
      }
    }
  }

  throw new Error('Invalid credentials')
}


function submitSignup() {
  // TODO: Add signup API implementation
  console.log('Signup form submitted', signupForm.value);
}

function redirectToReset() {
  // TODO: Redirect to password reset page
  console.log('Redirect to reset password');
}

function handleSocialLogin(provider: string) {
  // Redirect to the social login provider's URL
  console.log(`Social login with ${provider}`);
}
</script>

<style scoped>
.onboarding-page {
  background-color: #f5f5f5;
  height: 100vh;
}

.login-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
