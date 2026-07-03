<template>
  <div class="edit-tmpl-modal">
    <component :is="componentMap[formData.type]" :tmpl="formData" ref="formRef" />
  </div>
</template>

<script setup lang="ts" name="edit-tmpl-modal">
  import { reactive, ref, toRaw, watch } from 'vue';
  import { useModal } from '@gct/runtime';
  import {
    DeviceLink,
    DeviceLinkTmplUtil,
    FormModelController,
    FormTmplConfigController,
    useFormModel,
    useFormTmplConfig,
  } from '@gct/nocode-base';
  import { cloneDeep } from 'lodash-es';
  import DeviceTmplForm from './device-tmpl-form.vue';
  import AiTmplForm from './ai-tmpl-form.vue';

  const props = defineProps<{
    tmpl: DeviceLink.BasicTmpl;
    formModelController: FormModelController;
    tmplController: FormTmplConfigController;
    beforeOkClose: (tmpl: DeviceLink.BasicTmpl) => Promise<boolean>;
  }>();

  const { provideController } = useFormModel();
  provideController(props.formModelController);

  useFormTmplConfig().provideController(props.tmplController);

  const componentMap = {
    [DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION]: DeviceTmplForm,
    [DeviceLink.TmplTypeEnum.AI_OCR]: AiTmplForm,
  };
  const formRef = ref();
  const formData = ref<any>(cloneDeep(props.tmpl));

  // 类型变更的时候初始化数据
  watch(
    () => formData.value.type,
    (val, val2) => {
      if (val && val !== val2) {
        formData.value = DeviceLinkTmplUtil.createTmpl(val);
      }
    },
  );

  useModal(async () => {
    await formRef.value!.validate();
    const ok = await props.beforeOkClose(toRaw(formData.value));
    return {
      ok: ok,
    };
  });
</script>

<style lang="less" scoped>
  .edit-tmpl-modal {
    padding: 1px 24px 24px;

    // switch 样式
    :deep(.ant-switch) {
      height: 14px;
      line-height: 14px;
      min-width: 24px;
      .ant-switch-handle {
        width: 10px;
        height: 10px;
      }
      .ant-switch-inner {
        margin: 0 5px 0 18px;
      }
      &.ant-switch-checked .ant-switch-inner {
        margin: 0 18px 0 5px;
      }
      &.ant-switch-checked .ant-switch-handle {
        left: calc(100% - 12px);
      }
    }
    :deep(.form-item) {
      margin-top: 24px;
      &:not(.form-inline) .form-item__label {
        margin-bottom: 8px;
      }
      .form-item__label {
        font-weight: 400;
        font-size: 14px;
        color: #1a1d23;
        line-height: 20px;
        display: flex;
        align-items: center;
      }
      .ant-form-item-explain {
        position: absolute;
        bottom: -24px;
      }
    }
  }
</style>
