<script setup lang="ts">
// External imports
import type { Component } from 'vue';

// Props
const props = withDefaults(
  defineProps<{
    title: string;
    value: string;
    icon?: string | Component;
    variant?: 'default' | 'income' | 'expense';
    trend?: string;
    trendUp?: boolean;
  }>(),
  {
    variant: 'default',
    trendUp: true,
  },
);
</script>

<template>
  <div class="card stat" :class="props.variant">
    <div class="stat-top">
      <span class="stat-title">
        {{ props.title }}
      </span>

      <span v-if="props.icon" class="stat-icon">
        <span v-if="typeof props.icon === 'string'">
          {{ props.icon }}
        </span>

        <component
          v-else
          :is="props.icon"
          :size="18"
        />
      </span>
    </div>

    <div class="stat-value">
      {{ props.value }}
    </div>

    <div v-if="props.trend" class="stat-trend" :class="props.trendUp ? 'up' : 'down'">
      {{ props.trend }}
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

.stat-value {
  font-variant-numeric: tabular-nums;
}

/* Phones: a short row (icon, label, value) so three cards don't fill the whole screen */
@media (max-width: 560px) {
  .stat {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'icon title'
      'icon value'
      'icon trend';
    column-gap: 14px;
    align-items: center;
    padding: 14px 16px;
  }

  .stat-top {
    display: contents;
  }

  .stat-title {
    grid-area: title;
  }

  .stat-icon {
    grid-area: icon;
    width: 44px;
    height: 44px;
    border-radius: 13px;
  }

  .stat-value {
    grid-area: value;
    font-size: 1.35rem;
    line-height: 1.25;
  }

  .stat-trend {
    grid-area: trend;
    margin-top: 0;
    font-size: 0.76rem;
  }

  .stat:hover {
    transform: none;
  }
}
</style>