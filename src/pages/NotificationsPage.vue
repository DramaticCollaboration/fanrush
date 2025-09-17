<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">알림 센터</div>
    <q-card flat bordered>
      <q-list bordered separator>
        <q-item v-for="n in store.notifications" :key="n.id">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ n.title }}</q-item-label>
            <q-item-label caption>{{ n.body }}</q-item-label>
          </q-item-section>
          <q-item-section side>{{ fmt(n.createdAt) }}</q-item-section>
        </q-item>
      </q-list>
      <q-card-actions>
        <q-btn flat label="Rush 시작 알림 보내기 (테스트)" @click="sendTest()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useFanRushStore } from 'src/stores/fanrush';

const store = useFanRushStore();

function fmt(iso: string){ const d = new Date(iso); return d.toLocaleString(); }
function sendTest(){
  store.addNotification({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: '테스트 알림',
    body: '이것은 테스트 메시지입니다.'
  });
}
</script>
