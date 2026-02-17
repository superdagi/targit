<template>
  <q-page class="row items-start q-pa-xs">
    <!-- Player 1 -->
    <div
      class="col column items-center bg-grey-1"
      :class="{ 'rotate-180': isNarrowScreen }"
      style="border-radius: 12px; min-width: 320px"
    >
      <CalculatorGame2 :reset="resetKey1" @hits="evaluate1($event)" />
    </div>

    <!-- Player 2 -->
    <div class="col column items-center" style="border-radius: 12px; min-width: 320px">
      <CalculatorGame2 :reset="resetKey2" @hits="evaluate2($event)" />
    </div>

    <q-dialog v-model="showWinner" persistent>
      <q-card class="flex flex-center q-pa-xl" style="min-width: 300px; min-height: 200px">
        <q-spinner color="primary" size="80px" class="q-mb-md" />
        <div class="text-h4 text-center">{{ winnerText }}</div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// Responsive: flip Player 1 on narrow screens
const isNarrowScreen = ref(false);
function handleResize() {
  isNarrowScreen.value = window.innerWidth <= 700;
}
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
import CalculatorGame2 from 'components/CalculatorGame2.vue';

const resetKey1 = ref(0);
const resetKey2 = ref(0);
const showWinner = ref(false);
const winnerText = ref('');
const player1Hits = ref(0);
const player2Hits = ref(0);

const evaluate1 = (value: number) => {
  player1Hits.value = value;
  if (player1Hits.value >= 5) {
    winnerText.value = 'Player 1 Wins!';
    showWinner.value = true;
    setTimeout(() => {
      showWinner.value = false;
      resetGame();
    }, 2000);
  } else {
    resetKey1.value++;
  }
};
const evaluate2 = (value: number) => {
  player2Hits.value = value;
  if (player2Hits.value >= 5) {
    winnerText.value = 'Player 2 Wins!';
    showWinner.value = true;
    setTimeout(() => {
      showWinner.value = false;
      resetGame();
    }, 2000);
  } else {
    resetKey2.value++;
  }
};

function resetGame() {
  player1Hits.value = 0;
  player2Hits.value = 0;
  resetKey1.value++;
  resetKey2.value++;
}
</script>
