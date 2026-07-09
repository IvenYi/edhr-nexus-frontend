<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options ?? {}"
    :mask-closable="false"
    :keyboard="false"
    width="1040px"
    :title="t('sys.ipaas.scriptEditor')"
    :body-style="{
      padding: 0,
      'padding-top': '16px',
    }"
    :ok-text="t('sys.okText')"
    :cancel-text="t('sys.cancelText')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="h-60vh flex">
      <div class="w-300px ks-column pl-20px h100%">
        <div class="flex justify-between items-center">
          <span class="text-14px font-500">{{ $t('sys.ipaas.params.list') }}</span>
          <a-button v-if="!readonly" type="link" size="small" @click="handleArgumentAdd">{{
            t('sys.add')
          }}</a-button>
        </div>

        <div class="mt-8px ks-col overflow-auto">
          <a-empty v-if="args.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          <template v-else>
            <div class="argument-item" v-for="(item, index) in args" :key="index">
              <a-input
                class="important-w-100px flex-none"
                v-model:value="item.key"
                size="small"
                :placeholder="$t('sys.ipaas.params.key')"
                :disabled="readonly"
              />
              <span class="ml-2px mr-4px font-500">:</span>
              <a-input
                class="w-10px flex-1"
                v-model:value="item.value"
                size="small"
                :placeholder="$t('sys.ipaas.params.value')"
                :disabled="readonly"
              />
              <div
                v-if="!readonly"
                class="ml-4px h-24px w-24px cursor-pointer flex items-center justify-center"
                @click="() => handleArgumentDelete(index)"
              >
                <i class="iconfont icon-shanchu1 lh-[1em] error-color"></i>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="w-100px flex-1" ref="CodeContainerRef"></div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import CodeHelper from '/@ipaas/utils/CodeHelper';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface IArg {
    key: string;
    value: string;
  }

  const props = defineProps<{
    tsCode: string;
    arguments: IArg[];
    readonly: boolean;
    options?: object;
    onOk?: any;
  }>();

  const { t } = useI18n();
  const CodeContainerRef = ref();
  let monaco: any = null;
  let monacoEditor: any = null;
  const visible = ref<boolean>(true);
  const args = ref<IArg[]>(props.arguments);

  onMounted(async () => {
    monaco = await window.monacoLoader.loadMonaco();
    monacoEditor = monaco.editor.create(CodeContainerRef.value, {
      value: props.tsCode || CodeHelper.DefaultContent,
      language: 'typescript',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      readOnly: props.readonly,
    });

    updateEditorExtraLib();
    monacoEditor.onDidFocusEditorText(() => {
      updateEditorExtraLib();
    });
  });

  onBeforeUnmount(() => {
    if (monacoEditor) {
      monacoEditor.dispose();
    }
  });

  const updateEditorExtraLib = () => {
    if (!monaco) {
      console.warn('[ScriptEditorModal] Monaco editor is not available for updateEditorExtraLib');
      return;
    }
    monaco.languages.typescript.typescriptDefaults.setExtraLibs([
      {
        content: CodeHelper.createTypeDef(args.value),
      },
    ]);
  };

  const handleArgumentAdd = () => {
    args.value.push({
      key: '',
      value: '',
    });
  };

  const handleArgumentDelete = (index: number) => {
    args.value.splice(index, 1);
    updateEditorExtraLib();
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const handleOk = async () => {
    const tsCode = monacoEditor.getValue();
    if (props.onOk && typeof props.onOk === 'function') {
      const jsCode = CodeHelper.ts2js(tsCode);
      props.onOk(jsCode, tsCode, args.value);
    }
    visible.value = false;
  };
</script>

<style lang="less">
  .error-color {
    color: var(--ant-error-color);
  }

  .argument-item {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;

    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }
</style>
