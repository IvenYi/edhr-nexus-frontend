<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('自定义参数')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="FormRef" :model="formState">
      <a-form-item label="" name="extParams" :rules="[{ validator: validateJSON }]">
        <div class="literal-editor" ref="LiteralEditorRef"> </div>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, onUnmounted, nextTick, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLo } from '../../hooks/useLo';

  defineEmits(['register']);

  interface Options {
    data?: string; // 数据
    callback: (data) => void; // 回调
  }

  let monaco: any = null;
  let literalEditor: any = null;
  let LiteralEditorRef = ref();
  let FormRef = ref();
  let formState: Partial<Options> = reactive({});

  const { t } = useI18n();
  const { loDataObject } = useLo();
  // const { gVar } = useVariable();

  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((payload: Options) => {
    if (payload === undefined) return;
    Object.assign(formState, payload);
    initEditor();
  });

  onUnmounted(() => {
    literalEditor && literalEditor.dispose();
  });

  const initEditor = async () => {
    await nextTick();

    // 加载 Monaco Editor
    monaco = await window.monacoLoader.loadMonaco();

    const { variables } = loDataObject.value;
    const defs: string[] = [];
    // 局部变量
    variables.forEach((v) => {
      // todo 变量类型转换
      defs.push(`declare var ${v.name}: any`);
    });
    // 全局变量
    // gVar.value.forEach((v) => {
    //   // todo 变量类型转换
    //   defs.push(`declare var ${v.key}: any`);
    // });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(defs.join('\n'));

    literalEditor = monaco.editor.create(LiteralEditorRef.value, {
      value: formState.data ?? 'export default {\n  \n}',
      language: 'javascript',
      automaticLayout: true,
      // lineNumbers: 'off',
      wordWrap: 'on',
      minimap: {
        enabled: false,
      },
    });
  };

  const handleClose = () => {
    Object.assign(formState, {
      data: null,
      callback: null,
    });
    literalEditor && literalEditor.dispose();
  };

  const validateJSON = async () => {
    const errs = monaco.editor.getModelMarkers({
      owner: 'javascript',
    });
    if (errs.length) {
      return Promise.reject(t('请检查自定义参数格式'));
    } else {
      return Promise.resolve();
    }
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await FormRef.value.validate();
      changeOkLoading(false);
      if (formState.callback && typeof formState.callback === 'function') {
        formState.callback(literalEditor.getValue());
      }
      closeModal();
    } catch (err) {
      console.log(err);
      changeOkLoading(false);
    }
  };
</script>

<style scoped lang="less">
  .literal-editor {
    height: 40vh;
    border: 1px solid #d9d9d9;
    border-radius: 5px;
  }
</style>
