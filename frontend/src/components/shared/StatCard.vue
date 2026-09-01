<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  title: string;
  value: string;
  icon?: string | Component;
  variant?: 'default' | 'income' | 'expense';
  trend?: string;
  trendUp?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  trendUp: true,
});
</script>

<template>
  <div class="card stat" :class="variant">
    <div class="stat-top">
      <span class="stat-title">
        {{ title }}
      </span>

      <span v-if="icon" class="stat-icon">
        <span v-if="typeof icon === 'string'">
          {{ icon }}
        </span>

        <component
          v-else
          :is="icon"
          :size="18"
        />
      </span>
    </div>

    <div class="stat-value">
      {{ value }}
    </div>

    <div v-if="trend" class="stat-trend" :class="trendUp ? 'up' : 'down'">
      {{ trend }}
    </div>
  </div>
</template>

<style scoped>
.stat {
  --stat-color: var(--primary);

  padding: 20px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.stat.income {
  --stat-color: var(--info);
}

.stat.expense {
  --stat-color: var(--danger);
}

.stat:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.stat-title {
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
  flex-shrink: 0;

  background: color-mix(
    in srgb,
    var(--stat-color) 15%,
    transparent
  );

  color: var(--stat-color);
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

@media (max-width: 560px) {
  .stat {
    padding: 16px;
  }

  .stat-value {
    font-size: 1.45rem;
  }
}
</style>