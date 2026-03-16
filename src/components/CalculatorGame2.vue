<template>
  <div style="position: relative">
    <div class="justify-around q-gutter-x">
      <div class="row items-center justify-center">
        <!-- Round progress circles (current round hits) -->
        <div class="row items-center g">
          <div class="text-h4 text-primary">{{ target }}</div>
        </div>
      </div>
      <div class="row">
        <!-- Game progress circles (rounds won) -->
        <div class="q-mr-sm q-pt-md">
          <div class="q-mb-md">
            <div v-for="i in props.roundLength" :key="'round-' + i">
              <q-icon :name="'circle'" size="18px" :color="i <= hits ? 'yellow-7' : 'grey-4'" />
            </div>
          </div>

          <div v-for="i in winsNeeded" :key="'game-' + i">
            <q-icon :name="'circle'" size="18px" :color="i <= wins ? 'green-7' : 'grey-4'" />
          </div>
        </div>
        <Calculator
          :reset="resetKey"
          :hide-operators="props.hideOperators"
          @result="evaluate($event)"
        />
      </div>
    </div>

    <!-- Message overlay positioned over this calculator -->
    <div v-if="showWinner" class="message-overlay">
      <q-card class="flex flex-center q-pa-md" style="min-width: 250px; min-height: 150px">
        <q-spinner color="primary" size="60px" class="q-mb-md" />
        <div class="text-h5 text-center">{{ dialogMessage }}</div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Calculator from 'components/Calculator.vue';

const props = withDefaults(
  defineProps<{ hideOperators?: boolean; roundLength?: number; bestOf?: number }>(),
  {
    roundLength: 5,
    bestOf: 5,
  },
);
const emit = defineEmits<{ wins: [value: number] }>();

// Set defaults
const roundLength = props.roundLength;
const wins = ref(0);

const getRandomEquation = () => {
  const a = Math.floor(Math.random() * 11) + 1;
  const b = Math.floor(Math.random() * (20 - a + 1)) + 1;
  return `${a} + ${b}`;
};

const target = ref(getRandomEquation());
const showWinner = ref(false);
const dialogMessage = ref('');
const resetKey = ref(0);
const hits = ref(0);
const winsNeeded = Math.ceil(props.bestOf / 2);

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
    if (hits.value >= roundLength) {
      // Player wins this round
      wins.value++;
      emit('wins', wins.value);
      hits.value = 0;
      target.value = getRandomEquation();
      resetKey.value++;
    } else {
      target.value = getRandomEquation();
      resetKey.value++;
    }
  }
};

const resetHits = () => {
  hits.value = 0;
  wins.value = 0;
};

const displayMessage = (message: string) => {
  dialogMessage.value = message;
  showWinner.value = true;
  setTimeout(() => {
    showWinner.value = false;
  }, 2000);
};

defineExpose({
  resetHits,
  displayMessage,
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
