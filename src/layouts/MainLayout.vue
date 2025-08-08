
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title @click="goToMain" class="cursor-pointer">
          꿈즈
        </q-toolbar-title>

        <div v-if="isLoggedIn">
          <q-btn flat round dense icon="notifications">
            <q-badge color="red" floating>
              2
            </q-badge>
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
        </div>
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

const router = useRouter()
const leftDrawerOpen = ref(false)

// 로그인 상태 체크 (실제로는 상태 관리 라이브러리나 컴포지션 함수를 사용)
const isLoggedIn = computed(() => {
  return localStorage.getItem('token') !== null
})

const goToMain = () => {
  router.push('/dashboard')
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.q-toolbar-title {
  font-size: 1.5rem;
  font-weight: bold;

  &:hover {
    opacity: 0.8;
  }
}
</style>
