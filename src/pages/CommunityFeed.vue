
<template>
  <q-page class="q-pa-md">
    <div class="feed-container">
      <!-- 필터 헤더 -->
      <div class="filter-header q-mb-lg">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm-auto">
            <q-btn-toggle
              v-model="feedType"
              spread
              :options="[
                { label: '전체', value: 'all' },
                { label: '팔로잉', value: 'following' },
                { label: '인기', value: 'trending' }
              ]"
              color="primary"
              text-color="white"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-select
              v-model="selectedTags"
              multiple
              :options="availableTags"
              label="태그 필터"
              dense
              options-dense
              use-chips
              class="full-width"
            />
          </div>
        </div>
      </div>

      <!-- 피드 목록 -->
      <div class="feed-list" v-infinite-scroll="loadMore">
        <template v-if="feedItems.length > 0">
          <feed-item
            v-for="item in feedItems"
            :key="item.id"
            :item="item"
            @like="toggleLike(item)"
            @save="toggleSave(item)"
            @tag-click="addTag"
          />
        </template>
        <div v-else class="text-center q-pa-lg">
          <q-spinner-dots color="primary" size="40" v-if="loading" />
          <div v-else class="text-grey">표시할 프로젝트가 없습니다.</div>
        </div>
      </div>

      <!-- 로딩 인디케이터 -->
      <div v-if="loading && feedItems.length > 0" class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40" />
      </div>
    </div>

    <!-- 댓글 다이얼로그 -->
    <q-dialog v-model="showCommentDialog" position="right">
      <q-card style="width: 400px; max-width: 100vh;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">댓글</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh">
          <q-list>
            <q-item v-for="comment in comments" :key="comment.id">
              <q-item-section avatar>
                <q-avatar>
                  <img :src="comment.userAvatar">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ comment.userName }}</q-item-label>
                <q-item-label caption>{{ comment.content }}</q-item-label>
                <q-item-label caption>{{ formatDate(comment.createdAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input
            v-model="newComment"
            label="댓글 작성"
            dense
            @keyup.enter="addComment"
          >
            <template v-slot:after>
              <q-btn round dense flat icon="send" @click="addComment" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FeedItem from 'components/FeedItem.vue'
import type { FeedItem as FeedItemType, Comment, FeedType } from 'components/models'

const feedType = ref<FeedType>('all')
const selectedTags = ref<string[]>([])
const feedItems = ref<FeedItemType[]>([])
const loading = ref(false)
const page = ref(1)
const showCommentDialog = ref(false)
const comments = ref<Comment[]>([])
const newComment = ref('')

const availableTags = [
  'Web', 'Mobile', 'AI', 'Game', 'Education',
  'Healthcare', 'Finance', 'E-commerce', 'Social'
]

// 샘플 데이터 로드
const loadMore = async () => {
  if (loading.value) return

  loading.value = true
  // 실제 구현에서는 API 호출
  await new Promise(resolve => setTimeout(resolve, 1000))

  const newItems: FeedItemType[] = Array(5).fill(null).map((_, index) => ({
    id: `${page.value}-${index}`,
    projectId: `project-${page.value}-${index}`,
    title: `멋진 프로젝트 ${page.value}-${index}`,
    summary: '이 프로젝트는 AI를 활용한 혁신적인 웹 서비스입니다.',
    thumbnail: `https://placehold.co/600x${300 + index}`,
    author: {
      id: 'user1',
      name: '김개발',
      avatar: 'https://placehold.co/100x100'
    },
    tags: ['Web', 'AI'],
    isPublic: true,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString()
  }))

  feedItems.value.push(...newItems)
  page.value++
  loading.value = false
}

function toggleLike(item: FeedItemType) {
  item.isLiked = !item.isLiked
  item.likes += item.isLiked ? 1 : -1
}

function toggleSave(item: FeedItemType) {
  item.isSaved = !item.isSaved
}

function addTag(tag: string) {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

function addComment() {
  if (!newComment.value.trim()) return

  comments.value.push({
    id: Date.now().toString(),
    userId: 'current-user',
    userName: '현재 사용자',
    userAvatar: 'https://placehold.co/100x100',
    content: newComment.value,
    createdAt: new Date().toISOString(),
    likes: 0
  })

  newComment.value = ''
}

onMounted(() => {
  void loadMore()
})
</script>

<style scoped>
.feed-container {
  max-width: 800px;
  margin: 0 auto;
}

.filter-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 1rem 0;
}
</style>
