<script setup lang="ts">
// @ts-nocheck
defineProps({
  label: String,
  value: String,
  icon: [Object, Function],
  accent: { type: String, default: 'var(--primary)' },
  trend: { type: String, default: '' },
  trendUp: { type: Boolean, default: true },
});
</script>

<template>
  <div class="card stat">
    <div class="stat-top">
      <span class="stat-label">{{ label }}</span>
      <span
        class="stat-icon"
        :style="{ background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent }"
      >
        <component :is="icon" :size="18" />
      </span>
    </div>
    <div class="stat-value">{{ value }}</div>
    <div v-if="trend" class="stat-trend" :class="trendUp ? 'up' : 'down'">{{ trend }}</div>
  </div>
</template>

<style scoped>
.stat {
  padding: 20px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.stat:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.stat-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 600;
}
.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
}
.stat-value {
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 1.7rem;
  letter-spacing: -0.02em;
}
.stat-trend {
  margin-top: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}
.stat-trend.up {
  color: var(--primary-strong);
}
html.dark .stat-trend.up {
  color: var(--primary);
}
.stat-trend.down {
  color: var(--danger);
}
</style>
