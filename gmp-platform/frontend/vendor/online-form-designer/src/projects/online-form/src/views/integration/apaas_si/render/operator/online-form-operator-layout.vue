<template>
  <div
    :class="[
      ns.b(),
      ns.is('show-mask', showMask),
      ns.is('show-footer', showFooter),
      ns.is('show-basic-info', showBasicInfo),
    ]"
  >
    <div :class="[ns.e('mask')]">
      <slot name="mask">没有传mask</slot>
    </div>
    <div :class="[ns.e('body')]">
      <slot name="default"></slot>
    </div>
    <div :class="[ns.e('footer')]" v-if="showFooter">
      <slot name="footer">
        <div :class="[ns.e('footer-left')]">
          <slot name="footer-left"></slot>
        </div>
        <div :class="[ns.e('footer-right')]">
          <slot name="footer-right"></slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="onlineform-operator-layout">
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('onlineform-operator-layout');

  withDefaults(
    defineProps<{
      /** 是否显示mask */
      showMask?: boolean;
      /** 是否显示底部按钮区 */
      showFooter?: boolean;
      showBasicInfo?: boolean;
    }>(),
    {
      showMask: false,
      showFooter: true,
      showBasicInfo: false,
    },
  );
</script>

<style lang="scss" scoped>
  $onlineform-operator-layout: ();

  @include b(onlineform-operator-layout) {
    @include set-component-css-var(onlineform-operator-layout, $onlineform-operator-layout);
    position: relative;

    @include e(mask) {
      display: none;
      background: #f7f8fa;
    }

    @include e(body) {
      flex: 1;
      max-height: 100%;
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      background: #ffffff;
      height: 62px;
      z-index: 70;
      box-shadow: 0px -4px 4px 0px rgba(0, 0, 0, 0.08);
      @include e(footer-left) {
        flex: 0;
        display: flex;
        padding-left: 22px;
        // :deep(> *:first-child) {
        //   margin-left: 22px;
        // }
      }
      @include e(footer-right) {
        flex: 1;
      }
    }

    // 显示日志的时候隐藏掉其他元素
    @include when(show-mask) {
      @include e(mask) {
        display: block;
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 999;
      }
      @include e(body) {
        z-index: -1;
      }
      @include e(footer) {
        z-index: -1;
      }
    }

    @include when(show-footer) {
      @include e(body) {
        max-height: calc(100% - 62px);
      }
    }

    @include when(show-basic-info) {
      @include e(footer) {
        box-shadow: none;
        border-top: 1px solid #e0e3ea;
        @include e(footer-left) {
          padding-left: 0;
        }
      }
    }
  }
</style>
