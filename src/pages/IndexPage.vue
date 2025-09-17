<template>
  <q-page class="q-pa-md">
    <div v-if="store.isLoggedIn" class="text-h5 q-mb-md">메인 대시보드</div>

    <div v-if="!store.isLoggedIn" class="q-mx-auto" style="max-width: 960px">
      <q-img src="/images/FanRush01.jpg" ratio="16/9" class="rounded-borders q-mb-lg" style="height: 400px; object-fit: cover; object-position: center; box-shadow: 0 1px 2px rgba(0,0,0,.6);">
        <div class="absolute-bottom q-pa-md" style="background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.65) 100%);">
          <div class="text-h5 q-mb-xs text-white" style="text-shadow: 0 1px 2px rgba(0,0,0,.6)">72시간의 악몽? 단 10분, 원클릭으로 끝!</div>
          <div class="text-body1 text-white" style="text-shadow: 0 1px 2px rgba(0,0,0,.6)">당첨되는 그 순간, 항공+숙소+픽업까지 한 번에. FanRush가 대신 달립니다.</div>
          <div class="q-mt-md">
            <q-btn color="primary" unelevated label="지금 무료로 시작" :to="{ name: 'auth' }" />
            <q-btn outline color="white" text-color="white" label="1분 만에 러시 프로필 완성" :to="{ name: 'profile' }" class="q-ml-sm" />
          </div>
        </div>
      </q-img>


      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="row no-wrap items-start">
                <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2">사전 등록 한 번, 예약은 순식간</div>
                  <div class="text-caption text-grey-7">여권·결제 미리 저장, 결제까지 단숨에</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="row no-wrap items-start">
                <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2">Rush 알림으로 즉시 예약</div>
                  <div class="text-caption text-grey-7">발표와 동시에 푸시! 놓치지 않게 바로 안내</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 q-mt-sm">
              <div class="row no-wrap items-start">
                <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2">원클릭 결제/예약</div>
                  <div class="text-caption text-grey-7">프로필 기반 맞춤 패키지, 클릭 한 번으로 완료</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 q-mt-sm">
              <div class="row no-wrap items-start">
                <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2">Fan Zone 커뮤니티로 연대감 UP</div>
                  <div class="text-caption text-grey-7">같은 공연 팬들과 정보 공유·룸메 매칭으로 비용 절감</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner rounded class="bg-primary text-white q-mb-md">
        콘서트 당첨 발표 임박! 지금 '러시 프로필'을 완성하고 가장 먼저 예약하세요.
      </q-banner>
      <q-card flat bordered class="q-pa-md q-mb-lg">
        <div class="q-mb-sm">로그인하면 FanRush의 모든 강력한 기능이 열립니다.</div>
        <q-btn color="primary" label="지금 로그인/가입" :to="{ name: 'auth' }" />
      </q-card>
    </div>

    <template v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h6">보이즈플래닛 중국 콘서트</div>
                <div v-if="store.rush.isActive" class="text-negative text-subtitle1">
                  남은 시간: {{ store.remainingHHMMSS }}
                  <span class="hidden">{{ nowTick }}</span>
                </div>
                <div v-else class="text-grey-7">Rush 대기중</div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="!store.profile">
                <q-banner rounded class="bg-warning text-dark q-mb-md">
                  '러시 프로필'을 작성하면, 발표와 동시에 원클릭 예약이 가능해요.
                </q-banner>
                <q-btn color="primary" label="러시 프로필 작성" :to="{ name: 'profile' }" />
              </div>
              <div v-else>
                <div class="q-mb-md">
                  <div class="text-subtitle2">나의 러시 프로필</div>
                  <div class="text-body2 text-grey-7">출발지: {{ store.profile.originAirport }} | 좌석: {{ store.profile.seatClass || 'ECONOMY' }}</div>
                </div>
                <div v-if="!store.rush.isActive">
                  <q-btn color="negative" label="Rush 시작 (시뮬레이션)" @click="startRush()" />
                </div>
                <div v-else>
                  <div v-if="store.booking.status === 'OFFERED'">
                    <q-card flat bordered class="q-mb-md">
                      <q-card-section>
                        <div class="row items-center justify-between">
                          <div>
                            <div class="text-subtitle1">맞춤 항공권 제안</div>
                            <div class="text-caption text-grey-7">프로필 기반 최적 패키지</div>
                          </div>
                          <q-badge v-if="store.booking.offer.highDemand" color="orange" label="마감 임박" />
                        </div>
                        <div class="q-mt-sm">
                          <div>{{ store.booking.offer.airline }} {{ store.booking.offer.flightNumber }} · {{ seatLabel(store.booking.offer.seatClass) }}</div>
                          <div class="text-grey-7">
                            {{ fmt(store.booking.offer.departTime) }} → {{ fmt(store.booking.offer.arriveTime) }}
                          </div>
                          <div class="text-weight-medium q-mt-sm">총액: {{ price(store.booking.offer.totalPrice, store.booking.offer.currency) }}</div>
                        </div>
                      </q-card-section>
                      <q-card-actions align="right">
                        <q-btn flat label="다른 옵션 보기" @click="store.refreshOffer()" />
                        <q-btn color="primary" label="Rush Now" :to="{ name: 'confirm' }" />
                      </q-card-actions>
                    </q-card>
                  </div>

                  <div v-else-if="store.booking.status === 'CONFIRMED'">
                    <q-banner rounded class="bg-info text-white q-mb-md">
                      결제 대기중입니다. 10분 내 결제를 완료해주세요.
                    </q-banner>
                    <q-btn color="primary" label="결제 진행" :to="{ name: 'confirm' }" />
                  </div>

                  <div v-else-if="store.booking.status === 'TICKETED'">
                    <q-banner rounded class="bg-positive text-white q-mb-md">
                      항공권 예약 완료! 예약코드 {{ store.booking.reservationCode }}
                    </q-banner>
                    <q-btn color="positive" label="E-티켓 확인" :to="{ name: 'success' }" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">알림센터</div>
              <div v-if="store.notifications.length === 0" class="text-grey-7">새로운 알림이 없습니다.</div>
              <q-list v-else bordered separator>
                <q-item v-for="n in store.notifications.slice(0,5)" :key="n.id">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ n.title }}</q-item-label>
                    <q-item-label caption>{{ n.body }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-btn class="q-mt-sm" flat dense :to="{ name: 'notifications' }" label="전체 보기" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { useFanRushStore } from 'src/stores/fanrush';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref } from 'vue';

const store = useFanRushStore();
const router = useRouter();

const nowTick = ref(0);
let timer: any;

onMounted(() => {
  timer = setInterval(() => {
    nowTick.value++;
  }, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function startRush(){
  if (!store.profile) {
    router.push({ name: 'profile' });
    return;
  }
  store.startRush(72);
}

function seatLabel(c: 'ECONOMY'|'BUSINESS'){ return c === 'BUSINESS' ? '비즈니스' : '이코노미'; }
function fmt(iso: string){ const d = new Date(iso); return d.toLocaleString(); }
function price(val: number, cur: string){ return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: cur }).format(val); }
</script>
