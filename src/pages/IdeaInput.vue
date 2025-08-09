
<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <!-- Header -->
        <div class="text-h5 q-mb-lg">새로운 아이디어 입력</div>

        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- 아이디어 입력 섹션 -->
          <div class="text-subtitle1 q-mb-sm">아이디어 설명</div>
          <q-input
            v-model="formData.title"
            filled
            label="프로젝트 제목"
            :rules="[val => !!val || '제목을 입력해주세요']"
          />

          <q-input
            v-model="formData.prompt"
            type="textarea"
            filled
            label="아이디어 설명 (프롬프트)"
            hint="구현하고자 하는 서비스나 제품에 대해 자세히 설명해주세요"
            :rules="[val => !!val || '아이디어 설명을 입력해주세요']"
            rows="4"
          />

          <!-- 카테고리 선택 -->
          <div>
            <div class="text-subtitle1 q-mb-sm">카테고리</div>
            <div class="row q-col-gutter-sm">
              <div v-for="category in categories" :key="category.value" class="col-auto">
                <q-btn
                  :label="category.label"
                  :color="formData.category === category.value ? 'primary' : 'grey-3'"
                  :text-color="formData.category === category.value ? 'white' : 'black'"
                  @click="formData.category = category.value"
                  no-caps
                  unelevated
                  padding="sm lg"
                />
              </div>
            </div>
          </div>

          <!-- 태그 입력 -->
          <div>
            <div class="text-subtitle1 q-mb-sm">태그</div>
            <q-select
              v-model="formData.tags"
              filled
              multiple
              use-input
              use-chips
              input-debounce="0"
              label="태그 입력 (Enter로 추가)"
              hint="관련 키워드를 입력하세요"
              :options="tagSuggestions"
              @new-value="createTag"
              @filter="filterTags"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Enter를 눌러 새로운 태그를 추가하세요
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- 공개 설정 -->
          <div>
            <div class="text-subtitle1 q-mb-sm">공개 설정</div>
            <q-option-group
              v-model="formData.visibility"
              :options="[
                { label: '전체 공개', value: 'public' },
                { label: '비공개', value: 'private' }
              ]"
              color="primary"
              inline
            />
          </div>

          <!-- AI 분석 결과 -->
          <q-card v-if="aiAnalysis.keywords.length > 0" class="q-mt-md bg-grey-1">
            <q-card-section>
              <div class="text-subtitle1">AI 키워드 분석</div>
              <div class="q-mt-sm">
                <q-chip
                  v-for="keyword in aiAnalysis.keywords"
                  :key="keyword"
                  size="sm"
                  color="primary"
                  text-color="white"
                  class="q-ma-xs"
                >
                  {{ keyword }}
                </q-chip>
              </div>
            </q-card-section>
          </q-card>

          <!-- 버튼 그룹 -->
          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              label="임시 저장"
              color="grey"
              @click="saveDraft"
              outline
            />
            <q-btn
              label="AI 분석"
              color="primary"
              type="submit"
              unelevated
            />
            <q-btn
              v-if="aiAnalysis.keywords.length > 0"
              label="다음 단계로"
              color="primary"
              @click="goNext"
              unelevated
            />
          </div>
        </q-form>

        <!-- 로딩 오버레이 -->
        <q-dialog v-model="loading" persistent>
          <q-card style="min-width: 300px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">AI 분석 중</div>
            </q-card-section>
            <q-card-section class="q-pt-sm">
              <q-linear-progress indeterminate />
              <div class="text-caption q-mt-sm">
                아이디어를 분석하고 있습니다...
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const router = useRouter()

const $q = useQuasar();

// 폼 데이터
const formData = reactive({
  title: '',
  prompt: '',
  category: '',
  tags: [] as string[],
  visibility: 'public'
});

// 카테고리 옵션
const categories = [
  { label: 'e-커머스', value: 'e-commerce' },
  { label: '교육', value: 'education' },
  { label: '소셜', value: 'social' },
  { label: '모바일 앱', value: 'mobile' },
  { label: '웹 서비스', value: 'web' },
  { label: '기타', value: 'other' }
];

// AI 분석 결과
const aiAnalysis = reactive({
  keywords: [] as string[]
});

// 태그 관련
const tagSuggestions = ref(['AI', '머신러닝', '추천시스템', '소셜', '모바일', '웹서비스']);
const loading = ref(false);

// 태그 필터링
function filterTags(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      tagSuggestions.value = ['AI', '머신러닝', '추천시스템', '소셜', '모바일', '웹서비스'];
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    tagSuggestions.value = tagSuggestions.value.filter(
      v => v.toLowerCase().indexOf(needle) > -1
    );
  });
}

// 새 태그 생성
function createTag(val: string, done: (val?: string) => void) {
  if (val.length > 0 && !formData.tags.includes(val)) {
    done(val);
  }
}

// 임시 저장
async function goNext() {
    router.push('/idea/sample/name-logo')
}

// 임시 저장
async function saveDraft() {
  try {
    // API 호출
    console.log('Saving draft:', formData);
    $q.notify({
      type: 'positive',
      message: '임시저장 되었습니다.'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '저장 중 오류가 발생했습니다.'
    });
  }
}

// 폼 제출
async function onSubmit() {
  loading.value = true;
  try {
    // API 호출 및 AI 분석
    await simulateAIAnalysis();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '처리 중 오류가 발생했습니다.'
    });
  } finally {
    loading.value = false;
  }
}

// AI 분석 시뮬레이션 (실제 구현 시 API 호출로 대체)
function simulateAIAnalysis(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      aiAnalysis.keywords = ['인공지능', '개인화', '추천시스템', '사용자경험', '모바일최적화'];
      resolve();
    }, 2000);
  });
}
</script>

<style scoped>
.q-chip {
  margin: 4px;
}
</style>
