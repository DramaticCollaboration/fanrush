
<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- 에디터 섹션 -->
      <div class="col-12 col-md-8">
        <q-card class="editor-card">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h5">기능 명세서 에디터</div>
              <q-space />
              <q-btn-group flat>
                <q-btn
                  icon="history"
                  label="버전 기록"
                  @click="showVersionHistory = true"
                />
                <q-btn
                  icon="save"
                  label="저장"
                  color="primary"
                  @click="saveSpec"
                  :loading="saving"
                />
              </q-btn-group>
            </div>

            <!-- 탭 섹션 -->
            <q-tabs
              v-model="currentTab"
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="editor" label="에디터" />
              <q-tab name="preview" label="미리보기" />
            </q-tabs>

            <q-separator />

            <!-- 탭 패널 -->
            <q-tab-panels v-model="currentTab" animated>
              <q-tab-panel name="editor">
                <div class="row q-col-gutter-md">
                  <!-- 섹션 선택 -->
                  <div class="col-12">
                    <q-select
                      v-model="currentSection"
                      :options="sections"
                      label="섹션 선택"
                      filled
                      option-label="label"
                      option-value="value"
                      @update:model-value="loadSection"
                    />
                  </div>

                  <!-- 에디터 -->
                  <div class="col-12">
                    <QuillEditor
                      v-model:content="editorContent"
                      :toolbar="toolbarOptions"
                      contentType="html"
                      theme="snow"
                      @update:content="handleEditorChange"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="preview">
                <div class="markdown-preview" v-html="compiledMarkdown"></div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>

      <!-- 사이드바 -->
      <div class="col-12 col-md-4">
        <!-- 협업 섹션 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1">현재 편집 중</div>
            <q-list dense>
              <q-item v-for="user in activeUsers" :key="user.id">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="user.avatar">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption>{{ user.section }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- 주석 섹션 -->
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">주석</div>
            <q-list dense>
              <q-item v-for="comment in comments" :key="comment.id">
                <q-item-section>
                  <q-item-label>
                    <span class="text-weight-bold">{{ comment.user }}</span>
                    <span class="text-caption q-ml-sm">{{ formatDate(comment.date) }}</span>
                  </q-item-label>
                  <q-item-label caption>{{ comment.text }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="delete" @click="deleteComment(comment.id)" />
                </q-item-section>
              </q-item>
            </q-list>

            <!-- 새 주석 입력 -->
            <q-input
              v-model="newComment"
              filled
              dense
              class="q-mt-md"
              placeholder="주석 추가..."
              @keyup.enter="addComment"
            >
              <template v-slot:append>
                <q-btn round dense flat icon="send" @click="addComment" />
              </template>
            </q-input>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 버전 히스토리 다이얼로그 -->
    <q-dialog v-model="showVersionHistory">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">버전 히스토리</div>
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <q-item v-for="version in versionHistory" :key="version.id">
              <q-item-section>
                <q-item-label>버전 {{ version.version }}</q-item-label>
                <q-item-label caption>
                  {{ formatDate(version.date) }} by {{ version.author }}
                </q-item-label>
                <q-item-label caption>
                  {{ version.description }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat label="복원" color="primary" @click="restoreVersion(version.id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="닫기" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { date } from 'quasar';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useRouter } from 'vue-router'

const router = useRouter()

// 상태 변수들
const currentTab = ref('editor');
const currentSection = ref(null);
const editorContent = ref('');
const showVersionHistory = ref(false);
const saving = ref(false);
const newComment = ref('');

// 툴바 옵션
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean']
];

// 섹션 목록
const sections = [
  { label: '개요', value: 'overview' },
  { label: '주요 기능', value: 'features' },
  { label: '화면 흐름', value: 'flow' },
  { label: '데이터 모델', value: 'data' },
  { label: 'API 요약', value: 'api' },
  { label: '우선순위', value: 'priority' }
];

// 목업 데이터
const activeUsers = ref([
  {
    id: 1,
    name: '김개발',
    avatar: 'https://placehold.co/100x100/1976D2/ffffff/png?text=KD',
    section: '주요 기능'
  },
  {
    id: 2,
    name: '이디자인',
    avatar: 'https://placehold.co/100x100/1976D2/ffffff/png?text=LD',
    section: 'UI/UX 흐름'
  }
]);

const comments = ref([
  {
    id: 1,
    user: '김개발',
    text: 'API 엔드포인트 명세를 추가해야 할 것 같습니다.',
    date: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    user: '이디자인',
    text: '화면 흐름도를 업데이트했습니다.',
    date: new Date(Date.now() - 7200000)
  }
]);

const versionHistory = ref([
  {
    id: 1,
    version: '1.0.2',
    author: '김개발',
    date: new Date(Date.now() - 86400000),
    description: 'API 문서 업데이트'
  },
  {
    id: 2,
    version: '1.0.1',
    author: '이디자인',
    date: new Date(Date.now() - 172800000),
    description: '초기 버전'
  }
]);

// 계산된 속성
const compiledMarkdown = computed(() => {
  // 마크다운을 HTML로 변환
  return editorContent.value;
});

// 메서드들
const loadSection = async () => {
  if (!currentSection.value) return;

  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    editorContent.value = `# ${currentSection.value}\n\n내용을 입력하세요...`;
  } catch (error) {
    console.error('섹션 로드 실패:', error);
  }
};

const handleEditorChange = (content: string) => {
  // 변경 사항 처리
  console.log('Editor content changed:', content);
};

const saveSpec = async () => {
  saving.value = true;
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saved:', editorContent.value);
    router.push('/idea/sample/screens')
  } catch (error) {
    console.error('저장 실패:', error);
  } finally {
    saving.value = false;
  }
};

const addComment = () => {
  if (!newComment.value.trim()) return;

  comments.value.unshift({
    id: Date.now(),
    user: '현재 사용자',
    text: newComment.value,
    date: new Date()
  });

  newComment.value = '';
};

const deleteComment = (commentId: number) => {
  comments.value = comments.value.filter(comment => comment.id !== commentId);
};

const restoreVersion = async (versionId: number) => {
  try {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Restored version:', versionId);
  } catch (error) {
    console.error('버전 복원 실패:', error);
  }
};

const formatDate = (timestamp: Date) => {
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm');
};
</script>

<style>
.editor-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.q-card__section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.q-tab-panels {
  flex: 1;
  overflow: auto;
}

.markdown-preview {
  padding: 1rem;
}

/* 에디터 스타일 커스터마이징 */
.ql-editor {
  min-height: 500px;
}
</style>
