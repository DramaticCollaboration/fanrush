<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">러시 프로필 생성</div>

    <q-form @submit.prevent="onSave" class="q-gutter-md" style="max-width: 640px">
      <q-select v-model="originAirport" :options="origins" label="출발지 공항" outlined use-input fill-input hide-selected emit-value map-options />

      <q-input v-model="passportNameEn" label="여권 영문 성명" outlined />
      <q-input v-model="passportNumber" label="여권 번호" outlined />
      <q-input v-model="passportExpiry" label="여권 만료일" type="date" outlined />

      <q-input v-model="preferredAirline" label="선호 항공사 (선택)" outlined />
      <q-select v-model="seatClass" :options="seatOptions" label="좌석 등급" outlined emit-value map-options />

      <q-separator />
      <div class="text-subtitle2">결제수단 사전 등록</div>
      <q-input v-model="cardNumber" label="신용카드 번호 (저장용, 마스킹됨)" type="tel" outlined />

      <div class="row q-gutter-sm">
        <q-btn type="submit" color="primary" label="저장" />
        <q-btn flat label="대시보드로" :to="{ name: 'dashboard' }" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {RushProfile, useFanRushStore} from 'src/stores/fanrush';
import { useRouter } from 'vue-router';

const store = useFanRushStore();
const router = useRouter();
const origins = ['ICN (인천)', 'GMP (김포)', 'PUS (김해)'];
const seatOptions = [
  { label: '이코노미', value: 'ECONOMY' },
  { label: '비즈니스', value: 'BUSINESS' },
];

const originAirport = ref(store.profile?.originAirport || 'ICN (인천)');
const passportNameEn = ref(store.profile?.passportNameEn || 'HONG GILDONG');
const passportNumber = ref(store.profile?.passportNumber || 'M12345678');
const passportExpiry = ref(store.profile?.passportExpiry?.slice(0,10) || new Date(Date.now() + 31536000000).toISOString().slice(0,10));
const preferredAirline = ref(store.profile?.preferredAirline || '');
const seatClass = ref<'ECONOMY'|'BUSINESS'>(store.profile?.seatClass || 'ECONOMY');
const cardNumber = ref('4111111111111111');

function onSave(){
  store.saveProfile({
    originAirport: originAirport.value,
    passportNameEn: passportNameEn.value,
    passportNumber: passportNumber.value,
    passportExpiry: passportExpiry.value,
    preferredAirline: preferredAirline.value || undefined,
    seatClass: seatClass.value,
    paymentCardNumber: cardNumber.value,
  } as RushProfile);
  router.push({ name: 'dashboard' });
}
</script>
