<template>
  <div class="row no-wrap items-start" data-component="CalculatorGame">
    <div
      class="calculator q-pa-md q-mt-xl column items-center bg-grey-2 shadow-2"
      style="max-width: 340px; border-radius: 14px; min-width: 260px"
    >
      <div class="q-mb-md full-width">
        <q-input
          v-model="calcInput"
          label="Calculator"
          filled
          readonly
          class="full-width text-right text-h6"
          input-class="text-right"
        />
      </div>
      <div class="column full-width">
        <div class="row q-gutter-sm q-mb-xs">
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
          <q-btn label="/" @click="append('/')" color="secondary" flat class="col" size="lg" />
        </div>
        <div class="row q-gutter-sm q-mb-xs">
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
          <q-btn label="*" @click="append('*')" color="secondary" flat class="col" size="lg" />
        </div>
        <div class="row q-gutter-sm q-mb-xs">
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
          <q-btn label="-" @click="append('-')" color="secondary" flat class="col" size="lg" />
        </div>
        <div class="row q-gutter-sm q-mb-xs">
          <q-btn label="0" @click="append(0)" color="primary" flat class="col" size="lg" />
          <q-btn label="." @click="append('.')" color="primary" flat class="col" size="lg" />
          <q-btn label="C" @click="clearCalc" color="negative" flat class="col" size="lg" />
          <q-btn label="+" @click="append('+')" color="secondary" flat class="col" size="lg" />
        </div>
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn label="=" @click="calculate" color="accent" class="full-width text-h6" size="lg" />
        </div>
      </div>
    </div>
    <div class="column items-center q-ml-xl q-mt-xl">
      <div v-for="i in 3" :key="i" class="q-mb-md">
        <q-icon :name="'circle'" size="36px" :color="i <= hits ? 'yellow-7' : 'grey-4'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CalculatorGame' });
import { ref, watch } from 'vue';

const props = defineProps<{ target?: number; reset?: number }>();
// Watch for reset prop changes to clear calculator
watch(
  () => props.reset,
  () => {
    hits.value = 0;
  },
);
const emit = defineEmits<{
  (e: 'evaluate', result: number): void;
  (e: 'hits', hits: number): void;
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
    emit('evaluate', Number(result));

    if (props.target !== undefined && Number(result) === props.target) {
      if (hits.value < 3) hits.value++;
    }

    emit('hits', hits.value);
    calcInput.value = '';
  } catch {
    calcInput.value = 'Error';
    emit('evaluate', NaN);
  }
};
</script>
