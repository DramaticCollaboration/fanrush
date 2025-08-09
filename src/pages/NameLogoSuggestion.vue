
<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <!-- Header -->
        <div class="row items-center q-mb-lg">
          <div class="text-h5">서비스 이름 및 로고 제안</div>
          <q-space />

          <q-btn
            v-if="!isDisabled"
            color="primary"
            icon-right="arrow_forward"
            label="다음 단계로"
            :disable="isDisabled"
            @click="proceedToNext"
          />
          <q-btn
            v-else
            color="primary"
            icon-right="arrow_forward"
            :label="disabledReason"
            :disable="isDisabled"
            @click="proceedToNext"
          />
        </div>

        <div class="row q-col-gutter-md">
          <!-- 이름 제안 섹션 -->
          <div class="col-12 col-md-6">
            <q-card class="name-section">
              <q-card-section>
                <div class="text-h6 q-mb-md">이름 후보</div>

                <!-- 직접 입력 -->
                <q-input
                  v-model="customName"
                  filled
                  label="직접 이름 입력"
                  class="q-mb-md"
                  @keyup.enter="checkDomainAvailability"
                >
                  <template v-slot:append>
                    <q-btn
                      round
                      dense
                      flat
                      icon="search"
                      @click="checkDomainAvailability"
                    />
                  </template>
                </q-input>

                <!-- 이름 후보 목록 -->
                <q-list separator>
                  <q-item
                    v-for="name in namesList"
                    :key="name.id"
                    clickable
                    :active="selectedName === name.id"
                    @click="selectName(name.id)"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ name.value }}</q-item-label>
                      <q-item-label caption>
                        {{ name.description }}
                      </q-item-label>
                      <q-item-label caption>
                        <span class="text-primary">{{ name.pronunciation }}</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-grey-8">
                        <q-icon
                          :name="name.domainAvailable ? 'check_circle' : 'error'"
                          :color="name.domainAvailable ? 'positive' : 'negative'"
                        />
                        <div class="text-caption">
                          {{ name.value }}.kkumz.com
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>

                <div class="text-center q-mt-md">
                  <q-btn
                    color="primary"
                    outline
                    icon="refresh"
                    label="더 많은 이름 생성"
                    @click="generateMoreNames"
                    :loading="generatingNames"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- 로고 제안 섹션 -->
          <div class="col-12 col-md-6">
            <q-card class="logo-section">
              <q-card-section>
                <div class="text-h6 q-mb-md">로고 디자인</div>

                <!-- 로고 스타일 설정 -->
                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="logoStyle"
                      :options="logoStyles"
                      label="로고 스타일"
                      filled
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="colorScheme"
                      :options="colorSchemes"
                      label="색상 스키마"
                      filled
                    />
                  </div>
                </div>

                <!-- 로고 그리드 -->
                <div class="row q-col-gutter-md">
                  <div
                    v-for="logo in logosList"
                    :key="logo.id"
                    class="col-6"
                  >
                    <q-card
                      class="logo-card cursor-pointer"
                      :class="{ 'selected-logo': selectedLogo === logo.id }"
                      @click="selectLogo(logo.id)"
                    >
                      <q-img
                        :src="logo.url"
                        :ratio="1"
                        class="logo-preview"
                      >
                        <template v-slot:loading>
                          <q-spinner-dots color="primary" />
                        </template>
                      </q-img>
                      <q-card-actions align="right" class="q-pa-xs">
                        <q-btn
                          flat
                          round
                          dense
                          icon="palette"
                          @click.stop="openColorPicker(logo.id)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="download"
                          @click.stop="downloadLogo(logo)"
                        />
                      </q-card-actions>
                    </q-card>
                  </div>
                </div>

                <div class="text-center q-mt-md">
                  <q-btn
                    color="primary"
                    outline
                    icon="refresh"
                    label="더 많은 로고 생성"
                    @click="generateMoreLogos"
                    :loading="generatingLogos"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 색상 선택 다이얼로그 -->
        <q-dialog v-model="colorPickerDialog">
          <q-card style="min-width: 300px">
            <q-card-section>
              <div class="text-h6">로고 색상 조정</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-sm">
                <div class="col-6" v-for="(color, index) in selectedLogoColors" :key="index">
                  <q-color v-model="selectedLogoColors[index]" />
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="취소" color="primary" v-close-popup />
              <q-btn flat label="적용" color="primary" @click="applyColors" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const router = useRouter()
const $q = useQuasar();

// 상태 변수들
const selectedName = ref<number | null>(null);
const selectedLogo = ref<number | null>(null);

const customName = ref('');
const generatingNames = ref(false);
const generatingLogos = ref(false);
const colorPickerDialog = ref(false);
const selectedLogoColors = ref(['#1976D2', '#ffffff']);

const isDisabled = computed(() => !selectedName.value || !selectedLogo.value)

const disabledReason = computed(() => {
  const missing: string[] = []
  if (!selectedName.value) missing.push('이름')
  if (!selectedLogo.value) missing.push('로고')
  return missing.length
    ? `${missing.join('과 ')}를 선택하면 계속 진행할 수 있어요.`
    : ''
})


// 로고 스타일 설정
const logoStyle = ref('modern');
const logoStyles = [
  'modern',
  'minimal',
  'playful',
  'corporate',
  'artistic'
];

const colorScheme = ref('blue');
const colorSchemes = [
  'blue',
  'green',
  'red',
  'purple',
  'orange'
];

// 목업 데이터
const namesList = ref([
  {
    id: 1,
    value: 'Innovatech',
    description: '혁신적인 기술 솔루션을 제공하는 서비스',
    pronunciation: '이노바테크',
    domainAvailable: true
  },
  {
    id: 2,
    value: 'DataFlow',
    description: '데이터 기반의 스마트한 서비스',
    pronunciation: '데이터플로우',
    domainAvailable: true
  }
]);

const logosList = ref([
  {
    id: 1,
    url: 'https://placehold.co/400x400/1976D2/ffffff/png?text=Logo+1',
  },
  {
    id: 2,
    url: 'https://placehold.co/400x400/1976D2/ffffff/png?text=Logo+2',
  },
  {
    id: 3,
    url: 'https://placehold.co/400x400/1976D2/ffffff/png?text=Logo+3',
  },
  {
    id: 4,
    url: 'https://placehold.co/400x400/1976D2/ffffff/png?text=Logo+4',
  }
]);

// 메서드들
const checkDomainAvailability = async () => {
  if (!customName.value) return;

  try {
    // API 호출 시뮬레이션
    const available = Math.random() > 0.5;

    namesList.value.unshift({
      id: Date.now(),
      value: customName.value,
      description: '사용자 지정 이름',
      pronunciation: customName.value,
      domainAvailable: available
    });

    customName.value = '';
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '도메인 확인 중 오류가 발생했습니다.'
    });
  }
};

const selectName = (nameId: number) => {
  selectedName.value = nameId;
};

const selectLogo = (logoId: number) => {
  selectedLogo.value = logoId;
};

const generateMoreNames = async () => {
  generatingNames.value = true;
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newNames = [
      {
        id: Date.now(),
        value: 'TechFlow',
        description: '기술의 흐름을 주도하는 서비스',
        pronunciation: '테크플로우',
        domainAvailable: true
      }
    ];

    namesList.value.push(...newNames);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '이름 생성 중 오류가 발생했습니다.'
    });
  } finally {
    generatingNames.value = false;
  }
};

const generateMoreLogos = async () => {
  generatingLogos.value = true;
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newLogos = [
      {
        id: Date.now(),
        url: 'https://placehold.co/400x400/1976D2/ffffff/png?text=New+Logo',
      }
    ];

    logosList.value.push(...newLogos);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '로고 생성 중 오류가 발생했습니다.'
    });
  } finally {
    generatingLogos.value = false;
  }
};

const openColorPicker = (logoId: number) => {
  selectedLogo.value = logoId;
  colorPickerDialog.value = true;
};

const applyColors = () => {
  // 색상 적용 로직
  $q.notify({
    type: 'positive',
    message: '색상이 적용되었습니다.'
  });
};

const downloadLogo = (logo: any) => {
  // 로고 다운로드 로직
  $q.notify({
    type: 'positive',
    message: '로고가 다운로드됩니다.'
  });
};

const proceedToNext = () => {
  // 다음 단계로 이동
  $q.notify({
    type: 'positive',
    message: '선택이 완료되었습니다. 다음 단계로 이동합니다.'
  });
  router.push('/idea/sample/spec')
};
</script>

<style scoped>
.logo-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.logo-card:hover {
  transform: translateY(-4px);
}

.selected-logo {
  border-color: var(--q-primary);
}

.logo-preview {
  background-color: #f5f5f5;
}
</style>
