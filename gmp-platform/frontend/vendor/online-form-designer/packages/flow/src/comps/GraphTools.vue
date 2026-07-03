<template>
  <div class="diagram-tools">
    <div class="diagram-tools__scale">
      <div class="scale__btn scale__btn--minus" @click="changeDisplayScale(-1)"> </div>
      <span class="w-48px ml-4px mr-4px text-center">{{ displayScaleText }}</span>
      <div class="scale__btn scale__btn--plus" @click="changeDisplayScale(1)"> </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue';
  import { useGctFlow } from '../hooks/useGctFlow';

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { displayScaleText, changeDisplayScale } = useGctFlow(uniqueFlowKey);
</script>

<style lang="less" scoped>
  .diagram-tools {
    height: 26px;
    background: #ffffff;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    padding: 0 8px;

    &__scale {
      display: flex;
      align-items: center;
      color: #212528;
      font-size: 12px;

      .scale__btn {
        height: 16px;
        width: 16px;
        background: #f7f8fa;
        border-radius: 2px;
        position: relative;
        cursor: pointer;

        .content() {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #797a7d;
        }

        &--minus {
          &::before {
            .content();
          }
          &::before {
            width: 8px;
            height: 1px;
          }
        }
        &--plus {
          &::before,
          &::after {
            .content();
          }
          &::before {
            width: 8px;
            height: 1px;
          }
          &::after {
            width: 1px;
            height: 8px;
          }
        }
      }
    }
  }
</style>
