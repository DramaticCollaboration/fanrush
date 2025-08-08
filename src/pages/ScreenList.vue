
<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- 화면 목록 섹션 -->
      <div class="col-12 col-md-7">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h5">화면 목록</div>
              <q-space />
              <q-btn-group flat>
                <q-btn color="primary" icon="add" label="화면 추가" @click="showAddScreen = true" />
                <q-btn color="secondary" icon="auto_awesome" label="AI 추천" @click="showAIRecommendation" />
              </q-btn-group>
            </div>

            <!-- 화면 목록 -->
            <q-list separator>
              <q-item v-ripple v-for="screen in screens" :key="screen.id">
                <q-item-section avatar>
                  <q-icon :name="screen.icon" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ screen.name }}</q-item-label>
                  <q-item-label caption>{{ screen.description }}</q-item-label>
                  <div class="q-gutter-x-sm q-mt-xs">
                    <q-chip
                      v-for="tag in screen.tags"
                      :key="tag"
                      size="sm"
                      outline
                      color="primary"
                    >
                      {{ tag }}
                    </q-chip>
                  </div>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <q-btn flat round size="sm" icon="edit" @click="editScreen(screen)" />
                    <q-btn flat round size="sm" icon="content_copy" @click="duplicateScreen(screen)" />
                    <q-btn flat round size="sm" icon="delete" color="negative" @click="confirmDelete(screen)" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- 화면 플로우 섹션 -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">화면 플로우</div>
            <div class="flow-container">
              <vue-flow v-model="flowElements" :default-viewport="{ zoom: 1 }" class="flow-canvas">
                <template #node-custom="props">
                  <div class="custom-node">
                    <div class="title">{{ props.data.label }}</div>
                  </div>
                </template>
              </vue-flow>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 스캐폴딩 설정 섹션 -->
      <div class="col-12 col-md-5">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">스캐폴딩 설정</div>

            <!-- 프레임워크 선택 -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">프레임워크</div>
              <div class="row q-col-gutter-sm">
                <div v-for="framework in frameworks" :key="framework.value" class="col-4">
                  <q-card
                    :class="{ 'selected-framework': selectedFramework === framework.value }"
                    class="framework-card cursor-pointer"
                    @click="selectFramework(framework.value)"
                  >
                    <q-card-section class="text-center">
                      <q-img :src="framework.icon" style="width: 50px; height: 50px;" />
                      <div class="text-subtitle2 q-mt-sm">{{ framework.label }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <!-- 스타일 가이드 -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">스타일 가이드</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="styleGuide.primaryColor"
                    filled
                    label="메인 컬러"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="styleGuide.primaryColor" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="styleGuide.fontFamily"
                    :options="fontFamilies"
                    filled
                    label="기본 폰트"
                  />
                </div>
              </div>
            </div>

            <!-- 컴포넌트 라이브러리 -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">컴포넌트 라이브러리</div>
              <q-option-group
                v-model="selectedLibraries"
                :options="componentLibraries"
                type="checkbox"
              />
            </div>

            <!-- 생성 버튼 -->
            <q-btn
              color="primary"
              class="full-width q-mt-lg"
              label="코드 생성"
              icon="code"
              :loading="generating"
              @click="generateCode"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 화면 추가/수정 다이얼로그 -->
    <q-dialog v-model="showAddScreen" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingScreen ? '화면 수정' : '새 화면 추가' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveScreen" class="q-gutter-md">
            <q-input
              v-model="screenForm.name"
              filled
              label="화면 이름"
              :rules="[val => !!val || '화면 이름을 입력해주세요']"
            />

            <q-input
              v-model="screenForm.description"
              filled
              type="textarea"
              label="설명"
              :rules="[val => !!val || '설명을 입력해주세요']"
            />

            <q-select
              v-model="screenForm.icon"
              :options="iconOptions"
              filled
              label="아이콘"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="screenForm.tags"
              filled
              multiple
              use-input
              use-chips
              label="태그"
              :options="tagSuggestions"
              @new-value="createTag"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="취소" color="grey" v-close-popup />
              <q-btn label="저장" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">정말 이 화면을 삭제하시겠습니까?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="primary" v-close-popup />
          <q-btn flat label="삭제" color="negative" @click="deleteScreen" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import { useRouter } from 'vue-router'

const router = useRouter()
const $q = useQuasar();

// 상태 변수들
const showAddScreen = ref(false);
const showDeleteConfirm = ref(false);
const generating = ref(false);
const editingScreen = ref<any>(null);
const selectedFramework = ref('vue');
const selectedLibraries = ref([]);
const screens = ref([
  {
    id: 1,
    name: '로그인',
    description: '사용자 인증 화면',
    icon: 'login',
    tags: ['인증', '필수']
  },
  {
    id: 2,
    name: '대시보드',
    description: '메인 대시보드 화면',
    icon: 'dashboard',
    tags: ['메인', '통계']
  }
]);

// 폼 데이터
const screenForm = reactive({
  name: '',
  description: '',
  icon: '',
  tags: []
});

// 플로우 데이터
const flowElements = ref([
  {
    id: '1',
    type: 'custom',
    data: { label: '로그인' },
    position: { x: 100, y: 100 }
  },
  {
    id: '2',
    type: 'custom',
    data: { label: '대시보드' },
    position: { x: 300, y: 100 }
  },
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true
  }
]);

// 선택 옵션들
const frameworks = [
  { label: 'Vue.js', value: 'vue', icon: 'https://vuejs.org/images/logo.png' },
  { label: 'React', value: 'react', icon: 'https://reactjs.org/favicon.ico' },
  { label: 'Angular', value: 'angular', icon: 'https://angular.io/assets/images/logos/angular/angular.png' }
];

const componentLibraries = [
  { label: 'Quasar', value: 'quasar' },
  { label: 'Vuetify', value: 'vuetify' },
  { label: 'Element Plus', value: 'element-plus' }
];

const fontFamilies = [
  'Roboto',
  'Open Sans',
  'Noto Sans',
  'Pretendard'
];

const iconOptions = [
  'home',
  'person',
  'settings',
  'login',
  'dashboard',
  'list'
];

const tagSuggestions = ref([
  '인증',
  '메인',
  '설정',
  '프로필',
  '목록',
  '상세'
]);

const styleGuide = reactive({
  primaryColor: '#1976D2',
  fontFamily: 'Roboto'
});

// 메서드들
const selectFramework = (framework: string) => {
  selectedFramework.value = framework;
};

const showAIRecommendation = async () => {
  try {
    // AI 추천 API 호출 시뮬레이션
    $q.notify({
      type: 'info',
      message: 'AI가 화면을 분석하고 추천하고 있습니다...'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'AI 추천 중 오류가 발생했습니다.'
    });
  }
};

const editScreen = (screen: any) => {
  editingScreen.value = screen;
  Object.assign(screenForm, screen);
  showAddScreen.value = true;
};

const duplicateScreen = (screen: any) => {
  const newScreen = {
    ...screen,
    id: Date.now(),
    name: `${screen.name} (복사본)`
  };
  screens.value.push(newScreen);
};

const confirmDelete = (screen: any) => {
  editingScreen.value = screen;
  showDeleteConfirm.value = true;
};

const deleteScreen = () => {
  screens.value = screens.value.filter(s => s.id !== editingScreen.value.id);
  editingScreen.value = null;
};

const createTag = (val: string, done: (val?: string) => void) => {
  if (val.length > 0) {
    tagSuggestions.value.push(val);
    done(val);
  }
};

const saveScreen = () => {
  if (editingScreen.value) {
    const index = screens.value.findIndex(s => s.id === editingScreen.value.id);
    screens.value[index] = { ...editingScreen.value, ...screenForm };
  } else {
    screens.value.push({
      id: Date.now(),
      ...screenForm
    });
  }

  showAddScreen.value = false;
  editingScreen.value = null;
  Object.assign(screenForm, { name: '', description: '', icon: '', tags: [] });
};

const generateCode = async () => {
  generating.value = true;
  try {
    // 코드 생성 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    $q.notify({
      type: 'positive',
      message: '코드 생성이 완료되었습니다.'
    });
    router.push('/idea/sample/code')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '코드 생성 중 오류가 발생했습니다.'
    });
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped>
.framework-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.selected-framework {
  border-color: var(--q-primary);
  background-color: rgba(25, 118, 210, 0.1);
}

.flow-container {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.custom-node {
  padding: 10px;
  border-radius: 5px;
  background: white;
  border: 1px solid #ddd;
  text-align: center;
}

.flow-canvas {
  width: 100%;
  height: 100%;
}
</style>
