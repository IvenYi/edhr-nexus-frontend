<template>
  <div
    class="options-field-modal fixed p-20px"
    v-if="visible"
    :style="{ left: modalClientX, top: modalClientY }"
  >
    <div class="options-field-wrap pl-21px pr-16px pb-4px pt-36px rounded relative" title="">
      <CloseOutlined class="icon-delete absolute top-0 right-0" @click.stop="close" />
      <a-form
        ref="formRef"
        layout="vertical"
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 24 }"
        autocomplete="off"
      >
        <a-form-item
          label="选项值"
          name="label"
          :rules="[{ validator: trimValidator, trigger: 'change' }]"
        >
          <i18n-select-input
            class="i18n-select-input"
            attr="title"
            @on-i18n-select="(v) => handleI18nSelect(v, widget)"
            :i18nConfig="i18n"
          >
            <template #i18n-input>
              <a-input
                style="width: calc(100% - 32px); height: 32px"
                v-model:value="formState.label"
                :placeholder="$t('sys.inputText')"
                :maxlength="32"
                show-count
                @change="handleOk"
                @blur="handleBlur"
              />
            </template>
          </i18n-select-input>
        </a-form-item>
        <a-form-item
          name="value"
          label="选项key"
          :rules="[
            {
              validator: regValidator,
              trigger: 'change',
            },
            {
              validator: repeatValidator,
              trigger: 'change',
            },
          ]"
        >
          <a-input showCount :maxlength="32" v-model:value="formState.value" @change="handleOk" />
          <copy-module-key
            :moduleKey="formState.value"
            :showText="false"
            iconPos="left"
            isTooltip
          />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUnmounted } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { props } from '/@page-designer/hooks/usePropEditor';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import type { Rule } from 'ant-design-vue/es/form';

  const defProps = defineProps(props);
  const formRef = ref<FormInstance>();
  const formState = ref<{ label: string; value: string }>({ label: '', value: '' });
  const resolveCallback = ref();
  const visible = ref(false);
  const i18n = ref(defProps.widget?.i18n) || ref({});
  const widget = ref(defProps.widget);
  const optionType = ref();
  const modalClientX = ref();
  const modalClientY = ref();
  const optionKeys = ref<any>([]);
  const handleOk = async () => {
    await formRef.value!.validate();
  };

  const className = [
    'options-field-wrap',
    'ant-form',
    'ant-input',
    'ant-form-item',
    'ant-row',
    'icon-fuzhi',
    'ant-form-item-label',
    'i18n-select-input',
    'link',
    'icon-delete',
  ];
  async function handleClick(e: any) {
    if (
      !['LABEL', 'path', 'svg'].includes(e.target.nodeName) &&
      !className.some((i) => e.target.className.indexOf(i) > -1)
    ) {
      resolveCallback.value(formState.value);
      visible.value = false;
    }
  }

  const trimValidator = async (_rule: Rule, value: any) => {
    if (value.trim() === '') {
      formState.value!.label = '';
      return Promise.reject('选项值不能为空');
    } else {
      return Promise.resolve();
    }
  };

  const regValidator = async (_rule: Rule, value: any) => {
    const reg = /^[0-9a-zA-Z_]+$/;
    if (!reg.test(value.trim())) {
      formState.value!.value = '';
      return Promise.reject('选项key仅支持字母、数字、下划线');
    } else {
      return Promise.resolve();
    }
  };

  const repeatValidator = async (_rule: Rule, value: any) => {
    if (optionKeys.value.includes(value)) {
      formState.value!.value = '';
      return Promise.reject('选项key重复，请重新输入');
    } else {
      return Promise.resolve();
    }
  };

  async function handleBlur() {
    await formRef.value!.validate();
    resolveCallback.value(JSON.parse(JSON.stringify(formState.value)));
  }

  function close() {
    resolveCallback.value(formState.value);
    visible.value = false;
  }

  function handleI18nSelect({ i18nKey, i18nTitle }, widget: any) {
    widget.i18n.title = i18nKey;
    widget.props.title = widget.props.title || i18nTitle;
  }

  const open = async ({
    modelKey,
    option,
    type,
    clientX,
    clientY,
    keys,
  }: {
    modelKey?: string;
    option: { label: string; value: string };
    type: string;
    clientX: any;
    clientY: any;
    keys: any;
  }): Promise<FieldMetaDTO[]> => {
    formState.value = JSON.parse(JSON.stringify(option));
    optionType.value = type;
    modalClientX.value = (clientX >= 328 ? clientX - 540 : 35) + 'px';
    modalClientY.value = (clientY >= 715 ? 715 : clientY - 20) + 'px';
    optionKeys.value = keys;
    visible.value = true;
    window.addEventListener('click', handleClick, true);
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  onUnmounted(() => {
    formRef.value && formRef.value!.resetFields();
    window.removeEventListener('click', handleClick, false);
  });

  defineExpose({ open });
</script>
<style scoped lang="less">
  .options-field-modal {
    z-index: 9999;

    .options-field-wrap {
      width: 308px;
      background: #fff;
      box-shadow: 0 4px 14px 4px rgb(0 0 0 / 12%);
    }

    .icon-delete {
      width: 40px;
      height: 40px;
      color: #9b9b9b;
      line-height: 40px;
      cursor: pointer;

      &:hover {
        color: #000000bf;
      }
    }

    :deep(.ant-form.ant-form-vertical .ant-form-item-label) {
      line-height: 18px;
    }

    :deep(.ant-form-item-with-help .ant-form-item-explain) {
      min-height: 20px;
      line-height: 20px;
    }
  }

  :deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
  }
</style>
