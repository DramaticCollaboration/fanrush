<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">마이페이지</div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1">계정 정보</div>
        <div class="text-grey-7">{{ store.user?.name }} ({{ store.user?.provider }})</div>
      </q-card-section>
      <q-card-actions>
        <q-btn flat color="negative" label="로그아웃" @click="logout" />
      </q-card-actions>
    </q-card>

    <q-card flat bordered class="q-mb-md" style="max-width: 680px">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">러시 프로필</div>
        <div v-if="!store.profile" class="text-grey-7 q-mb-sm">아직 프로필이 없습니다.</div>
        <div v-else class="text-body2">
          출발지: {{ store.profile.originAirport }} / 여권: {{ store.profile.passportNameEn }} ({{ store.profile.passportNumber }}) / 만료: {{ store.profile.passportExpiry }}
          <br/> 선호 항공사: {{ store.profile.preferredAirline || '-' }} / 좌석: {{ store.profile.seatClass || 'ECONOMY' }}
          <br/> 결제수단: {{ store.profile.paymentCardMasked || '미등록' }}
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn color="primary" :to="{ name: 'profile' }" label="수정" />
      </q-card-actions>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1">지난 예약 내역</div>
        <div v-if="store.pastReservations.length === 0" class="text-grey-7">아직 예약 내역이 없습니다.</div>
        <q-list v-else bordered separator>
          <q-item v-for="r in store.pastReservations" :key="r.reservationCode">
            <q-item-section>
              <q-item-label>{{ r.offer.airline }} {{ r.offer.flightNumber }} · {{ seatLabel(r.offer.seatClass) }} · {{ price(r.offer.totalPrice, r.offer.currency) }}</q-item-label>
              <q-item-label caption>예약코드 {{ r.reservationCode }} · {{ r.eTicketNumber || '-' }} · {{ fmt(r.bookedAt) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useFanRushStore } from 'src/stores/fanrush';
import { useRouter } from 'vue-router';

const store = useFanRushStore();
const router = useRouter();

function logout(){
  store.logout();
  router.push('/');
}
function seatLabel(c: 'ECONOMY'|'BUSINESS'){ return c === 'BUSINESS' ? '비즈니스' : '이코노미'; }
function fmt(iso: string){ const d = new Date(iso); return d.toLocaleString(); }
function price(val: number, cur: string){ return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: cur }).format(val); }
</script>
