<template>
  <div class="nocode-loading">
    <div class="nocode-shape shape-1"></div>
    <div class="nocode-shape shape-2"></div>
    <div class="nocode-shape shape-3"></div>
    <div class="nocode-shape shape-4"></div>
  </div>
</template>

<script setup lang="ts" name="nocode-base-document-loading"></script>
<style lang="less" scoped>
  .nocode-loading {
    position: relative;
  }

  .nocode-shape {
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
