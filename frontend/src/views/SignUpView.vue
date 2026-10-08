<script setup lang="ts">
// External imports
import { Eye, EyeOff, Lock, Mail, User, Wallet } from 'lucide-vue-next';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// Internal imports
import type { SignUpFormErrorsInterface } from '@/interfaces/SignUpFormErrorsInterface.js';
import { AuthService } from '@/services/AuthService.js';

// Variables
const router = useRouter();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reactive variables
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});
const errors = ref<SignUpFormErrorsInterface>({});
// The API's answer (e.g. an e-mail that already exists), shown below the fields.
const errorMessage = ref('');
const showPassword = ref(false);
const saving = ref(false);

// Actions
// Mirrors the rules of the API (SignUpDto), so most mistakes are caught before the request.
function validate(): boolean {
  const validationErrors: SignUpFormErrorsInterface = {};

  if (!form.value.name.trim()) {
    validationErrors.name = 'Introduce tu nombre.';
  }
  if (!EMAIL_PATTERN.test(form.value.email.trim())) {
    validationErrors.email = 'Introduce un correo electrónico válido.';
  }
  if (form.value.password.length < 12 || form.value.password.length > 128) {
    validationErrors.password = 'La contraseña debe tener entre 12 y 128 caracteres.';
  }
  if (form.value.password !== form.value.confirmPassword) {
    validationErrors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  errors.value = validationErrors;
  return Object.keys(validationErrors).length === 0;
}

async function submit(): Promise<void> {
  errorMessage.value = '';

  if (saving.value || !validate()) {
    return;
  }

  saving.value = true;

  try {
    await AuthService.signUp({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });
    await router.push({ name: 'overview' });
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="auth-form">
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
            v-model="form.name"
            class="input"
            type="text"
            placeholder="Tu nombre"
            autocomplete="name"
            :aria-invalid="Boolean(errors.name)"
            required
          />
        </div>
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <div class="input-icon">
          <Mail :size="17" class="ii" />
          <input
            id="email"
            v-model="form.email"
            class="input"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            required
          />
        </div>
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <div class="input-icon">
          <Lock :size="17" class="ii" />
          <input
            id="password"
            v-model="form.password"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••••••"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.password)"
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
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        <span v-else class="muted hint">Mínimo 12 caracteres.</span>
      </div>

      <div class="field">
        <label for="confirm-password">Confirmar contraseña</label>
        <div class="input-icon">
          <Lock :size="17" class="ii" />
          <input
            id="confirm-password"
            v-model="form.confirmPassword"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••••••"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.confirmPassword)"
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
        <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
      </div>

      <p v-if="errorMessage" class="error" role="alert" aria-live="polite">
        {{ errorMessage }}
      </p>

      <button class="btn btn-primary submit" type="submit" :disabled="saving" :aria-busy="saving">
        <span v-if="saving" class="spinner" aria-hidden="true"></span>
        {{ saving ? 'Creando cuenta…' : 'Crear cuenta' }}
      </button>
    </form>

    <p class="switch">
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: 'sign-in' }">Inicia sesión</RouterLink>
    </p>
  </div>
</template>
