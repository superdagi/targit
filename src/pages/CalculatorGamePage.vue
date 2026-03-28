<template>
  <q-page class="column items-center q-pa-md">
    <CalculatorGame :bestOf="0" />
  </q-page>
</template>

<script setup lang="ts">
import CalculatorGame from 'components/CalculatorGame.vue';
</script>
