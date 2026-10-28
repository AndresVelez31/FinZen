<script setup lang="ts">
// External imports
import { createError, definePageMeta, useAsyncData, useHead, useRoute } from '#imports';

// Internal imports
import { AccountService } from '~/services/AccountService';
import { FormattersUtil } from '~/utils/FormattersUtil';

// Variables
// Only the shape of the id is validated here: the accounts live on the server.
definePageMeta({
  validate: (route) => /^\d+$/.test(String(route.params.id)),
});
const route = useRoute();
const accountId = Number(route.params.id);

// Reactive variables
// Same exception as in accounts/index.vue: the data is fetched on the server during render.
const { data: account, error } = await useAsyncData(`account-${accountId}`, () =>
  AccountService.getById(accountId),
);

// Actions
// An unknown account answers a real 404 (rendered by error.vue), like the API does.
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Cuenta no encontrada', fatal: true });
}

useHead({ title: `${account.value?.name ?? 'Cuenta'} · FinZen` });
</script>

<template>
  <section>
    <NuxtLink to="/accounts" class="btn btn-link px-0">← Volver a cuentas</NuxtLink>

    <div v-if="error" class="alert alert-danger">No se pudo cargar la cuenta.</div>
    <div v-else-if="account" class="card">
      <div class="card-body">
        <h1 class="h3">{{ account.name }}</h1>
        <p class="text-secondary">{{ account.type }}</p>
        <p class="display-6 text-primary">{{ FormattersUtil.formatToCOP(account.balance) }}</p>
        <dl class="row mb-0">
          <dt class="col-sm-4">Creada</dt>
          <dd class="col-sm-8">{{ FormattersUtil.formatDate(account.createdAt) }}</dd>
          <dt class="col-sm-4">Última actualización</dt>
          <dd class="col-sm-8">{{ FormattersUtil.formatDate(account.updatedAt) }}</dd>
        </dl>
      </div>
    </div>
  </section>
</template>
