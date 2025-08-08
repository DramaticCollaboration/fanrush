<template>
  <q-card class="feed-item q-mb-md">
    <q-card-section horizontal>
      <!-- 썸네일 -->
      <q-img
        :src="item.thumbnail"
        :ratio="16/9"
        class="col-5"
        @click="navigateToProject"
      />

      <q-card-section class="col-7">
        <div class="row items-center q-mb-sm">
          <q-avatar size="28px" class="q-mr-sm">
            <img :src="item.author.avatar">
          </q-avatar>
          <div class="text-subtitle2">{{ item.author.name }}</div>
          <q-space />
          <q-btn flat round size="sm" icon="more_vert">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="saveProject">
                  <q-item-section>
                    {{ item.isSaved ? '저장 취소' : '저장' }}
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="shareProject">
                  <q-item-section>공유</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div class="text-h6 ellipsis-2-lines cursor-pointer" @click="navigateToProject">
          {{ item.title }}
        </div>
        <p class="text-body2 ellipsis-2-lines q-mb-sm">{{ item.summary }}</p>

        <div class="row items-center">
          <div class="row items-center q-gutter-x-md">
            <q-btn flat round size="sm" :icon="item.isLiked ? 'favorite' : 'favorite_border'"
                   :color="item.isLiked ? 'red' : 'grey'" @click="toggleLike">
              <q-tooltip>좋아요 {{ item.likes }}</q-tooltip>
            </q-btn>
            <q-btn flat round size="sm" icon="chat_bubble_outline" @click="showComments">
              <q-tooltip>댓글 {{ item.comments }}</q-tooltip>
            </q-btn>
          </div>
          <q-space />
          <div class="row items-center q-gutter-x-sm">
            <q-chip
              v-for="tag in item.tags"
              :key="tag"
              size="sm"
              color="primary"
              text-color="white"
              @click="$emit('tag-click', tag)"
            >
              {{ tag }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FeedItem } from './models'

const router = useRouter()
const props = defineProps<{
  item: FeedItem
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'save'): void
  (e: 'tag-click', tag: string): void
}>()

function navigateToProject() {
  router.push(`/project/${props.item.projectId}`)
}

function toggleLike() {
  emit('like')
}

function saveProject() {
  emit('save')
}

function shareProject() {
  // 공유 기능 구현
}

function showComments() {
  // 댓글 표시 기능 구현
}
</script>

<style scoped>
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
