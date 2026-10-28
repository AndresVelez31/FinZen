<script setup lang="ts">
// External imports
import { computed, ref, useHead } from '#imports';

// Internal imports
import { FormattersUtil } from '~/utils/FormattersUtil';
import { SavingsCalculatorUtil } from '~/utils/SavingsCalculatorUtil';

// Reactive variables
const monthlyContribution = ref<number>(200000);
const annualRatePercent = ref<number>(8);
const months = ref<number>(12);

// Computed
const hasValidInputs = computed(
  () =>
    Number.isFinite(monthlyContribution.value) &&
    Number.isFinite(annualRatePercent.value) &&
    Number.isInteger(months.value) &&
    monthlyContribution.value >= 0 &&
    annualRatePercent.value >= 0 &&
    months.value >= 0,
);

const projection = computed(() =>
  SavingsCalculatorUtil.calculateProjection(
    monthlyContribution.value,
    annualRatePercent.value,
    months.value,
  ),
);

// Actions
useHead({ title: 'Calculadora de ahorro · FinZen' });
</script>

<template>
  <section>
    <NuxtLink to="/tools" class="btn btn-link px-0">← Volver a herramientas</NuxtLink>
    <h1 class="mb-4">Calculadora de ahorro</h1>

    <div class="row g-4">
      <form class="col-12 col-md-6" @submit.prevent>
        <div class="mb-3">
          <label for="monthlyContribution" class="form-label">Aporte mensual (COP)</label>
          <input
            id="monthlyContribution"
            v-model.number="monthlyContribution"
            type="number"
            min="0"
            class="form-control"
          />
        </div>
        <div class="mb-3">
          <label for="annualRatePercent" class="form-label">Tasa anual (%)</label>
          <input
            id="annualRatePercent"
            v-model.number="annualRatePercent"
            type="number"
            min="0"
            step="0.1"
            class="form-control"
          />
        </div>
        <div class="mb-3">
          <label for="months" class="form-label">Meses</label>
          <input id="months" v-model.number="months" type="number" min="0" class="form-control" />
        </div>
      </form>

      <div class="col-12 col-md-6">
        <div v-if="!hasValidInputs" class="alert alert-warning">
          Ingresa valores numéricos mayores o iguales a cero (los meses, enteros).
        </div>
        <div v-else class="card">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between">
              <span>Total aportado</span>
              <strong>{{ FormattersUtil.formatToCOP(projection.totalContributed) }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Intereses ganados</span>
              <strong>{{ FormattersUtil.formatToCOP(projection.totalInterest) }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between text-primary">
              <span>Saldo final</span>
              <strong>{{ FormattersUtil.formatToCOP(projection.finalBalance) }}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
