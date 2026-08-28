<script setup lang="ts">
// @ts-nocheck
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  PieChart,
} from 'lucide-vue-next';
import { login } from '@/store';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPass = ref(false);
const error = ref('');
const loading = ref(false);

const demos = [
  { role: 'Administrador', email: 'admin@finzen.app', password: 'admin123' },
  { role: 'Usuario', email: 'user@finzen.app', password: 'user123' },
];

function useDemo(d) {
  email.value = d.email;
  password.value = d.password;
  error.value = '';
}

async function submit() {
  error.value = '';
  if (!email.value || !password.value) {
    error.value = 'Introduce email y contraseña.';
    return;
  }
  loading.value = true;
  // small delay to show the loading state
  await new Promise((r) => setTimeout(r, 450));
  const res = login(email.value, password.value);
  loading.value = false;
  if (!res.ok) {
    error.value = res.error;
    return;
  }
  router.push({ name: 'dashboard' });
}
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

    <!-- Right: form -->
    <section class="form-side">
      <div class="form-card fade-up">
        <div class="form-brand">
          <div class="hero-mark"><Wallet :size="20" /></div>
          <span>FinZen</span>
        </div>
        <h2>Bienvenido de nuevo</h2>
        <p class="muted">Accede a tu panel de finanzas personales.</p>

        <form @submit.prevent="submit" class="form">
          <div class="field">
            <label for="email">Correo electrónico</label>
            <div class="input-icon">
              <Mail :size="17" class="ii" />
              <input
                id="email"
                class="input"
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <div class="input-icon">
              <Lock :size="17" class="ii" />
              <input
                id="password"
                class="input"
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle"
                @click="showPass = !showPass"
                :aria-label="showPass ? 'Ocultar' : 'Mostrar'"
              >
                <EyeOff v-if="showPass" :size="17" />
                <Eye v-else :size="17" />
              </button>
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn btn-primary submit" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Accediendo…' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="demo">
          <span class="demo-label">Cuentas de demostración</span>
          <div class="demo-grid">
            <button v-for="d in demos" :key="d.email" class="demo-btn" @click="useDemo(d)">
              <strong>{{ d.role }}</strong>
              <span class="muted">{{ d.email }}</span>
            </button>
          </div>
        </div>
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

/* Form */
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
.form-brand {
  display: none;
  align-items: center;
  gap: 10px;
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 24px;
}
.form-brand .hero-mark {
  background: var(--primary);
  color: var(--primary-contrast);
}
.form-card h2 {
  font-size: 1.6rem;
}
.form-card > .muted {
  margin-bottom: 26px;
  font-size: 0.92rem;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon .ii {
  position: absolute;
  left: 13px;
  color: var(--text-soft);
  pointer-events: none;
}
.input-icon .input {
  padding-left: 40px;
}
.toggle {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-soft);
  display: grid;
  place-items: center;
  padding: 4px;
}
.error {
  color: var(--danger);
  font-size: 0.85rem;
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  padding: 9px 12px;
  border-radius: 10px;
}
.submit {
  margin-top: 4px;
  padding: 12px;
  font-size: 0.95rem;
}
.spinner {
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

.demo {
  margin-top: 28px;
}
.demo-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-soft);
  margin-bottom: 10px;
  text-align: center;
}
.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.demo-btn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 0.8rem;
  transition:
    border-color 0.18s ease,
    transform 0.15s ease;
}
.demo-btn:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}
.demo-btn strong {
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .hero {
    display: none;
  }
  .form-brand {
    display: flex;
  }
}
</style>
