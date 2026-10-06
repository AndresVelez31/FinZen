<script setup lang="ts">
// External imports
import { Eye, EyeOff, Lock, Mail, User, Wallet } from 'lucide-vue-next';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// Internal imports
import AuthLayoutComponent from '@/components/auth/AuthLayoutComponent.vue';
import { AuthService } from '@/services/AuthService.js';

// Variables
const router = useRouter();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reactive variables
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const loading = ref(false);

// Actions
// Mirrors the rules of the API (SignUpDto), so most mistakes are caught before the request.
function validate(): boolean {
  if (!name.value.trim()) {
    errorMessage.value = 'Introduce tu nombre.';
    return false;
  }

  if (!EMAIL_PATTERN.test(email.value.trim())) {
    errorMessage.value = 'Introduce un correo electrónico válido.';
    return false;
  }

  if (password.value.length < 12 || password.value.length > 128) {
    errorMessage.value = 'La contraseña debe tener entre 12 y 128 caracteres.';
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return false;
  }

  return true;
}

async function submit(): Promise<void> {
  errorMessage.value = '';

  if (!validate()) {
    return;
  }

  loading.value = true;

  try {
    await AuthService.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
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
    <h2>Crea tu cuenta</h2>
    <p class="muted">Empieza a organizar tus finanzas en minutos.</p>

    <form class="form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="name">Nombre</label>
        <div class="input-icon">
          <User :size="17" class="ii" />
          <input
            id="name"
            v-model="name"
            class="input"
            type="text"
            placeholder="Tu nombre"
            autocomplete="name"
            :aria-invalid="Boolean(errorMessage)"
            required
          />
        </div>
      </div>

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
            placeholder="••••••••••••"
            autocomplete="new-password"
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
        <span class="muted hint">Mínimo 12 caracteres.</span>
      </div>

      <div class="field">
        <label for="confirm-password">Confirmar contraseña</label>
        <div class="input-icon">
          <Lock :size="17" class="ii" />
          <input
            id="confirm-password"
            v-model="confirmPassword"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••••••"
            autocomplete="new-password"
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
        {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
      </button>
    </form>

    <p class="switch">
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: 'login' }">Inicia sesión</RouterLink>
    </p>
  </AuthLayoutComponent>
</template>
