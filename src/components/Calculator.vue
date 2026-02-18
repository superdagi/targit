<template>
  <div class="row no-wrap items-start" data-component="CalculatorGame">
    <div
      class="calculator q-pa-md q-mt-sm column items-center bg-grey-2 shadow-2"
      style="max-width: 340px; border-radius: 14px; min-width: 260px"
    >
      <div class="full-width">
        <q-input
          v-model="calcInput"
          filled
          readonly
          class="full-width text-right text-h6"
          input-class="text-right"
        />
      </div>
      <div class="column full-width">
        <div class="row q-gutter-sm">
          <q-btn
            v-for="n in [7, 8, 9]"
            :key="n"
            :label="n"
            @click="append(n)"
            color="primary"
            flat
            class="col"
            size="lg"
          />
          <q-btn
            v-if="!props.hideOperators"
            label="/"
            @click="append('/')"
            color="secondary"
            flat
            class="col"
            size="lg"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="n in [4, 5, 6]"
            :key="n"
            :label="n"
            @click="append(n)"
            color="primary"
            flat
            class="col"
            size="lg"
          />
          <q-btn
            v-if="!props.hideOperators"
            label="*"
            @click="append('*')"
            color="secondary"
            flat
            class="col"
            size="lg"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="n in [1, 2, 3]"
            :key="n"
            :label="n"
            @click="append(n)"
            color="primary"
            flat
            class="col"
            size="lg"
          />
          <q-btn
            v-if="!props.hideOperators"
            label="-"
            @click="append('-')"
            color="secondary"
            flat
            class="col"
            size="lg"
          />
        </div>
        <div class="row q-gutter-xs">
          <q-btn label="C" @click="clearCalc" color="negative" flat class="col" size="lg" />
          <q-btn label="0" @click="append(0)" color="primary" flat class="col" size="lg" />
          <q-btn label="=" @click="calculate" color="white" flat class="col bg-green" size="lg" />
          <q-btn
            v-if="!props.hideOperators"
            label="+"
            @click="append('+')"
            color="secondary"
            flat
            class="col"
            size="lg"
          />
        </div>
      </div>
    </div>
    <!-- Light bulbs UI removed; now handled in CalculatorGame.vue -->
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CalculatorGame' });
import { ref, watch } from 'vue';

const props = defineProps<{ reset?: number; hideOperators?: boolean }>();
// Watch for reset prop changes to clear calculator
watch(
  () => props.reset,
  () => {
    hits.value = 0;
  },
);
const emit = defineEmits<{
  (e: 'result', result: number): void;
}>();

const calcInput = ref('');
const hits = ref(0);

const append = (val: string | number) => {
  calcInput.value += val;
};

const clearCalc = () => {
  calcInput.value = '';
};

const calculate = () => {
  try {
    const input = calcInput.value;
    const result = eval(input);
    calcInput.value = result.toString();
    emit('result', Number(result));
    calcInput.value = '';
  } catch {
    calcInput.value = 'Error';
    emit('result', NaN);
  }
};
</script>
