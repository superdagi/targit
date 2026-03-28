<template>
  <div style="position: relative">
    <div class="justify-around q-gutter-x">
      <div class="row items-end justify-between q-pl-xs">
        <div class="text-body1 text-grey-7 q-ml-md q-pl-xl">Runde {{ totalGames }}</div>
        <!-- Round progress circles (current round hits) -->
        <div class=" ">
          <div class="text-h4 text-primary">{{ target }}</div>
        </div>
      </div>
      <div class="row justify-end">
        <!-- Game progress circles (rounds won) -->
        <div class="q-mr-sm q-pt-md">
          <!-- Correct/Incorrect Answer Counters -->
          <div class="q-mb-s text-right">
            <div class="q-mb-xs">
              <q-badge color="positive" class="q-px-md" style="min-width: 60px">
                <q-icon name="check" size="12px" class="q-mr-xs" />
                {{ correctAnswers }}
              </q-badge>
            </div>
            <div>
              <q-badge color="negative" class="q-px-md" style="min-width: 60px">
                <q-icon name="close" size="12px" class="q-mr-xs" />
                {{ incorrectAnswers }}
              </q-badge>
            </div>
          </div>

          <div class="q-mb-md text-right">
            <div v-for="i in props.roundLength" :key="'round-' + i">
              <q-icon :name="'circle'" size="18px" :color="i <= hits ? 'positive' : 'grey-4'" />
            </div>
          </div>

          <div v-if="props.bestOf" class="text-right">
            <div v-for="i in props.bestOf" :key="'game-' + i">
              <q-icon
                :name="'circle'"
                size="18px"
                :color="
                  roundResults[i - 1] === 'win'
                    ? 'green-7'
                    : roundResults[i - 1] === 'loss'
                      ? 'red-7'
                      : 'grey-4'
                "
              />
            </div>
          </div>
        </div>
        <Calculator
          :winsNeeded="0"
          :reset="resetKey"
          :hide-operators="props.hideOperators"
          @result="evaluate($event)"
        />
      </div>
    </div>

    <!-- Message overlay positioned over this calculator -->
    <div v-if="showWinner" class="message-overlay">
      <q-card class="flex flex-center q-pa-md" style="min-width: 250px; min-height: 150px">
        <q-icon
          :name="
            messageIconColor === 'positive'
              ? 'check_circle'
              : messageIconColor === 'negative'
                ? 'cancel'
                : 'info'
          "
          :color="messageIconColor"
          size="60px"
          class="q-mb-md"
        />
        <div class="text-h5 text-center">{{ dialogMessage }}</div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Calculator from 'components/Calculator.vue';

const props = withDefaults(
  defineProps<{
    hideOperators?: boolean;
    roundLength?: number;
    bestOf?: number;
    difficultyLevel?: number;
  }>(),
  {
    roundLength: 5,
    bestOf: 5,
  },
);
const emit = defineEmits<{ wins: [value: number] }>();

// Set defaults
const roundLength = props.roundLength;
const wins = ref(0);
const roundResults = ref<('win' | 'loss' | null)[]>([]);
const totalGames = ref(0);
const correctAnswers = ref(0);
const incorrectAnswers = ref(0);

const getRandomEquation = () => {
  // Use prop difficultyLevel if provided, otherwise increase max target by 10 after every 3 rounds
  const difficultyMultiplier = props.difficultyLevel ?? Math.floor(totalGames.value / 3);
  const maxSum = 20 + difficultyMultiplier * 10;
  const a = Math.floor(Math.random() * 11) + 1;
  const b = Math.floor(Math.random() * (maxSum - a + 1)) + 1;
  return `${a} + ${b}`;
};

const target = ref(getRandomEquation());
const showWinner = ref(false);
const dialogMessage = ref('');
const messageIconColor = ref('primary');
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
    correctAnswers.value++;
    hits.value++;
    if (hits.value >= roundLength) {
      // Player wins this round
      wins.value++;
      totalGames.value++;
      emit('wins', wins.value);
      hits.value = 0;
      target.value = getRandomEquation();
      resetKey.value++;
    } else {
      target.value = getRandomEquation();
      resetKey.value++;
    }
  } else {
    incorrectAnswers.value++;
  }
};

const resetHits = () => {
  hits.value = 0;
  wins.value = 0;
  roundResults.value = Array(props.bestOf).fill(null);
  totalGames.value = 0;
  correctAnswers.value = 0;
  incorrectAnswers.value = 0;
};

const displayMessage = (message: string, iconColor?: string): Promise<void> => {
  return new Promise((resolve) => {
    dialogMessage.value = message;
    messageIconColor.value = iconColor || 'primary';
    showWinner.value = true;
    setTimeout(() => {
      showWinner.value = false;
      resolve();
    }, 2000);
  });
};

const markRoundResult = (
  roundNumber: number,
  isWin: boolean,
  message: string,
  iconColor: string,
) => {
  // Set result for specific round position (1-indexed to 0-indexed)
  const roundIndex = roundNumber - 1;
  if (roundIndex >= 0 && roundIndex < props.bestOf) {
    roundResults.value[roundIndex] = isWin ? 'win' : 'loss';
    // Don't increment wins here - it's already handled by the internal evaluate() function
    // when the player actually completes their round
  }
  // Only display message if there's actually a message to show
  if (message) {
    void displayMessage(message, iconColor);
  }
};

defineExpose({
  resetHits,
  displayMessage,
  markRoundResult,
});
</script>

<style scoped>
.message-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
