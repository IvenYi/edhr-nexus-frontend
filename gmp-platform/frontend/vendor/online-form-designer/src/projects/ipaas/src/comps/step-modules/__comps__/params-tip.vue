<template>
  <div>
    <a-tooltip>
      <template #title>
        {{$t('sys.ipaas.paramsTip')}}
      </template>
      <a @click.prevent><question-circle-outlined /></a>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts"></script>

<style></style>
