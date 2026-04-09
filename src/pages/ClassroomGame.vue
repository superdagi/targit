<template>
  <q-page class="column items-center q-pa-md" style="max-width: 700px; margin: 0 auto">
    <!-- ─── Not connected ─── -->
    <template v-if="!connected">
      <q-card class="full-width q-pa-lg text-center">
        <q-icon name="sports_esports" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">Klasserom-spill</div>
        <div class="text-grey-6 q-mb-lg">Koble til server og oprett eller bli med i et rom</div>
        <q-btn color="primary" label="Koble til" icon="wifi" unelevated @click="connect" />
      </q-card>
    </template>

    <!-- ─── Lobby: pick role ─── -->
    <template v-else-if="!roomState">
      <q-card class="full-width q-pa-lg">
        <div class="text-h6 q-mb-md">Hei! Hvem er du?</div>

        <q-input
          v-model="playerName"
          label="Navn"
          outlined
          class="q-mb-md"
          @keyup.enter="onNameConfirm"
        />

        <div class="row q-gutter-md">
          <q-btn
            color="primary"
            label="Opprett rom (Lærer)"
            icon="school"
            unelevated
            class="col"
            :disable="!playerName.trim()"
            @click="showTeacherOptions = true"
          />
          <q-btn
            color="secondary"
            label="Bli med (Elev)"
            icon="group"
            unelevated
            class="col"
            :disable="!playerName.trim()"
            @click="showJoin = true"
          />
        </div>

        <!-- Join dialog -->
        <q-dialog v-model="showJoin">
          <q-card style="min-width: 300px" class="q-pa-md">
            <div class="text-h6 q-mb-md">Skriv inn romkode</div>
            <q-input
              v-model="joinCode"
              label="Romkode (4 bokstaver)"
              outlined
              maxlength="4"
              class="q-mb-md"
              @keyup.enter="onJoinRoom"
            />
            <div v-if="joinError" class="text-negative q-mb-sm">{{ joinError }}</div>
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Avbryt" v-close-popup />
              <q-btn
                color="primary"
                label="Bli med"
                :disable="joinCode.length < 4"
                @click="onJoinRoom"
              />
            </div>
          </q-card>
        </q-dialog>

        <!-- Teacher options dialog -->
        <q-dialog v-model="showTeacherOptions">
          <q-card style="min-width: 400px" class="q-pa-md">
            <div class="text-h6 q-mb-md">Velg din rolle</div>
            <div class="text-body2 text-grey-6 q-mb-lg">
              Vil du delta i spillet eller observere?
            </div>

            <div class="q-mb-lg">
              <q-btn
                color="primary"
                label="Delta"
                icon="sports_esports"
                unelevated
                class="full-width q-mb-md"
                @click="onCreateRoom(false)"
              >
              </q-btn>

              <q-btn
                color="secondary"
                label="Observere"
                icon="visibility"
                unelevated
                class="full-width"
                @click="onCreateRoom(true)"
              >
              </q-btn>
            </div>

            <div class="row justify-end">
              <q-btn flat label="Avbryt" v-close-popup />
            </div>
          </q-card>
        </q-dialog>
      </q-card>
    </template>

    <!-- ─── Lobby: waiting for players ─── -->
    <template v-else-if="roomState.phase === 'lobby'">
      <q-card class="full-width q-pa-lg text-center q-mb-md">
        <div class="text-h5 q-mb-xs">
          Rom: <span class="text-primary text-weight-bold">{{ roomState.roomCode }}</span>
        </div>
        <div class="text-grey-6 q-mb-md">Del koden med deltakerne!</div>

        <q-list bordered separator class="rounded-borders q-mb-md text-left">
          <q-item v-for="p in roomState.players" :key="p.id">
            <q-item-section avatar>
              <q-icon
                :name="p.isHost ? 'school' : 'person'"
                :color="p.isHost ? 'primary' : 'grey'"
              />
            </q-item-section>
            <q-item-section>{{ p.name }}</q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-badge
                  v-if="p.isHost && p.isObserver"
                  color="orange"
                  label="Lærer (observerer)"
                />
                <q-badge v-else-if="p.isHost" color="primary" label="Lærer" />
                <q-badge v-if="p.isObserver && !p.isHost" color="grey" label="Observerer" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="isHost">
          <q-input
            v-model.number="totalRoundsInput"
            type="number"
            label="Antall spørsmål"
            outlined
            class="q-pb-md"
            style="max-width: 200px; margin: 0 auto"
            :min="3"
            :max="50"
          />
          <q-btn
            color="positive"
            label="Start spillet!"
            icon="play_arrow"
            unelevated
            size="lg"
            :disable="participatingPlayers.length < 1"
            @click="startGame"
          />
        </div>
        <div v-else class="text-grey-6">Venter på at læreren starter...</div>
      </q-card>
    </template>

    <!-- ─── Playing ─── -->
    <template v-else-if="roomState.phase === 'playing'">
      <!-- Observer Dashboard -->
      <div v-if="isObserving" class="full-width">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6 text-primary">
            <q-icon name="visibility" class="q-mr-sm" />
            Lærer Dashboard
          </div>
          <div class="text-body1 text-grey-7">
            Spørsmål {{ roomState.round }} / {{ roomState.totalRounds }}
          </div>
        </div>

        <!-- Current Question -->
        <q-card class="full-width q-pa-lg text-center q-mb-md">
          <div class="text-overline text-grey-6 q-mb-sm">Nåværende spørsmål</div>
          <div class="text-h3 text-primary q-mb-xs">{{ roomState.question?.expression }}</div>
          <div class="text-h5 text-grey-5">= {{ roomState.question?.answer }}</div>
        </q-card>

        <!-- Live Scoreboard -->
        <q-card class="full-width q-pa-md q-mb-md">
          <div class="text-h6 q-mb-md">
            <q-icon name="leaderboard" class="q-mr-sm" />
            Live poengtavle
          </div>
          <q-list separator>
            <q-item
              v-for="(player, index) in sortedParticipatingPlayers"
              :key="player.id"
              class="q-py-md"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="
                    index === 0
                      ? 'amber'
                      : index === 1
                        ? 'grey-5'
                        : index === 2
                          ? 'orange-4'
                          : 'blue'
                  "
                  text-color="white"
                  size="md"
                >
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-subtitle1">{{ player.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-sm">
                  <div class="text-h6 text-weight-bold">{{ player.score }}</div>
                  <q-badge
                    v-if="!player.answeredCurrent"
                    color="orange"
                    icon="schedule"
                    label="Venter"
                  />
                  <q-badge
                    v-else-if="player.lastAnswerCorrect === true"
                    color="positive"
                    icon="check_circle"
                    label="Riktig"
                  />
                  <q-badge
                    v-else-if="player.lastAnswerCorrect === false"
                    color="negative"
                    icon="cancel"
                    label="Feil"
                  />
                  <q-badge v-else color="grey" icon="help" label="Ukjent" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Progress Overview -->
        <q-card class="full-width q-pa-md">
          <div class="text-h6 q-mb-md">
            <q-icon name="analytics" class="q-mr-sm" />
            Fremgang
          </div>
          <div class="row q-gutter-md text-center">
            <div class="col">
              <div class="text-h4 text-positive">{{ correctCount }}</div>
              <div class="text-caption text-grey-6">Riktige</div>
            </div>
            <div class="col">
              <div class="text-h4 text-negative">{{ incorrectCount }}</div>
              <div class="text-caption text-grey-6">Feil</div>
            </div>
            <div class="col">
              <div class="text-h4 text-orange">{{ waitingCount }}</div>
              <div class="text-caption text-grey-6">Venter</div>
            </div>
            <div class="col">
              <div class="text-h4 text-primary">{{ participatingPlayers.length }}</div>
              <div class="text-caption text-grey-6">Totalt</div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Regular Player View -->
      <div v-else class="full-width">
        <!-- Header: round + score -->
        <div class="row items-center justify-between q-mb-md">
          <div class="text-body1 text-grey-7">
            Spørsmål {{ roomState.round }} / {{ roomState.totalRounds }}
          </div>
          <div v-if="!isObserving" class="text-body1 text-grey-7">
            Poeng: <strong>{{ myPlayer?.score ?? 0 }}</strong>
          </div>
          <div v-else class="text-body1 text-orange-6">
            <q-icon name="visibility" class="q-mr-xs" />
            Observerer
          </div>
        </div>

        <!-- Question card -->
        <q-card class="full-width q-pa-xl text-center q-mb-md">
          <div class="text-h2 text-primary q-mb-xs">{{ roomState.question?.expression }}</div>
          <div class="text-grey-5">= ?</div>
        </q-card>

        <!-- Answer result feedback -->
        <transition name="fade">
          <q-card
            v-if="lastAnswerResult && !isObserving"
            class="full-width q-pa-md text-center q-mb-md"
            :class="lastAnswerResult.correct ? 'bg-positive text-white' : 'bg-negative text-white'"
          >
            <q-icon
              :name="lastAnswerResult.correct ? 'check_circle' : 'cancel'"
              size="32px"
              class="q-mr-sm"
            />
            <span v-if="lastAnswerResult.correct">Riktig!</span>
            <span v-else
              >Feil! Svaret var <strong>{{ lastAnswerResult.correctAnswer }}</strong></span
            >
          </q-card>
        </transition>

        <!-- Calculator -->
        <div v-if="!isObserving" class="row justify-center q-mb-md">
          <div
            class="calculator q-pa-md q-mt-sm column items-center bg-grey-2 shadow-2"
            style="border-radius: 14px; min-width: 260px; max-width: 340px"
          >
            <q-input
              v-model="calcInput"
              filled
              readonly
              class="full-width text-right text-h5 q-mb-sm"
              input-class="text-right"
            />
            <div class="column full-width">
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="n in [7, 8, 9]"
                  :key="n"
                  :label="n"
                  @click="calcAppend(n)"
                  color="primary"
                  flat
                  class="col"
                  size="lg"
                />
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="n in [4, 5, 6]"
                  :key="n"
                  :label="n"
                  @click="calcAppend(n)"
                  color="primary"
                  flat
                  class="col"
                  size="lg"
                />
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="n in [1, 2, 3]"
                  :key="n"
                  :label="n"
                  @click="calcAppend(n)"
                  color="primary"
                  flat
                  class="col"
                  size="lg"
                />
              </div>
              <div class="row q-gutter-xs">
                <q-btn
                  label="C"
                  @click="calcInput = ''"
                  color="negative"
                  flat
                  class="col"
                  size="lg"
                />
                <q-btn
                  label="0"
                  @click="calcAppend(0)"
                  color="primary"
                  flat
                  class="col"
                  size="lg"
                />
                <q-btn
                  label="="
                  @click="calcSubmit"
                  color="white"
                  flat
                  class="col bg-green"
                  size="lg"
                  :disable="alreadyAnswered"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Answered status for other players -->
        <div class="text-caption text-grey-6 text-center q-mb-xs">Har svart:</div>
        <div class="row justify-center q-gutter-sm q-mb-md">
          <q-chip
            v-for="p in participatingPlayers"
            :key="p.id"
            :color="p.answeredCurrent ? 'positive' : 'grey-4'"
            :text-color="p.answeredCurrent ? 'white' : 'grey-8'"
            :icon="p.answeredCurrent ? 'check' : 'hourglass_empty'"
            size="sm"
          >
            {{ p.name }}
          </q-chip>
        </div>
      </div>
    </template>

    <!-- ─── Finished ─── -->
    <template v-else-if="roomState.phase === 'finished'">
      <q-card class="full-width q-pa-lg text-center">
        <q-icon name="emoji_events" size="72px" color="amber" class="q-mb-md" />
        <div class="text-h4 q-mb-lg">Spillet er over!</div>

        <q-list bordered separator class="rounded-borders q-mb-xl text-left">
          <q-item v-for="(p, i) in sortedPlayers" :key="p.id">
            <q-item-section avatar>
              <q-avatar
                :color="i === 0 ? 'amber' : i === 1 ? 'grey-5' : i === 2 ? 'orange-4' : 'grey-3'"
                text-color="white"
              >
                {{ i + 1 }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label
                >{{ p.name
                }}<q-badge v-if="p.id === myId" label="deg" color="primary" class="q-ml-sm"
              /></q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ p.score }} poeng</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn
          v-if="isHost"
          color="primary"
          label="Spill igjen"
          icon="replay"
          unelevated
          size="lg"
          @click="restartGame"
        />
        <div v-else class="text-grey-6">Venter på at læreren starter ny runde...</div>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSocketGame } from '../composables/useSocketGame';

const {
  connected,
  roomState,
  myId,
  lastAnswerResult,
  isHost,
  myPlayer,
  sortedPlayers,
  connect,
  createRoom,
  joinRoom,
  startGame,
  submitAnswer,
  restartGame,
} = useSocketGame();

const playerName = ref('');
const showJoin = ref(false);
const showTeacherOptions = ref(false);
const joinCode = ref('');
const joinError = ref('');
const totalRoundsInput = ref(10);

// Calculator state
const calcInput = ref('');

const alreadyAnswered = computed(() => myPlayer.value?.answeredCurrent ?? false);
const isObserving = computed(() => myPlayer.value?.isObserver ?? false);
const participatingPlayers = computed(
  () => roomState.value?.players.filter((p) => !p.isObserver) ?? [],
);
const sortedParticipatingPlayers = computed(() =>
  [...participatingPlayers.value].sort((a, b) => b.score - a.score),
);
const waitingCount = computed(
  () => participatingPlayers.value.filter((p) => !p.answeredCurrent).length,
);
const correctCount = computed(
  () => participatingPlayers.value.filter((p) => p.lastAnswerCorrect === true).length,
);
const incorrectCount = computed(
  () => participatingPlayers.value.filter((p) => p.lastAnswerCorrect === false).length,
);

// Clear calculator and previous answer result when question changes
watch(
  () => roomState.value?.round,
  () => {
    calcInput.value = '';
    lastAnswerResult.value = null;
  },
);

// Clear calculator after submitting
watch(
  () => lastAnswerResult.value,
  () => {
    calcInput.value = '';
  },
);

function calcAppend(val: string | number) {
  if (alreadyAnswered.value) return;
  calcInput.value += val;
}

function calcSubmit() {
  if (alreadyAnswered.value || !calcInput.value) return;
  const result = Number(calcInput.value);
  if (!isNaN(result)) {
    submitAnswer(result);
  }
  calcInput.value = '';
}

function onNameConfirm() {
  if (playerName.value.trim()) showJoin.value = true;
}

async function onCreateRoom(isObserver: boolean) {
  if (!playerName.value.trim()) return;
  showTeacherOptions.value = false;
  await createRoom(playerName.value.trim(), totalRoundsInput.value, isObserver);
}

async function onJoinRoom() {
  if (!joinCode.value || joinCode.value.length < 4) return;
  joinError.value = '';
  try {
    await joinRoom(joinCode.value, playerName.value.trim());
    showJoin.value = false;
  } catch (e: unknown) {
    joinError.value = e instanceof Error ? e.message : 'Kunne ikke bli med';
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
