<template>
  <q-page class="q-pa-lg flex flex-center">
    <div style="max-width: 420px; width: 100%">
      <div class="text-h5 text-center q-mb-md">FanRush 로그인</div>
      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">소셜 계정으로 간편 로그인</div>
          <q-btn class="full-width q-mb-sm" color="primary" icon="login" label="트위터로 로그인" @click="onLogin('twitter')" />
          <q-btn class="full-width q-mb-md" color="secondary" icon="login" label="구글로 로그인" @click="onLogin('google')" />
          <q-separator spaced inset />
          <div class="row items-center q-col-gutter-sm">
            <div class="col-grow">
              <q-input v-model="name" label="이름 (표시명)" dense outlined />
            </div>
            <div class="col-auto">
              <q-btn flat label="게스트로 시작" @click="onLogin('guest')" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useFanRushStore } from 'src/stores/fanrush';
import { ref } from 'vue';

const store = useFanRushStore();
const router = useRouter();
const name = ref('팬');

function onLogin(provider: 'twitter' | 'google' | 'guest') {
  store.login(provider, name.value || '팬');
  router.push({ name: 'dashboard' });
}
</script>
