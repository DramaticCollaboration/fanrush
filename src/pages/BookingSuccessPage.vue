<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <div class="text-h5 text-positive">예약이 성공적으로 완료되었습니다!</div>
      <div class="text-body1 q-mt-sm">아래에서 예약 정보를 확인하세요.</div>

      <q-separator spaced />
      <div v-if="store.booking.status === 'TICKETED'" class="q-gutter-sm">
        <div>예약 번호: <span class="text-weight-medium">{{ store.booking.reservationCode }}</span></div>
        <div>E-티켓 번호: <span class="text-weight-medium">{{ store.booking.eTicketNumber }}</span></div>
        <div>{{ store.booking.offer.airline }} {{ store.booking.offer.flightNumber }} · {{ seatLabel(store.booking.offer.seatClass) }}</div>
        <div class="text-grey-7">{{ fmt(store.booking.offer.departTime) }} → {{ fmt(store.booking.offer.arriveTime) }}</div>
      </div>

      <q-separator spaced />
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-btn label="PDF 다운로드" icon="picture_as_pdf" outline @click="stub('PDF 저장은 데모에서 지원되지 않습니다.')" />
        </div>
        <div class="col-auto">
          <q-btn label="갤러리에 저장" icon="save" outline @click="stub('갤러리 저장은 데모에서 지원되지 않습니다.')" />
        </div>
        <div class="col-auto">
          <q-btn label="공유" icon="share" outline @click="stub('공유는 데모에서 지원되지 않습니다.')" />
        </div>
      </div>

      <q-separator spaced />
      <div class="row q-gutter-sm">
        <q-btn color="primary" :to="{ name: 'dashboard' }" label="대시보드로" />
        <q-btn flat :to="{ name: 'mypage' }" label="내 예약 보기" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useFanRushStore } from 'src/stores/fanrush';

const store = useFanRushStore();

function seatLabel(c: 'ECONOMY'|'BUSINESS'){ return c === 'BUSINESS' ? '비즈니스' : '이코노미'; }
function fmt(iso: string){ const d = new Date(iso); return d.toLocaleString(); }
function stub(msg: string){
  // In a real app we'd implement the actions. For demo, alert.
  alert(msg);
}
</script>
