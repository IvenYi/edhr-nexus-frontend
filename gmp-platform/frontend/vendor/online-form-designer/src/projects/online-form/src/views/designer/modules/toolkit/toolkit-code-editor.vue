<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options ?? {}"
    :mask-closable="false"
    :keyboard="false"
    width="800px"
    :title="$t('sys.editor.editorTitle')"
    :okText="$t('sys.okText')"
    :cancelText="$t('sys.cancelText')"
    :body-style="{
      padding: 0,
      'padding-top': '16px',
    }"
    @ok="handleOk"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="code-container" ref="CodeContainerRef"></div>
    <div class="toolkit-code-editor__footer">
      <a-button type="primary" @click="handleInitScript">
        {{ $t('sys.onlineForm.initializationScript') }}
      </a-button>
      <div>
        <a-button block @click="handleCancel"> {{ $t('sys.cancelText') }} </a-button>
        <a-button type="primary" class="ml-8px" block @click="handleOk">
          {{ $t('sys.okText') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';

  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { randomUUID } from '/@/hooks/web/useUUid';

  const { extraLib } = useModelFields();

  const CodeContainerRef = ref();
  let monacoEditor: any = null;
  let monaco: any = null;
  const visible = ref<boolean>(true);

  const props = defineProps<{
    content: string;
    options?: object;
    callback?: any;
  }>();

  const { getInitScriptFunction, getInitExpNode } = useSpreadSheet();

  onMounted(async () => {
    monaco = await window.monacoLoader.loadMonaco();
    monacoEditor = monaco.editor.create(CodeContainerRef.value, {
      value: props.content ?? '',
      language: 'typescript',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    });
    monacoEditor?.setValue(getInitExpNode(props.content) + monacoEditor.getValue());
    monaco.languages.typescript.typescriptDefaults.addExtraLib(extraLib.value);

    const ctxDts = `
      /**
       * 表单打印
       * @returns {Promise<void>}
       */
      declare function $formPrint(): Promise<void>;
      /**
       * 更新子表行数后触发页面重新计算分页
       * @returns {Promise<void>}
       */
      declare function $updateLayout(): Promise<void>;

      /**
       * 业务服务请求方法
       * @param {Object} params
       * @param {string} params.action        业务服务key
       * @param {string} params.modelKey      模型 Key
       * @param {string} params.modelCategory 模型分类
       * @param {Object} [params.query]       URL 查询参数
       * @param {any}    [params.body]        请求体
       * @returns {Promise<any>}
       */
      declare function $request(params: {
        action: string;
        modelKey: string;
        modelCategory: string;
        query?: Record<string, any>;
        body?: any;
      }): Promise<any>;

      /**
       * 全局展示操作反馈信息
       * @param {string} msg   文本内容
       * @param {'info'|'success'|'warning'|'error'} [type] 类型
       */
      declare function $message(
        msg: string,
        type?: 'info' | 'success' | 'warning' | 'error'
      ): void;

      /**
       * 上下文对象
       * @property {typeof $updateLayout}  $updateLayout
       * @property {typeof $request}       $request
       * @property {typeof $message}       $message
       */
      declare const CTX: {
        $updateLayout: typeof $updateLayout;
        $request: typeof $request;
        $message: typeof $message;
        $formPrint: typeof $formPrint;
      };
    `;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(ctxDts, 'ctx.d.ts');
  });

  const handleInitScript = async () => {
    const uuid = randomUUID();
    const js = getInitScriptFunction(uuid, []);
    const content = monacoEditor.getValue();
    monacoEditor?.setValue(content + '\n' + js);
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const handleOk = async () => {
    // try {
    //   await formRef.value?.validate();
    //   if (props.callback && typeof props.callback) {
    //     props.callback(formState, sheetType.value);
    //   }
    //   visible.value = false;
    // } catch (err) {
    //   console.warn(err);
    // }
    const content = monacoEditor.getValue();
    if (props.callback && typeof props.callback === 'function') {
      props.callback(content);
    }
    visible.value = false;
  };
</script>

<style lang="less">
  .code-container {
    height: 60vh;
  }

  .toolkit-code-editor__footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    border-top: 1px solid #f0f0f0;

    > div {
      display: flex;
    }
  }
</style>
