<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.editor.saveAs')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="FormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.editor.version')"
        name="version"
        :rules="[
          { required: true },
          {
            validator: validateVersion,
            trigger: 'change',
          },
        ]"
      >
        <div class="flex">
          <a-input v-model:value="formState.version[0]" :maxlength="5" />
          <span class="ml-10px mr-10px">.</span>
          <a-input v-model:value="formState.version[1]" :maxlength="5" />
        </div>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSOInstance } from '/@app-designer/views/service-orchestration/hooks/useSOInstance';
  import type { Rule } from 'ant-design-vue/es/form';

  const FormRef = ref<FormInstance>();

  const reg = /^\d{1,2}\.\d{1,6}$/;

  const { t } = useI18n();
  const { saveAs } = useSOInstance();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner(() => {});

  const formState = reactive({
    version: [undefined, undefined],
  });

  const handleClose = () => {
    formState.version = [undefined, undefined];
    closeModal();
    FormRef.value?.clearValidate();
  };

  const validateVersion = async (_rule: Rule, value) => {
    if (!/\d+/.test(value[0]) || !/\d+/.test(value[1])) {
      return Promise.reject('请输入正确的版本号');
    } else {
      return Promise.resolve();
    }
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await FormRef.value!.validate();
      await saveAs(formState.version.join('.'));
      changeOkLoading(false);
      closeModal();
    } catch (err) {
      changeOkLoading(false);
    }
  };
</script>

<style scoped lang="less">
  .version-input {
    display: flex;
    justify-content: space-between;

    .ant-input-number {
      width: 10px;
      flex: 1;
    }

    > span {
      margin: 0 10px;
    }
  }
</style>
