<template>
  <div class="editor-toolbar">
    <a-tooltip>
      <template #title>{{ t('sys.editor.saveAsNewVersion') }}</template>
      <div class="flex items-center cursor-pointer mr-28px" @click="handleClickSaveAs">
        <i class="iconfont icon-a-Saveas mr-6px"></i>
        另存为
      </div>
    </a-tooltip>
    <a-tooltip>
      <template #title>{{ t('sys.editor.insertSampleScript') }}</template>
      <a-dropdown :trigger="['click']">
        <div class="flex items-center cursor-pointer mr-28px" @click.prevent>
          <i class="iconfont icon-shilijiaoben mr-6px"></i>
          {{ t('sys.editor.sampleScript') }}
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item
              v-for="item in Object.keys(sampleScriptMap)"
              :key="item"
              @click="onInsetScript(item)"
            >
              {{ t(`sys.editor.sampleScriptMap.${item}`) }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-tooltip>

    <a-tooltip>
      <template #title>{{ t('sys.editor.undo') }}</template>
      <i
        class="iconfont icon-shangyibu"
        :class="{
          'cache--disabled': undoDisabled,
        }"
        @click="onUndo"
      ></i>
    </a-tooltip>

    <div class="gct-divider__vertical"></div>

    <a-tooltip>
      <template #title>{{ t('sys.editor.redo') }}</template>
      <i
        class="iconfont icon-xiayibu"
        :class="{
          'cache--disabled': restoreDisabled,
        }"
        @click="onRestore"
      ></i>
    </a-tooltip>
    <div :style="{ '--space-r': '16px' }" class="gct-divider__vertical"></div>

    <a-tooltip>
      <template #title>{{ t('sys.editor.compare') }}</template>
      <i class="iconfont icon-Compare mr-20px" @click="handleClickDiff"></i>
    </a-tooltip>

    <a-tooltip>
      <template #title>{{ t('sys.editor.history') }}</template>
      <i class="iconfont icon-history mr-20px" @click="toggleHistoryPanel"></i>
    </a-tooltip>

    <a-tooltip>
      <template #title>{{ t('sys.editor.debugger') }}</template>

      <a-dropdown>
        <i class="iconfont icon-debug mr-20px"></i>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="handleOpenDebugger('dev')">
              <a href="javascript:;">开发调试</a>
            </a-menu-item>
            <a-menu-item @click="handleOpenDebugger('test')">
              <a href="javascript:;">测试调试</a>
            </a-menu-item>
            <a-menu-item v-if="sandboxSymbol" @click="handleOpenDebugger('sbx')">
              <a href="javascript:;">沙箱调试</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-tooltip>

    <a-tooltip>
      <template #title>{{ t('sys.editor.execute') }}</template>
      <i class="iconfont icon-a-Carryout" @click="execute"></i>
    </a-tooltip>
    <div v-if="sandboxSymbol" :style="{ '--space-r': '16px' }" class="gct-divider__vertical"></div>
    <div v-if="sandboxSymbol" class="update-sandbox" @click="updateToSandbox">
      <i class="gct-iconfont icon-icon_tongbuzhishaxiang mr4px"></i>
      同步至沙箱
    </div>
    <a-select
      class="w-80px"
      size="small"
      :value="scriptVersion.id"
      @select="(value) => changeVersion(value)"
    >
      <a-select-option v-for="item in scriptVersionList" :key="item.id">{{
        item.version
      }}</a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts" setup>
  import { inject, computed, unref, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useScript } from '/@app-designer/views/script-editor/hooks/useScript';
  import { useEditor } from '/@app-designer/views/script-editor/hooks/useEditor';
  import { useCacheHistoryInner } from '/@/hooks/develop/useCacheHistory';
  import { sampleScriptMap } from '../../logic-develop/constant/scriptInfo';
  import {
    getSandboxConfigList,
    postSandboxConfigSyncScript,
  } from '/@/apis/gct-apaas/SandboxConfigController';
  import { message } from 'ant-design-vue';

  const { t } = useI18n();
  const emit = defineEmits(['on-insert-script']);

  const openDiffModal = inject('openDiffModal') as Function;
  const openSaveAsModal = inject('openSaveAsModal') as Function;

  const {
    scriptVersion,
    scriptVersionList,
    changeVersion,
    execute,
    handleOpenDebugger,
    setScriptContent,
    saveAndActivate,
  } = useScript();

  const sandboxList = ref();

  const { toggleHistoryPanel } = useEditor();

  const getSandboxList = async () => {
    const data = await getSandboxConfigList();
    if (!data.length) {
      return;
    }
    if (data && data.length && data[0].status !== 'INIT') {
      sandboxList.value = data;
    }
  };
  getSandboxList();

  const sandboxSymbol = computed(() => {
    return sandboxList.value?.length;
  });

  const updateToSandbox = async () => {
    const done = message.loading({
      content: '保存并激活中...',
      class: 'gct-save-loading',
      duration: 0.3,
    });
    await saveAndActivate('', false);
    done();
    await postSandboxConfigSyncScript({ id: historyIdRef.value });
    message.success('同步成功');
  };

  const historyIdRef = computed(() => {
    return unref(scriptVersion).id;
  });

  const { undoDisabled, restoreDisabled, onUndo, onRestore } = useCacheHistoryInner({
    historyIdRef: historyIdRef,
    callback: setScriptContent,
  });

  const handleClickDiff = () => {
    openDiffModal(true, {
      mode: 'VERSION',
    });
  };

  const handleClickSaveAs = () => {
    openSaveAsModal(true);
  };

  const onInsetScript = (type) => {
    emit('on-insert-script', type);
  };
</script>

<style lang="less" scoped>
  .editor-toolbar {
    display: flex;
    align-items: center;
    padding: 0 16px;
    line-height: 1em;

    .iconfont {
      cursor: pointer;

      &:nth-of-type(n + 3):hover {
        color: var(--ant-primary-color);
      }
    }

    .ant-select {
      margin-left: auto;
    }

    .cache {
      &--disabled {
        opacity: 0.25;
        cursor: default;
      }
    }
  }

  .update-sandbox {
    cursor: pointer;

    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
