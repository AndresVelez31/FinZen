<script setup lang="ts">
interface Props {
  columns: number;
  rows?: number;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
});
</script>

<template>
  <tr v-for="n in rows" :key="'sk' + n" class="skeleton-row">
    <td v-for="col in columns" :key="col"><span class="skeleton"></span></td>
  </tr>
</template>

<style scoped>
.skeleton {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
