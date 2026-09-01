<script setup lang="ts">
import { computed } from 'vue';
import { UserService } from '@/services/UserService.js';

const currentUser = computed(() => UserService.getCurrentUser());
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">
          Hola, {{ currentUser?.name?.split(' ')[0] ?? 'Usuario' }}
        </h2>

        <p class="muted">
          Bienvenido a tu panel de finanzas personales.
        </p>
      </div>
    </div>

    <section class="card welcome-card">
      <div v-if="currentUser">
        <h3>Sesión iniciada correctamente</h3>

        <p class="muted">
          Has ingresado correctamente a FinZen.
        </p>

        <div class="user-info">
          <div class="info-item">
            <span class="info-label">Nombre</span>
            <span class="info-value">{{ currentUser.name }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Correo</span>
            <span class="info-value">{{ currentUser.email }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Rol</span>
            <span class="badge badge-gray">
              {{ currentUser.role }}
            </span>
          </div>
        </div>
      </div>

      <div v-else>
        <h3>No hay una sesión activa</h3>

        <p class="muted">
          Inicia sesión para acceder a FinZen.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.welcome-card {
  padding: 24px;
}

.welcome-card h3 {
  margin-bottom: 6px;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
}

.info-value {
  font-weight: 600;
}

@media (max-width: 700px) {
  .user-info {
    grid-template-columns: 1fr;
  }
}
</style>