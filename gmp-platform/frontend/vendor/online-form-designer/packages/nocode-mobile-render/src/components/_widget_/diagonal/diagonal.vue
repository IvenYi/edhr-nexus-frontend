<template>
  <div
    class="absolute top-0px left-0px h-full w-full"
    :class="['diagonal', `diagonal--${direction}`]"
  >
    <span class="column-name column-name--top">{{ value[0] }}</span>
    <span class="column-name column-name--bottom">{{ value[2] }}</span>
    <svg
      class="diagonal__img"
      v-if="size === 2"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="1" />
    </svg>
    <template v-else>
      <svg class="diagonal__img" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <line x1="40%" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="1" />
        <line x1="0" y1="40%" x2="100%" y2="100%" stroke="black" stroke-width="1" />
      </svg>
      <span class="column-name column-name--middle">{{ value[1] }}</span>
    </template>
  </div>
</template>

<script lang="ts" setup name="diagonal">
  import { DiagonalDirection } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      value?: string[];
      size: 2 | 3;
      /** 分栏方向 */
      direction: DiagonalDirection;
    }>(),
    {
      value: () => [],
      size: 2,
      direction: DiagonalDirection.Forward,
    },
  );
</script>

<style lang="less" scoped>
  .diagonal {
    .column-name {
      position: absolute;
      white-space: pre-wrap;
    }

    &.diagonal--forward {
      .column-name {
        &--top {
          top: 0px;
          right: 0px;
        }
        &--bottom {
          left: 0px;
          bottom: 0px;
        }
        &--middle {
          top: 0px;
          left: 0px;
        }
      }
    }

    &.diagonal--backward {
      .diagonal__img {
        transform: scaleX(-1);
      }

      .column-name {
        &--top {
          top: 0px;
          left: 0px;
        }
        &--bottom {
          right: 0px;
          bottom: 0px;
        }
        &--middle {
          top: 0px;
          right: 0px;
        }
      }
    }
  }
</style>
