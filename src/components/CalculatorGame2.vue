<template>
  <div>
    <div class="row justify-around q-gutter-x">
      <div class="row items-center justify-center">
        <div v-for="i in 5" :key="i">
          <q-icon :name="'circle'" size="21px" :color="i <= hits ? 'yellow-7' : 'grey-4'" />
        </div>
        <div class="text-h4 text-primary q-pl-xl">{{ target }}</div>
      </div>
      <Calculator
        :reset="resetKey"
        :hide-operators="props.hideOperators"
        @result="evaluate($event)"
      />
    </div>
    <q-dialog v-model="showWinner" persistent>
      <q-card class="flex flex-center q-pa-xl" style="min-width: 300px; min-height: 200px">
        <q-spinner color="primary" size="80px" class="q-mb-md" />
        <div class="text-h4 text-center">Winner!</div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Calculator from 'components/Calculator.vue';

const props = defineProps<{ hideOperators?: boolean }>();

const getRandomEquation = () => {
  const a = Math.floor(Math.random() * 11) + 1;
  const b = Math.floor(Math.random() * (20 - a + 1)) + 1;
  return `${a} + ${b}`;
};

const target = ref(getRandomEquation());
const showWinner = ref(false);
const resetKey = ref(0);
const hits = ref(0);

const targetValue = computed(() => {
  try {
    const match = /^\s*(\d+)\s*\+\s*(\d+)\s*$/.exec(target.value);
    if (match) {
      const a = parseInt(match[1] ?? '', 10);
      const b = parseInt(match[2] ?? '', 10);
      return a + b;
    }
    return 0;
  } catch {
    return 0;
  }
});

const evaluate = (value: number) => {
  if (value === targetValue.value) {
    hits.value++;
    if (hits.value >= 5) {
      showWinner.value = true;
      setTimeout(() => {
        showWinner.value = false;
        resetKey.value++;
        hits.value = 0;
        target.value = getRandomEquation();
      }, 2000);
    } else {
      target.value = getRandomEquation();
      resetKey.value++;
    }
  }
};
</script>
