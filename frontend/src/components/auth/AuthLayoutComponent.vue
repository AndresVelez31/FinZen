<script setup lang="ts">
// External imports
import { PieChart, ShieldCheck, TrendingUp, Wallet } from 'lucide-vue-next';
</script>

<template>
  <div class="auth">
    <!-- Left: branding panel -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-brand">
          <div class="hero-mark"><Wallet :size="22" /></div>
          <span>FinZen</span>
        </div>
        <h1 class="hero-title text-balance">Toma el control de tu dinero, sin esfuerzo.</h1>
        <p class="hero-sub">
          Controla gastos, presupuestos y metas de ahorro en un panel claro e inteligente. Diseñado
          para que tus finanzas personales por fin tengan sentido.
        </p>
        <ul class="hero-feats">
          <li>
            <span class="hf-icon"><TrendingUp :size="16" /></span> Seguimiento de balance en tiempo
            real
          </li>
          <li>
            <span class="hf-icon"><PieChart :size="16" /></span> Presupuestos por actividad y
            categoría
          </li>
          <li>
            <span class="hf-icon"><ShieldCheck :size="16" /></span> Metas de ahorro con progreso
            visual
          </li>
        </ul>
      </div>
    </section>

    <!-- Right: the card content of each view -->
    <section class="form-side">
      <div class="form-card fade-up">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
}

/* Hero */
.hero {
  position: relative;
  background: linear-gradient(155deg, #059669 0%, #0f766e 55%, #0b3b34 100%);
  color: #ecfdf5;
  display: flex;
  align-items: center;
  padding: 56px;
  overflow: hidden;
}
.hero::after {
  content: '';
  position: absolute;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  top: -120px;
  right: -120px;
}
.hero::before {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  bottom: -100px;
  left: -80px;
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 440px;
}
.hero-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 1.3rem;
  margin-bottom: 40px;
}
.hero-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  display: grid;
  place-items: center;
}
.hero-title {
  font-size: 2.4rem;
  line-height: 1.15;
  color: #fff;
  margin-bottom: 16px;
}
.hero-sub {
  color: #d1fae5;
  font-size: 1rem;
  margin-bottom: 32px;
}
.hero-feats {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hero-feats li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  font-size: 0.95rem;
}
.hf-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.14);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

/* Form card: the views fill it through the slot, so their elements are reached with :deep() */
.form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--bg);
}
.form-card {
  width: 100%;
  max-width: 400px;
}
.form-card :deep(.form-brand) {
  display: none;
  align-items: center;
  gap: 10px;
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 24px;
}
.form-card :deep(.form-brand .hero-mark) {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: var(--primary-contrast);
}
.form-card :deep(h2) {
  font-size: 1.6rem;
}
.form-card > :deep(.muted) {
  margin-bottom: 26px;
  font-size: 0.92rem;
}
.form-card :deep(.form) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-card :deep(.input-icon) {
  position: relative;
  display: flex;
  align-items: center;
}
.form-card :deep(.input-icon .ii) {
  position: absolute;
  left: 13px;
  color: var(--text-soft);
  pointer-events: none;
}
.form-card :deep(.input-icon .input) {
  padding-left: 40px;
}
.form-card :deep(.toggle) {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-soft);
  display: grid;
  place-items: center;
  padding: 4px;
}
.form-card :deep(.error) {
  color: var(--danger);
  font-size: 0.85rem;
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  padding: 9px 12px;
  border-radius: 10px;
}
.form-card :deep(.submit) {
  margin-top: 4px;
  padding: 12px;
  font-size: 0.95rem;
}
.form-card :deep(.spinner) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.form-card :deep(.hint) {
  font-size: 0.78rem;
}
.form-card :deep(.switch) {
  margin-top: 20px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.form-card :deep(.switch a) {
  color: var(--primary-strong);
  font-weight: 600;
}
.form-card :deep(.switch a:hover) {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .hero {
    display: none;
  }
  .form-card :deep(.form-brand) {
    display: flex;
  }
}
</style>
