<template>
  <div class="global_loading_wrapper">
    <div class="loading" v-if="visible">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
  </div>
</template>

<script setup name="global_loading_template" lang="ts">
  import { ref } from 'vue';

  const defProps = defineProps<{
    destroyVm: Function;
    successCallback?: Function;
  }>();

  const visible = ref(false);

  async function open(params) {
    console.log('params', params);
    visible.value = true;
  }

  function cancel() {
    visible.value = false;
    defProps.destroyVm && defProps.destroyVm();
  }

  defineExpose({ open, close: cancel });
</script>

<style lang="less">
  .global_loading_wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.12);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .loading {
    width: 30px;
    height: 30px;
    position: relative;
  }

  .shape {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: absolute;
    opacity: 0.5;
  }

  .shape-1 {
    background-color: #1875e5;
    left: -20px;
    animation: animationShape1 1.5s ease infinite;
  }

  .shape-2 {
    background-color: #c5523f;
    left: 0px;
    animation: animationShape2 1.5s ease infinite 0.5s;
  }

  .shape-3 {
    background-color: #499255;
    left: 20px;
    animation: animationShape3 1.5s ease infinite 0.8s;
  }

  .shape-4 {
    background-color: #f2b736;
    left: 40px;
    animation: animationShape4 1.5s ease infinite 1s;
  }

  @keyframes animationShape1 {
    0% {
      transfrom: scale(1);
      opacity: 0.5;
    }

    50% {
      transform: scale(1.5);
      opacity: 1;
    }

    100% {
      transfrom: scale(0.5);
      opacity: 0.5;
    }
  }

  @keyframes animationShape2 {
    0% {
      transfrom: scale(1);
      opacity: 0.5;
    }

    50% {
      transform: scale(1.5);
      opacity: 1;
    }

    100% {
      transfrom: scale(0.5);
      opacity: 0.5;
    }
  }

  @keyframes animationShape3 {
    0% {
      transfrom: scale(1);
      opacity: 0.5;
    }

    50% {
      transform: scale(1.5);
      opacity: 1;
    }

    100% {
      transfrom: scale(0.5);
      opacity: 0.5;
    }
  }

  @keyframes animationShape4 {
    0% {
      transfrom: scale(1);
      opacity: 0.5;
    }

    50% {
      transform: scale(1.5);
      opacity: 1;
    }

    100% {
      transfrom: scale(0.5);
      opacity: 0.5;
    }
  }
</style>
