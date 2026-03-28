<template>
  <q-page class="row items-start q-pa-xs">
    <!-- Player 1 -->
    <div
      class="col column items-center bg-grey-1"
      :class="{ 'rotate-180': isNarrowScreen }"
      style="border-radius: 12px; min-width: 320px"
    >
      <CalculatorGame
        ref="player1Ref"
        :hide-operators="true"
        :roundLength="props.roundLength"
        :bestOf="props.bestOf"
        :difficultyLevel="currentDifficulty"
        @wins="evaluate1($event)"
      />
    </div>

    <!-- Player 2 -->
    <div class="col column items-center" style="border-radius: 12px; min-width: 320px">
      <CalculatorGame
        ref="player2Ref"
        :hide-operators="true"
        :roundLength="props.roundLength"
        :bestOf="props.bestOf"
        :difficultyLevel="currentDifficulty"
        @wins="evaluate2($event)"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import CalculatorGame from '../components/CalculatorGame.vue';
import { useDuel, type DuelConfig, type GameComponent } from '../composables/useDuel';

// Props
interface Props {
  roundLength?: number;
  bestOf?: number;
}
const props = withDefaults(defineProps<Props>(), {
  roundLength: 5,
  bestOf: 3,
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

// Create refs for component instances
const player1Ref = ref<GameComponent | null>(null);
const player2Ref = ref<GameComponent | null>(null);

// Duel configuration with Norwegian messages
const duelConfig: DuelConfig = {
  bestOf: props.bestOf,
  winnerMessage: '🏆 SPILLVINNER! 🏆\nSluttresultat: {wins}-{opponentWins}',
  loserMessage: 'Spill over\nSluttresultat: {wins}-{opponentWins}',
  roundWinMessage: (round: number) => `Runde ${round} vunnet!`,
  roundLoseMessage: (round: number) => `Runde ${round} tapt!`,
  winnerTimeout: 5000,
};

// Use the duel composable
const { handlePlayer1Win, handlePlayer2Win, currentDifficulty } = useDuel(
  player1Ref,
  player2Ref,
  duelConfig,
);

// Connect to CalculatorGame events
const evaluate1 = (wins: number) => handlePlayer1Win(wins);
const evaluate2 = (wins: number) => handlePlayer2Win(wins);
</script>
