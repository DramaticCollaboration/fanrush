<template>
  <div>
    <div v-if="showSplash" class="splash" @click="enter">
      <img src="/images/main.png" alt="FanRush Splash" />
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showSplash = ref(true);

onMounted(() => {
  // Always show splash on initial site access
  showSplash.value = true;
});

function enter() {
  showSplash.value = false;
  // Navigate to IndexPage (dashboard)
  router.push({ name: 'dashboard' });
}
</script>

<style scoped>
.splash {
  width: 100vw;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
}
.splash img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
