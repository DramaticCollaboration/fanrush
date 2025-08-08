
<template>
  <q-page class="q-pa-md  flex items-center justify-center q-px-lg q-py-xl">
    <div class="login-card shadow-2 rounded bg-white q-pa-lg" style="max-width: 1000px; width: 100%;">
    <!-- Welcome Section -->
    <div class="row items-center q-mb-lg">
      <div class="text-h5 q-mr-auto">안녕하세요, {{ userDisplayName }}님!</div>
      <q-btn color="primary" icon="add" label="새 프로젝트" @click="createNewProject" />
    </div>

    <!-- My Projects Section -->
    <div class="q-mb-xl">
      <div class="text-h6 q-mb-md">내 프로젝트</div>
      <div v-if="myProjects.length === 0" class="text-center q-pa-lg">
        <q-icon name="emoji_objects" size="48px" color="grey-6" />
        <div class="text-grey-6 q-mt-sm">아직 프로젝트가 없습니다. 새로운 아이디어를 시작해보세요!</div>
      </div>
      <div v-else class="row q-col-gutter-md">
        <div v-for="project in myProjects" :key="project.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="project-card">
            <q-img
              :src="project.thumbnail || 'default-project-thumbnail.png'"
              basic
              height="200px"
            >
              <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                {{ project.name }}
              </div>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1">{{ project.name }}</div>
              <div class="text-caption text-grey">{{ project.description }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="grey" icon="visibility" @click="viewProject(project.id)" />
              <q-btn flat color="primary" icon="edit" @click="editProject(project.id)" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Recent Activities Section -->
    <div class="q-mb-xl">
      <div class="text-h6 q-mb-md">최근 활동</div>
      <q-list bordered separator>
        <q-item v-for="activity in recentActivities" :key="activity.id" clickable v-ripple>
          <q-item-section avatar>
            <q-icon :name="activity.icon" :color="activity.color" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ activity.message }}</q-item-label>
            <q-item-label caption>{{ formatDate(activity.timestamp) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Recommended Projects Section -->
    <div>
      <div class="text-h6 q-mb-md">추천 프로젝트</div>
      <div class="row q-col-gutter-md">
        <div v-for="project in recommendedProjects" :key="project.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="project-card">
            <q-img
              :src="project.thumbnail || 'default-project-thumbnail.png'"
              basic
              height="200px"
            >
              <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                {{ project.name }}
              </div>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1">{{ project.name }}</div>
              <div class="text-caption text-grey">{{ project.description }}</div>
              <div class="text-caption q-mt-sm">
                <q-chip
                  v-for="tag in project.tags"
                  :key="tag"
                  size="sm"
                  outline
                  color="primary"
                >
                  {{ tag }}
                </q-chip>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" label="자세히 보기" @click="viewProject(project.id)" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { date } from 'quasar';

import { useRouter } from 'vue-router'

const router = useRouter()


// Mock data (실제 구현 시 API로 대체)
const userDisplayName = ref('사용자');
const myProjects = ref([
  {
    id: 1,
    name: '쇼핑몰 프로젝트',
    description: 'AI 기반 개인화 쇼핑 경험 제공 서비스',
    thumbnail: "https://placehold.co/600x400"
  },
  {
    id: 2,
    name: '교육 플랫폼',
    description: '맞춤형 학습 콘텐츠 제공 플랫폼',
    thumbnail: "https://placehold.co/600x400"
  }
]);

const recentActivities = ref([
  {
    id: 1,
    icon: 'create_new_folder',
    color: 'primary',
    message: '새로운 프로젝트 "쇼핑몰 프로젝트"를 생성했습니다.',
    timestamp: new Date()
  },
  {
    id: 2,
    icon: 'edit',
    color: 'secondary',
    message: '"교육 플랫폼" 프로젝트의 기능 명세서를 수정했습니다.',
    timestamp: new Date(Date.now() - 86400000)
  }
]);

const recommendedProjects = ref([
  {
    id: 3,
    name: '헬스케어 앱',
    description: 'AI 트레이너 기반 개인 맞춤 운동 추천',
    thumbnail: "https://placehold.co/600x400",
    tags: ['헬스케어', 'AI', '모바일']
  },
  {
    id: 4,
    name: '여행 플래너',
    description: '맞춤형 여행 일정 추천 서비스',
    thumbnail: "https://placehold.co/600x400",
    tags: ['여행', '추천', '소셜']
  }
]);

// Methods
const createNewProject = () => {
  router.push('/idea/new')
};

const viewProject = (projectId: number) => {
  router.push('/project/sample')

};

const editProject = (projectId: number) => {
  router.push('idea/sample/code')
};

const formatDate = (timestamp: Date) => {
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm');
};

onMounted(() => {
  // API 호출 및 데이터 로딩
});
</script>

<style scoped>
.project-card {
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
}
</style>
