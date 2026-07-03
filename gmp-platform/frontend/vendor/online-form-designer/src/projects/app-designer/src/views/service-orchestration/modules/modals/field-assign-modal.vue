<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('添加模型字段')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="FormRef" :model="formState" autocomplete="off">
      <a-row>
        <a-col :span="8">
          <a-form-item :label="t('模型字段')" name="key" :rules="[{ required: true }]">
            <a-select :disabled="!!options.data" v-model:value="formState.key">
              <a-select-option v-for="item in options.fields" :key="item.key" :value="item.key">
                {{ item.key }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('字段名称')">
            <a-input disabled :value="rawField?.name" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('字段类型')">
            <a-input disabled :value="rawField?.type" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="" name="literal" :rules="[{ required: true }]">
            <div class="literal-editor" ref="LiteralEditorRef"> </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { reactive, ref, watch, computed, onUnmounted, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NodeTypeEnum } from '../../types';
  import { useSOInstance } from '../../hooks/useSOInstance';

  defineEmits(['register']);

  interface FieldInterface {
    key: string;
    literal: string;
    // rawField?: any;
  }

  interface FromStateInterface {
    key: string;
    literal: string;
  }

  interface Options {
    data?: FieldInterface; // 数据
    fields: any[];
    callback: (data) => void; // 回调
  }

  let monaco: any = null;
  let options = ref<Partial<Options>>({});
  const formState: FromStateInterface = reactive({ key: '', literal: '' });
  let literalEditor: any = null;
  let LiteralEditorRef = ref();
  let FormRef = ref();

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((payload: Options) => {
    if (payload === undefined) return;
    console.log(payload);
    options.value = payload;
    if (payload.data) {
      Object.assign(formState, {
        ...payload.data,
      });
    }
    initEditor();
  });

  const { soDataObject } = useSOInstance();

  console.log(soDataObject);

  const rawField = computed(() => {
    const key = formState.key;
    return options.value.fields?.find((item) => item.key === key);
  });

  onUnmounted(() => {
    literalEditor && literalEditor.dispose();
  });

  /**
   * 生成start节点参数类型
   * @param struct
   * @param ptype
   */
  const genArgumentType = (struct: any[], ptype = 'object') => {
    const lr = ptype === 'object' ? ['{', '}'] : ['[', ']'];
    const result: string[] = [];
    result.push(lr[0]);
    struct.forEach((ss, index) => {
      console.log('index:', index);
      if (['object', 'array'].includes(ss.type)) {
        if (ptype === 'array') {
          result.push(...genArgumentType(ss.children, ss.type));
        } else {
          result.push(ss.key, ':', ...genArgumentType(ss.children, ss.type), ';');
        }
      } else {
        if (ptype === 'array') {
          result.push(`${ss.type}`);
          index < struct.length - 1 && result.push(`,`);
        } else {
          result.push(`${ss.key}: ${ss.type};`);
        }
      }
    });
    result.push(lr[1]);
    return result;
  };

  const initEditor = async () => {
    await nextTick();
    monaco = await window.monacoLoader.loadMonaco();
    const { controls, variables } = soDataObject.value;

    const defs: string[] = [];
    variables.forEach((v) => {
      // todo 变量类型转换
      defs.push(`declare var ${v.name}: any`);
    });

    const start = Object.values(controls).find((c) => c.shape === NodeTypeEnum.START);
    if (start?.parameter) {
      const { parameterStruct } = start;
      console.log(parameterStruct);
      const argumentInterface = genArgumentType(parameterStruct[0].children).join('');
      console.log(argumentInterface);
      defs.push(`declare const argument: ${argumentInterface}`);
    }

    console.log(defs);
    monaco.languages.typescript.javascriptDefaults.addExtraLib(defs.join('\n'));

    literalEditor = monaco.editor.create(LiteralEditorRef.value, {
      value: options.value.data?.literal ?? '',
      language: 'javascript',
      automaticLayout: true,
      lineNumbers: 'off',
      wordWrap: 'on',
      minimap: {
        enabled: false,
      },
    });

    literalEditor.onDidChangeModelContent(() => {
      formState.literal = literalEditor.getValue();
    });
  };

  const handleClose = () => {
    options.value = {};
    formState.key = '';
    formState.literal = '';
    literalEditor && literalEditor.dispose();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await FormRef.value.validate();
      changeOkLoading(false);
      if (options.value.callback && typeof options.value.callback === 'function') {
        const data = {
          ...formState,
          rawField: { ...rawField.value },
        };
        options.value.callback(data);
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
    height: 240px;
    border: 1px solid #d9d9d9;
    border-radius: 5px;
  }
</style>
