<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn v-if="store.isLoggedIn" flat dense round color="white" icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> FanRush </q-toolbar-title>

        <q-btn v-if="!store.isLoggedIn" flat dense color="white" :to="{ name: 'auth' }" label="로그인" />
        <q-btn v-else flat dense color="white" :to="{ name: 'mypage' }" label="마이페이지" />
      </q-toolbar>
    </q-header>

    <q-drawer v-if="store.isLoggedIn" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>메뉴</q-item-label>
        <q-item clickable :to="{ name: 'dashboard' }">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>대시보드</q-item-section>
        </q-item>
        <q-item clickable :to="{ name: 'profile' }">
          <q-item-section avatar><q-icon name="assignment" /></q-item-section>
          <q-item-section>러시 프로필</q-item-section>
        </q-item>
        <q-item clickable :to="{ name: 'notifications' }">
          <q-item-section avatar><q-icon name="notifications" /></q-item-section>
          <q-item-section>알림 센터</q-item-section>
        </q-item>
        <q-separator />
        <q-item v-if="store.isLoggedIn" clickable :to="{ name: 'mypage' }">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>마이페이지</q-item-section>
        </q-item>
        <q-item v-if="store.isLoggedIn" clickable @click="logout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>로그아웃</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFanRushStore } from 'src/stores/fanrush';
import { useRouter } from 'vue-router';

const store = useFanRushStore();
const router = useRouter();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
function logout(){
  store.logout();
  router.push('/');
}
</script>
