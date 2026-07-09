<template>
  <div
    class="editor-console"
    :class="{
      'editor-console--visible': editorConsoleState.visible,
    }"
    ref="editorConsoleRef"
    :style="{ '--size': sizeVariable }"
  >
    <drag-height
      v-if="editorConsoleState.visible"
      :target="editorConsoleRef"
      @change="handleChange"
      @mouseUp="handleMouseUp"
    />
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="t('sys.editor.input')">
        <div class="editor-console__input"></div>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.editor.output')">
        <pre class="editor-console__result editor-debug__result--output">{{
          consoleValueState.output
        }}</pre>
      </a-tab-pane>
      <a-tab-pane key="3" :tab="t('sys.editor.error')">
        <div class="editor-console__result">
          {{ consoleValueState.error }}
        </div>
      </a-tab-pane>
      <a-tab-pane key="4" :tab="t('sys.editor.logs')">
        <div class="editor-console__result">
          <div class="mb-5px" v-for="(log, index) in consoleValueState.logs" :key="index">{{
            log
          }}</div>
        </div>
      </a-tab-pane>
      <template #rightExtra>
        <div class="flex items-center">
          <a-tooltip>
            <template #title>{{ t('sys.compressEscape') }}</template>
            <i
              class="iconfont icon-a-zhuanyiJSON11 mr-16px cursor-pointer"
              @click="handleEscape"
            ></i>
          </a-tooltip>
          <a-tooltip>
            <template #title>{{ t('sys.deCompressEscape') }}</template>
            <i class="iconfont icon-zhuanyi-2 mr-16px cursor-pointer" @click="handelDeEscape"></i>
          </a-tooltip>
          <a-tooltip>
            <template #title>{{ t('sys.helpCenter') }}</template>
            <i class="iconfont icon-assist mr-16px cursor-pointer" @click="openHelpDoc"></i>
          </a-tooltip>
          <a-tooltip v-model:visible="toggleTooltipVisible" placement="topRight">
            <template #title>{{
              editorConsoleState.visible ? t('sys.collapse') : t('sys.unfold')
            }}</template>
            <div class="pr-12px mr-14px">
              <i
                :class="[
                  'iconfont editor-console__toggle cursor-pointer',
                  editorConsoleState.visible ? 'icon-unfold' : 'icon-a-Packup',
                ]"
                @click="toggleConsolePanel"
              ></i>
            </div>
          </a-tooltip>
        </div>
      </template>
    </a-tabs>
  </div>
</template>
<script setup lang="ts" name="editor-console">
  import { ref, nextTick, computed, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useEditorConsole, useEditorConsoleInner } from './useEditorConsole';
  import { openWindow, genUrl } from '/@/utils';
  import DragHeight from './drag-height.vue';

  interface Props {
    defaultInput: string;
  }

  const { t } = useI18n();

  const props = defineProps<Props>();

  const toggleTooltipVisible = ref<boolean>(false);
  const editorConsoleRef = ref<Nullable<HTMLElement>>(null);
  const sizeVariable = ref<string>('33vh');
  const cacheSizeValue = ref<number>(33);
  const { getInputValue, getInstance } = useEditorConsoleInner();

  const heightRange = {
    min: 20,
    max: 66,
  };

  const { editorConsoleState, consoleValueState, toggleVisible, changeTabActiveKey } =
    useEditorConsole({
      defaultInput: props.defaultInput,
      tabActiveKey: '1',
    });

  const activeKey = computed<string>({
    // @ts-ignore
    get() {
      return unref(editorConsoleState).tabActiveKey;
    },
    set(value: string) {
      changeTabActiveKey(value);
    },
  });

  const toggleConsolePanel = async () => {
    toggleTooltipVisible.value = false;
    await nextTick();
    toggleVisible();
  };

  const handleChange = (params) => {
    if (editorConsoleRef.value) {
      const size = Math.abs(params);
      if (params < 0) {
        sizeVariable.value = `${Math.min(
          Math.max(heightRange.min, cacheSizeValue.value + size),
          heightRange.max,
        )}vh`;
      } else {
        sizeVariable.value = `${Math.min(
          Math.max(heightRange.min, cacheSizeValue.value - size),
          heightRange.max,
        )}vh`;
      }
    }
  };

  const handleMouseUp = () => {
    cacheSizeValue.value = parseFloat(sizeVariable.value);
  };

  const openHelpDoc = () => {
    openWindow('https://www.yuque.com/u21386233/qf90og', {
      target: '_blank',
    });
  };

  const handleEscape = async () => {
    const inputValue = await getInputValue();
    let string = JSON.stringify(inputValue);
    string = string.replace(/ /g, '');
    getInstance()?.setValue(string);
  };

  const handelDeEscape = async () => {
    try {
      const inputValue = await getInputValue();
      let val = JSON.parse(inputValue);
      getInstance()?.setValue(val);
    } catch (e) {
      console.warn(e);
    }
  };
</script>
<style scoped lang="less">
  .editor-console {
    --size-header: 46px;
    --size: 33vh;
    background: #fff;
    position: fixed;
    width: 100%;
    top: 100vh;
    left: 0;
    z-index: 999;
    transform: translateY(calc(var(--size-header) * -1));
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
    height: var(--size);
    // transition: all 0.3s;

    &--visible {
      transform: translateY(calc(var(--size) * -1));
    }

    .ant-tabs :deep(.ant-tabs-nav) {
      padding-left: 24px;
    }

    .iconfont {
      line-height: 1em;
    }

    &__toggle {
      transition: all 0.3s;
      color: var(--ant-primary-color);
    }

    &__input,
    &__result {
      height: calc(var(--size) - 62px);
    }

    &__result {
      padding: 0 20px;
      overflow-y: auto;

      &--output {
        white-space: pre-wrap;
      }
    }
  }
</style>
