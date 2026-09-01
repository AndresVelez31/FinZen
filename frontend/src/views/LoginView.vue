<script setup lang="ts">
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
import { UserService } from '@/services/UserService.js';

interface DemoAccount {
  role: string;
  email: string;
  password: string;
}

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const loading = ref(false);

const demoAccounts: DemoAccount[] = [
  { role: 'Administrador', email: 'admin@finzen.app', password: 'admin123' },
  { role: 'Usuario', email: 'user@finzen.app', password: 'user123' },
];

function useDemoAccount(account: DemoAccount): void {
  email.value = account.email;
  password.value = account.password;
  errorMessage.value = '';
}

async function submit(): Promise<void> {
  errorMessage.value = '';

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Introduce el correo y la contraseña.';
    return;
  }

  loading.value = true;

  try {
    const result = UserService.login(email.value, password.value);

    if (!result.ok) {
      errorMessage.value = result.error;
      return;
    }

    await router.push({ name: 'dashboard' });
  } catch {
    errorMessage.value = 'No fue posible iniciar sesión. Inténtalo nuevamente.';
  } finally {
    loading.value = false;
  }
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

        <form class="form" novalidate @submit.prevent="submit">
          <div class="field">
            <label for="email">Correo electrónico</label>
            <div class="input-icon">
              <Mail :size="17" class="ii" />
              <input
                id="email"
                v-model="email"
                class="input"
                type="email"
                placeholder="tu@email.com"
                autocomplete="email"
                :aria-invalid="Boolean(errorMessage)"
                required
              />
            </div>
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <div class="input-icon">
              <Lock :size="17" class="ii" />
              <input
                id="password"
                v-model="password"
                class="input"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :aria-invalid="Boolean(errorMessage)"
                required
              />
              <button
                type="button"
                class="toggle"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="17" />
                <Eye v-else :size="17" />
              </button>
            </div>
          </div>

          <p v-if="errorMessage" class="error" role="alert" aria-live="polite">
            {{ errorMessage }}
          </p>

          <button
            class="btn btn-primary submit"
            type="submit"
            :disabled="loading"
            :aria-busy="loading"
          >
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{ loading ? 'Accediendo…' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="demo">
          <span class="demo-label">Cuentas de demostración</span>
          <div class="demo-grid">
            <button
              v-for="account in demoAccounts"
              :key="account.email"
              class="demo-btn"
              type="button"
              @click="useDemoAccount(account)"
            >
              <strong>{{ account.role }}</strong>
              <span class="muted">{{ account.email }}</span>
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
  color: var(--text);
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
