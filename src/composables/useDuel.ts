import { ref, computed, type Ref } from 'vue';

export interface GameComponent {
  markRoundResult: (round: number, won: boolean, message: string, type: string) => void;
  displayMessage: (message: string, type: string) => Promise<void>;
  resetHits: () => void;
}

export interface DuelPlayer {
  ref: Ref<GameComponent | null>;
  wins: Ref<number>;
}

export interface DuelConfig {
  bestOf: number;
  winnerMessage: string;
  loserMessage: string;
  roundWinMessage: (round: number) => string;
  roundLoseMessage: (round: number) => string;
  winnerTimeout?: number;
}

export function useDuel(
  player1Ref: Ref<GameComponent | null>,
  player2Ref: Ref<GameComponent | null>,
  config: DuelConfig,
) {
  const currentRound = ref(1);
  const player1Wins = ref(0);
  const player2Wins = ref(0);
  const completedMatches = ref(0);

  // Calculate difficulty level: increase every 2 matches, starting at 1
  const currentDifficulty = computed(() => Math.floor(completedMatches.value / 2) + 1);

  // Player data structure for cleaner code
  const players = {
    1: { ref: player1Ref, wins: player1Wins, opponent: { ref: player2Ref, wins: player2Wins } },
    2: { ref: player2Ref, wins: player2Wins, opponent: { ref: player1Ref, wins: player1Wins } },
  };

  // Generic function to handle player wins
  const handlePlayerWin = async (playerId: 1 | 2, wins: number) => {
    const winsNeeded = Math.ceil(config.bestOf / 2);
    const player = players[playerId];
    const opponent = player.opponent;

    player.wins.value = wins;

    if (wins >= winsNeeded) {
      // Player wins the game - only mark the visual results, no round messages
      player.ref.value?.markRoundResult(currentRound.value, true, '', '');
      opponent.ref.value?.markRoundResult(currentRound.value, false, '', '');

      // Show winner dialogue
      const winnerMsg = config.winnerMessage
        .replace('{wins}', wins.toString())
        .replace('{opponentWins}', opponent.wins.value.toString());
      const loserMsg = config.loserMessage
        .replace('{wins}', opponent.wins.value.toString())
        .replace('{opponentWins}', wins.toString());

      // Wait for both dialogs to close, then reset immediately
      const promises = [];
      if (player.ref.value?.displayMessage) {
        promises.push(player.ref.value.displayMessage(winnerMsg, 'positive'));
      }
      if (opponent.ref.value?.displayMessage) {
        promises.push(opponent.ref.value.displayMessage(loserMsg, 'negative'));
      }
      await Promise.all(promises);
      completedMatches.value++; // Increment after each complete match
      resetGame();
    } else {
      // Player wins the current round - show round messages
      player.ref.value?.markRoundResult(
        currentRound.value,
        true,
        config.roundWinMessage(currentRound.value),
        'positive',
      );
      opponent.ref.value?.markRoundResult(
        currentRound.value,
        false,
        config.roundLoseMessage(currentRound.value),
        'negative',
      );
      currentRound.value++;
    }
  };

  const resetGame = () => {
    player1Ref.value?.resetHits();
    player2Ref.value?.resetHits();
    currentRound.value = 1;
    player1Wins.value = 0;
    player2Wins.value = 0;
  };

  const handlePlayer1Win = (wins: number) => handlePlayerWin(1, wins);
  const handlePlayer2Win = (wins: number) => handlePlayerWin(2, wins);

  return {
    // State
    currentRound,
    player1Wins,
    player2Wins,
    completedMatches,
    currentDifficulty,

    // Actions
    handlePlayer1Win,
    handlePlayer2Win,
    resetGame,

    // Computed/helpers
    winsNeeded: Math.ceil(config.bestOf / 2),
  };
}
