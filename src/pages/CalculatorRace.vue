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
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

const getRandomEquation = () => {
  const a = Math.floor(Math.random() * 11) + 1;
  const b = Math.floor(Math.random() * (20 - a + 1)) + 1;
  return `${a} + ${b}`;
};

const target1 = ref(getRandomEquation());
const target2 = ref(getRandomEquation());

const resetKey1 = ref(0);
const resetKey2 = ref(0);
const showWinner = ref(false);
const winnerText = ref('');
const player1Hits = ref(0);
const player2Hits = ref(0);

const targetValue1 = computed(() => {
  const match = /^\s*(\d+)\s*\+\s*(\d+)\s*$/.exec(target1.value);
  if (match) {
    return parseInt(match[1] ?? '0', 10) + parseInt(match[2] ?? '0', 10);
  }
  return 0;
});
const targetValue2 = computed(() => {
  const match = /^\s*(\d+)\s*\+\s*(\d+)\s*$/.exec(target2.value);
  if (match) {
    return parseInt(match[1] ?? '0', 10) + parseInt(match[2] ?? '0', 10);
  }
  return 0;
});

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
    target1.value = getRandomEquation();
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
    target2.value = getRandomEquation();
    resetKey2.value++;
  }
};

function resetGame() {
  player1Hits.value = 0;
  player2Hits.value = 0;
  target1.value = getRandomEquation();
  target2.value = getRandomEquation();
  resetKey1.value++;
  resetKey2.value++;
}
</script>
