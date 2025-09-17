<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">맞춤 항공권 확인 및 결제</div>

    <div v-if="!store.isLoggedIn" class="q-mb-md">
      <q-banner rounded class="bg-warning text-dark">로그인이 필요합니다.</q-banner>
      <q-btn class="q-mt-sm" color="primary" :to="{ name: 'auth' }" label="로그인" />
    </div>

    <div v-else-if="store.booking.status === 'NONE'">
      <q-banner rounded class="bg-grey-3 text-dark q-mb-md">제안된 항공권이 없습니다. 대시보드에서 Rush를 시작하세요.</q-banner>
      <q-btn flat :to="{ name: 'dashboard' }" label="대시보드로" />
    </div>

    <template v-else-if="offer">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-subtitle1">항공권 상세 정보</div>
            <q-badge v-if="offer.highDemand" color="orange" label="마감 임박" />
          </div>
          <div class="q-mt-sm">
            <div>{{ offer.airline }} {{ offer.flightNumber }} · {{ seatLabel(offer.seatClass) }}</div>
            <div class="text-grey-7">{{ fmt(offer.departTime) }} → {{ fmt(offer.arriveTime) }}</div>
            <div class="text-weight-medium q-mt-sm">최종 결제 금액: {{ price(offer.totalPrice, offer.currency) }}</div>
            <div class="text-caption text-positive q-mt-xs">유류할증료/세금 포함</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1">결제 정보</div>
          <div class="text-grey-7 q-mt-sm">등록된 결제수단: {{ store.profile?.paymentCardMasked || '미등록' }}</div>
          <div class="text-negative q-mt-sm">"10분 내 결제 완료"를 권장드립니다.</div>
        </q-card-section>
      </q-card>

      <div v-if="store.booking.status === 'OFFERED'">
        <q-btn color="primary" label="예약 확정" @click="confirm()" />
        <q-btn flat class="q-ml-sm" label="다른 옵션 보기" @click="store.refreshOffer()" />
      </div>
      <div v-else-if="store.booking.status === 'CONFIRMED'">
        <q-banner rounded class="bg-info text-white q-mb-sm">예약이 확정되었습니다. 지금 결제를 진행해 주세요.</q-banner>
        <q-btn color="positive" label="지금 결제" @click="pay()" />
      </div>
      <div v-else-if="store.booking.status === 'TICKETED'">
        <q-banner rounded class="bg-positive text-white q-mb-sm">결제가 완료되었습니다!</q-banner>
        <q-btn color="positive" :to="{ name: 'success' }" label="E-티켓 확인" />
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { useFanRushStore } from 'src/stores/fanrush';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const store = useFanRushStore();
const router = useRouter();

const offer = computed(() => (store.booking.status === 'NONE' ? undefined : store.booking.offer));

function confirm(){
  if (store.booking.status === 'OFFERED') {
    store.confirmBooking();
  }
}
function pay(){
  if (store.booking.status === 'CONFIRMED') {
    store.completePayment();
    router.push({ name: 'success' });
  }
}
function seatLabel(c: 'ECONOMY'|'BUSINESS'){ return c === 'BUSINESS' ? '비즈니스' : '이코노미'; }
function fmt(iso: string){ const d = new Date(iso); return d.toLocaleString(); }
function price(val: number, cur: string){ return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: cur }).format(val); }
</script>
