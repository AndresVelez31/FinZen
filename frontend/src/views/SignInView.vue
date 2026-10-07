<script setup lang="ts">
// External imports
import { Eye, EyeOff, Lock, Mail, Wallet } from 'lucide-vue-next';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// Internal imports
import AuthLayoutComponent from '@/components/auth/AuthLayoutComponent.vue';
import type { DemoAccountInterface } from '@/interfaces/DemoAccountInterface.js';
import { AuthService } from '@/services/AuthService.js';

// Variables
const router = useRouter();

// Reactive variables
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const loading = ref(false);

// Selectors
const demoAccounts: DemoAccountInterface[] = [
  { role: 'Administrador', email: 'admin@finzen.app', password: 'admin123' },
  { role: 'Usuario', email: 'user@finzen.app', password: 'user123' },
];

// Actions
function useDemoAccount(account: DemoAccountInterface): void {
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
    await AuthService.signIn({ email: email.value, password: password.value });
    await router.push({ name: 'overview' });
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayoutComponent>
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

      <button class="btn btn-primary submit" type="submit" :disabled="loading" :aria-busy="loading">
        <span v-if="loading" class="spinner" aria-hidden="true"></span>
        {{ loading ? 'Accediendo…' : 'Iniciar sesión' }}
      </button>
    </form>

    <p class="switch">
      ¿No tienes cuenta?
      <RouterLink :to="{ name: 'sign-up' }">Crea una</RouterLink>
    </p>

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
  </AuthLayoutComponent>
</template>

<style scoped>
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
</style>
