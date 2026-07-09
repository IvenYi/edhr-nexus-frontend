<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('新建版本')"
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
      <a-form-item :label="t('基线版本')" name="srcId" :rules="[{ required: true }]">
        <a-select v-model:value="formState.srcId">
          <a-select-option v-for="item in processVersionList" :key="item.id"
            >{{ item.version
            }}<span v-if="item.active === 1" class="primary-gct">(已激活)</span></a-select-option
          >
        </a-select>
      </a-form-item>
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
      <a-form-item :label="t('描述')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          :maxlength="120"
          show-count
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBpmn } from '/@app-designer/views/process-designer/src/hooks/useBpmn';
  import type { Rule } from 'ant-design-vue/es/form';

  const FormRef = ref<FormInstance>();

  // const reg = /^\d{1,2}\.\d{1,6}$/;

  const { t } = useI18n();
  const { saveAs, processVersionList, processResponse } = useBpmn();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    formState.srcId = processResponse.value.activeId!;
  });

  const formState = reactive({
    srcId: '',
    version: [undefined, undefined],
    description: '',
  });

  const handleClose = () => {
    Object.assign(formState, {
      srcId: '',
      version: [undefined, undefined],
      description: '',
    });
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
      await saveAs({
        ...formState,
        version: formState.version.join('.'),
      });
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
