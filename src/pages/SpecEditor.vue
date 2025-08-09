
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
import { ref, computed, onMounted } from 'vue';
import { date } from 'quasar';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useRouter } from 'vue-router'

const router = useRouter()

// 상태 변수들
const currentTab = ref('editor');
const currentSection = ref({ label: '개요', value: 'overview' });

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

// TypeScript
const sectionSamples: Record<string, string> = {
  overview: `
    <h2>개요</h2>
    <p>이 문서는 제품/서비스의 목적, 대상 사용자, 핵심 가치와 범위를 설명합니다.</p>
    <h3>목표</h3>
    <ul>
      <li>핵심 사용자 플로우를 명확히 정의</li>
      <li>기능 범위와 비범위를 합의</li>
      <li>팀 간 공통 이해 기반 마련</li>
    </ul>
    <h3>대상 사용자</h3>
    <ul>
      <li>초기 베타 사용자(개발자/기획자/디자이너)</li>
      <li>소규모 프로젝트 팀</li>
    </ul>
    <h3>범위(비범위)</h3>
    <ul>
      <li>범위: 프로젝트 생성/협업/댓글/간단한 배포</li>
      <li>비범위: 오프라인 모드, 복잡한 보고서</li>
    </ul>
  `,
  features: `
    <h2>주요 기능</h2>
    <ol>
      <li><b>프로젝트 관리</b> — 생성/수정, 팀 초대, 권한(Owner/Editor/Viewer)</li>
      <li><b>화면 관리</b> — 썸네일 업로드, 설명, 미리보기</li>
      <li><b>이슈 트래킹</b> — 생성/상태 변경(open/in_progress/closed), 담당자</li>
      <li><b>댓글/주석</b> — 인라인 코멘트, 스레드</li>
      <li><b>알림</b> — 상태 변경/멘션/배포 완료</li>
    </ol>
    <h3>수용 기준(예시)</h3>
    <ul>
      <li>이슈 상태 변경 시 타임라인에 기록된다.</li>
      <li>댓글 작성 후 1초 이내 UI에 반영된다.</li>
      <li>읽지 않은 알림이 헤더 배지에 표시된다.</li>
    </ul>
  `,
  flow: `
    <h2>화면 흐름</h2>
    <h3>핵심 시나리오</h3>
    <ol>
      <li>프로젝트 생성 → 팀원 초대 → 화면 등록 → 이슈 생성/할당</li>
      <li>대시보드 진입 → 미해결 이슈 확인 → 상세 이동 → 상태 변경</li>
    </ol>
    <h3>유저 스토리</h3>
    <ul>
      <li>기획자: "새 이슈를 만들고 담당자를 지정하고 싶다."</li>
      <li>개발자: "화면 변경 이력을 빠르게 확인하고 싶다."</li>
      <li>디자이너: "댓글로 디자인 피드백을 남기고 싶다."</li>
    </ul>
    <p><i>(다이어그램 영역) flowchart는 별도 툴/이미지로 첨부</i></p>
  `,
  data: `
    <h2>데이터 모델</h2>
    <h3>엔티티 요약</h3>
    <ul>
      <li>Project: id, name, summary, createdAt, updatedAt</li>
      <li>Screen: id, projectId, title, imageUrl, description</li>
      <li>Issue: id, projectId, title, status, assigneeId, createdAt</li>
      <li>User: id, name, avatar, role</li>
      <li>Comment: id, targetId, userId, content, createdAt</li>
    </ul>
    <h3>간단 스키마(JSON)</h3>
    <pre><code>{
  "Project": {
    "id": "string",
    "name": "string",
    "summary": "string",
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
  },
  "Issue": {
    "id": "string",
    "projectId": "string",
    "title": "string",
    "status": "open|in_progress|closed",
    "assigneeId": "string|null",
    "createdAt": "ISODate"
  }
}</code></pre>
  `,
  api: `
    <h2>API 요약</h2>
    <h3>프로젝트</h3>
    <ul>
      <li>GET /api/projects — 프로젝트 목록</li>
      <li>GET /api/projects/{projectId} — 프로젝트 상세</li>
      <li>POST /api/projects — 프로젝트 생성</li>
    </ul>
    <h3>이슈</h3>
    <ul>
      <li>GET /api/projects/{projectId}/issues?status=... — 이슈 목록</li>
      <li>POST /api/projects/{projectId}/issues — 이슈 생성</li>
      <li>PATCH /api/projects/{projectId}/issues/{issueId} — 상태 변경</li>
    </ul>
    <h3>예시 요청/응답</h3>
    <pre><code>POST /api/projects
Content-Type: application/json

{
  "name": "대시보드 개선",
  "summary": "위젯 성능 최적화"
}</code></pre>
    <pre><code>{
  "data": {
    "id": "prj-001",
    "name": "대시보드 개선",
    "summary": "위젯 성능 최적화",
    "createdAt": "2025-08-09T09:00:00.000Z"
  }
}</code></pre>
  `,
  priority: `
    <h2>우선순위(MoSCoW)</h2>
    <h3>Must</h3>
    <ul>
      <li>이슈 생성/상태 변경/담당자 지정</li>
      <li>댓글 작성/표시</li>
      <li>프로젝트/화면 기본 CRUD</li>
    </ul>
    <h3>Should</h3>
    <ul>
      <li>알림 설정(이메일/인앱)</li>
      <li>간단한 배포 프리뷰</li>
    </ul>
    <h3>Could</h3>
    <ul>
      <li>분석 대시보드 위젯</li>
      <li>가상 스크롤 최적화</li>
    </ul>
    <h3>Won't</h3>
    <ul>
      <li>오프라인 모드</li>
      <li>고급 리포팅</li>
    </ul>
  `
};

// 계산된 속성
const compiledMarkdown = computed(() => {
  // 마크다운을 HTML로 변환
  return editorContent.value;
});

// 메서드들
const defaultSample = (key: string) =>
  `<h2>${key}</h2><p>내용을 입력하세요...</p>`;

const loadSection = async () => {
  const key = currentSection.value as any;
  if (!key) return;

  try {
    // 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    editorContent.value = sectionSamples[key.value] ?? defaultSample(key.label);
  } catch (error) {
    console.error('섹션 로드 실패:', error);
    editorContent.value = defaultSample(key);
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

onMounted(() => {
  loadSection();
});
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
