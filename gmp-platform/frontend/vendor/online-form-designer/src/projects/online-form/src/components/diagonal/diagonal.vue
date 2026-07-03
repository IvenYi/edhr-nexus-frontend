<template>
  <div class="absolute top-0px left-0px h-full w-full" :class="[ns.b(), ns.m(direction)]">
    <span class="column-name column-name--top">{{ value[0] }}</span>
    <span class="column-name column-name--bottom">{{ value[2] }}</span>
    <svg
      :class="ns.e('img')"
      v-if="size === 2"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="1" />
    </svg>
    <template v-else>
      <svg :class="ns.e('img')" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <line x1="40%" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="1" />
        <line x1="0" y1="40%" x2="100%" y2="100%" stroke="black" stroke-width="1" />
      </svg>
      <span class="column-name column-name--middle">{{ value[1] }}</span>
    </template>
  </div>
</template>

<script lang="ts" setup name="diagonal">
  import { useNamespace } from '@gct/runtime';
  import { DiagonalDirection } from '@gct/nocode-base';

  const ns = useNamespace('diagonal');

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

<style lang="scss" scoped>
  $diagonal: ();

  @include b(diagonal) {
    @include set-component-css-var(diagonal, $diagonal);

    .column-name {
      position: absolute;
      white-space: pre-wrap;
    }

    @include m(forward) {
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

    @include m(backward) {
      @include e(img) {
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
