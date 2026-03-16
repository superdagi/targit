<template>
  <q-page class="row items-start q-pa-xs">
    <!-- Player 1 -->
    <div
      class="col column items-center bg-grey-1"
      :class="{ 'rotate-180': isNarrowScreen }"
      style="border-radius: 12px; min-width: 320px"
    >
      <CalculatorGame2
        ref="player1Ref"
        :hide-operators="true"
        :roundLength="props.roundLength"
        :bestOf="props.bestOf"
        @wins="evaluate1($event)"
      />
    </div>

    <!-- Player 2 -->
    <div class="col column items-center" style="border-radius: 12px; min-width: 320px">
      <CalculatorGame2
        ref="player2Ref"
        :hide-operators="true"
        :roundLength="props.roundLength"
        :bestOf="props.bestOf"
        @wins="evaluate2($event)"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Props
interface Props {
  roundLength?: number;
  bestOf?: number;
}
const props = withDefaults(defineProps<Props>(), {
  roundLength: 5,
  bestOf: 5,
});

// Responsive: flip Player 1 on narrow screens
const isNarrowScreen = ref(false);
function handleResize() {
  isNarrowScreen.value = window.innerWidth <= 1200;
}
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
import CalculatorGame2 from 'components/CalculatorGame2.vue';

const player1Ref = ref();
const player2Ref = ref();

const evaluate1 = async (wins: number) => {
  const winsNeeded = Math.ceil(props.bestOf / 2);
  if (wins >= winsNeeded) {
    player1Ref.value?.displayMessage('Winner!');
    player2Ref.value?.displayMessage('Loser!');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    resetGame(); // Reset both players immediately
  } else {
    // display round messages
    if (wins > 0) {
      player1Ref.value?.displayMessage(`Round ${wins} won!`);
      player2Ref.value?.displayMessage(`Round ${wins} lost!`);
    }
  }
};
const evaluate2 = async (wins: number) => {
  const winsNeeded = Math.ceil(props.bestOf / 2);
  if (wins >= winsNeeded) {
    player2Ref.value?.displayMessage('Winner!');
    player1Ref.value?.displayMessage('Loser!');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    resetGame(); // Reset both players immediately
  } else {
    // display round messages
    if (wins > 0) {
      player2Ref.value?.displayMessage(`Round ${wins} won!`);
      player1Ref.value?.displayMessage(`Round ${wins} lost!`);
    }
  }
};

function resetGame() {
  player1Ref.value?.resetHits();
  player2Ref.value?.resetHits();
}
</script>
