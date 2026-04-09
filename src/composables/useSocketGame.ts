import { ref, computed } from 'vue';
import { io, type Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export interface RoomPlayer {
  id: string;
  name: string;
  score: number;
  answeredCurrent: boolean;
  isHost: boolean;
  isObserver?: boolean;
  lastAnswerCorrect?: boolean | null;
}

export interface RoomState {
  roomCode: string;
  phase: 'lobby' | 'playing' | 'finished';
  question: { expression: string; answer: number } | null;
  players: RoomPlayer[];
  hostId: string;
  round: number;
  totalRounds: number;
}

export interface AnswerResult {
  correct: boolean;
  answer: number;
  correctAnswer: number;
}

export function useSocketGame() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const roomState = ref<RoomState | null>(null);
  const myId = ref<string>('');
  const lastAnswerResult = ref<AnswerResult | null>(null);
  const error = ref<string>('');

  const isHost = computed(() => roomState.value?.hostId === myId.value);
  const myPlayer = computed(() => roomState.value?.players.find((p) => p.id === myId.value));
  const sortedPlayers = computed(() =>
    roomState.value ? [...roomState.value.players].sort((a, b) => b.score - a.score) : [],
  );

  function connect() {
    if (socket.value?.connected) return;

    const s = io(SERVER_URL, { autoConnect: true });
    socket.value = s;

    s.on('connect', () => {
      connected.value = true;
      myId.value = s.id ?? '';
      error.value = '';
    });

    s.on('disconnect', () => {
      connected.value = false;
    });

    s.on('room:state', (state: RoomState) => {
      roomState.value = state;
      // Update myId from connected socket after state arrives (id is now set)
      myId.value = s.id ?? myId.value;
    });

    s.on('game:answer:result', (result: AnswerResult) => {
      lastAnswerResult.value = result;
    });
  }

  function disconnect() {
    socket.value?.disconnect();
    socket.value = null;
    connected.value = false;
    roomState.value = null;
    myId.value = '';
    lastAnswerResult.value = null;
    error.value = '';
  }

  function createRoom(name: string, totalRounds = 10, isObserver = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!socket.value?.connected) {
        reject(new Error('Not connected'));
        return;
      }
      socket.value.emit(
        'room:create',
        { name, totalRounds, isObserver },
        (res: { roomCode?: string; error?: string }) => {
          if (res?.error) reject(new Error(res.error));
          else resolve(res?.roomCode ?? '');
        },
      );
    });
  }

  function joinRoom(roomCode: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!socket.value?.connected) {
        reject(new Error('Not connected'));
        return;
      }
      socket.value.emit(
        'room:join',
        { roomCode: roomCode.toUpperCase(), name },
        (res: { ok?: boolean; error?: string }) => {
          if (res?.error) reject(new Error(res.error));
          else resolve();
        },
      );
    });
  }

  function startGame() {
    socket.value?.emit('game:start');
  }

  function submitAnswer(answer: number) {
    lastAnswerResult.value = null;
    socket.value?.emit('game:answer', { answer });
  }

  function restartGame() {
    socket.value?.emit('game:restart');
  }

  return {
    connected,
    roomState,
    myId,
    lastAnswerResult,
    error,
    isHost,
    myPlayer,
    sortedPlayers,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    restartGame,
  };
}
