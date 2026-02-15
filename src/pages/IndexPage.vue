<template>
  <q-page class="column items-center q-pa-xl">
    <div class="target-number text-center">
      <div class="text-h5 text-weight-bold">Target Number</div>
      <div class="text-h2 text-primary">{{ target }}</div>
    </div>
    <Calculator :target="target" @evaluate="onEvaluate" :reset="resetKey" @hits="onHits" />
    <q-dialog v-model="showWinner" persistent>
      <q-card class="flex flex-center q-pa-xl" style="min-width: 300px; min-height: 200px">
        <q-spinner color="primary" size="80px" class="q-mb-md" />
        <div class="text-h4 text-center">Winner!</div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Calculator from 'components/Calculator.vue';

// Generate a random target number between 10 and 100
function getRandomTarget() {
  // Target between 10 and 16 inclusive
  return Math.floor(Math.random() * 7) + 10;
}
const target = ref(getRandomTarget());
const showSuccess = ref(false);
const resetKey = ref(0);
const showWinner = ref(false);

function onEvaluate(result: number) {
  showSuccess.value = result === target.value;
  target.value = getRandomTarget();
  resetKey.value++;
}

function onHits(val: number) {
  if (val >= 3) {
    showWinner.value = true;
    setTimeout(() => {
      showWinner.value = false;
      resetKey.value++;
    }, 2000);
  }
}
</script>
