<template>
  <div :class="[ns.b()]">
    <a-tooltip>
      <template #title>{{ t('sys.editor.undo') }}</template>
      <i
        class="iconfont icon-shangyibu"
        :class="[ns.e('action'), ns.is('disabled', undoDisabled)]"
        @click="undo"
      ></i>
    </a-tooltip>

    <!-- <div class="designer-actions__divider"></div> -->
    <a-tooltip>
      <template #title>{{ t('sys.editor.recover') }}</template>
      <i
        class="iconfont icon-xiayibu"
        :class="[ns.e('action'), ns.is('disabled', redoDisabled)]"
        @click="redo"
      ></i>
    </a-tooltip>
  </div>
</template>

<script lang="ts" setup name="history-toolbar">
  import { useI18n } from 'vue-i18n';
  import { useSpreadSheet } from '../hooks/useSpreadSheet';

  const ns = {
    b: () => 'gct-history-toolbar',
    e: (element: string) => `gct-history-toolbar__${element}`,
    is: (name: string, state?: boolean) => (state ? `is-${name}` : ''),
  };
  const { t } = useI18n();

  const { undoDisabled, redoDisabled, undo, redo } = useSpreadSheet();
</script>

<style lang="scss" scoped>
  $history-toolbar: (
    height: auto,
  );

  @include b(history-toolbar) {
    @include set-component-css-var(history-toolbar, $history-toolbar);
    height: getCssVar(history-toolbar, height);

    @include e(action) {
      // padding: 1px 6px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;

      &:hover {
        color: var(--ant-primary-color);
      }

      @include when(disabled) {
        opacity: 0.25;
        color: #797a7d;
        cursor: not-allowed;
      }
    }
  }
</style>
