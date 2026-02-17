<template>
  <q-page class="column items-center q-pa-xl">
    <div class="target-number text-center">
      <div
        class="text-h5 text-weight-bold rounded"
        :class="showSuccess ? 'bg-green' : showMiss ? 'bg-red' : ''"
      ></div>
      <div class="text-h2 text-primary">{{ target }}ff</div>
    </div>
    <Calculator
      :target="targetValue ?? -7"
      @evaluate="onEvaluate"
      :reset="resetKey"
      @hits="onHits"
    />
    <q-chip
      v-if="false"
      :label="showSuccess ? 'Correct!' : 'Incorrect!'"
      :color="showSuccess ? 'green' : 'red'"
      text-color="white"
      class="q-mt-md"
      size="lg"
    />
    <q-dialog v-model="showWinner" persistent>
      <q-card class="flex flex-center q-pa-xl" style="min-width: 300px; min-height: 200px">
        <q-spinner color="primary" size="80px" class="q-mb-md" />
        <div class="text-h4 text-center">Winner!</div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Calculator from 'components/Calculator.vue';

// Generate a random target number between 10 and 100
const getRandomEquation = () => {
  // Return a random addition equation with sum up to 20
  const a = Math.floor(Math.random() * 11) + 1; // 1 to 11
  const b = Math.floor(Math.random() * (20 - a + 1)) + 1; // 1 to (20 - a)
  return `${a} + ${b}`;
};

const target = ref(getRandomEquation());
const showSuccess = ref(false);
const showMiss = ref(false);
const resetKey = ref(0);
const showWinner = ref(false);

const targetValue = computed(() => {
  try {
    // Only allow addition equations for safety
    const match = /^\s*(\d+)\s*\+\s*(\d+)\s*$/.exec(target.value);
    if (match) {
      const a = parseInt(match[1] ?? '', 10);
      const b = parseInt(match[2] ?? '', 10);
      return a + b;
    }
    return null;
  } catch {
    return null;
  }
});

const onEvaluate = (result: number) => {
  showSuccess.value = result === targetValue.value;
  showMiss.value = result !== targetValue.value;
  setTimeout(() => {
    showSuccess.value = false;
    showMiss.value = false;
  }, 1000);
  target.value = getRandomEquation();
};

const onHits = (val: number) => {
  if (val >= 3) {
    showWinner.value = true;
    setTimeout(() => {
      showWinner.value = false;
      resetKey.value++;
    }, 2000);
  }
};
</script>
