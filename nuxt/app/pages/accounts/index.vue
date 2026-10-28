<script setup lang="ts">
// External imports
import { useAsyncData, useHead } from '#imports';

// Internal imports
import { AccountService } from '~/services/AccountService';
import { FormattersUtil } from '~/utils/FormattersUtil';

// Reactive variables
// Deliberate exception to "load data only in onMounted": SSR must fetch it on the server.
const { data: accounts, error } = await useAsyncData('accounts', () => AccountService.getAll());

// Actions
useHead({ title: 'Cuentas · FinZen' });
</script>

<template>
  <section>
    <h1 class="mb-1">Cuentas</h1>
    <p class="text-secondary mb-4">
      Renderizadas en el servidor (SSR) con datos de la API de Nuxt.
    </p>

    <div v-if="error" class="alert alert-danger">No se pudieron cargar las cuentas.</div>
    <div v-else-if="!accounts || accounts.length === 0" class="alert alert-info">
      Aún no tienes cuentas registradas.
    </div>
    <div v-else class="row g-3">
      <div v-for="account in accounts" :key="account.id" class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h2 class="h5 mb-0">{{ account.name }}</h2>
            <p class="text-secondary">{{ account.type }}</p>
            <p class="h4 text-primary flex-grow-1">
              {{ FormattersUtil.formatToCOP(account.balance) }}
            </p>
            <NuxtLink class="btn btn-outline-primary" :to="`/accounts/${account.id}`">
              Ver detalle
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
