<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.app.version.create')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('版本号')"
        name="appVersion"
        :rules="[
          {
            required: true,
            validator: validateAppVersion,
            trigger: 'change',
          },
        ]"
      >
        <div class="flex">
          <a-input-number
            :max="999"
            :min="0"
            :step="1"
            :precision="0"
            v-model:value="verState.v1"
          />
          <span class="ml-10px mr-10px font-bold">.</span>
          <a-input-number
            :max="999"
            :min="0"
            :step="1"
            :precision="0"
            v-model:value="verState.v2"
          />
          <span class="ml-10px mr-10px font-bold">.</span>
          <a-input-number
            :max="999"
            :min="0"
            :step="1"
            :precision="0"
            v-model:value="verState.v3"
          />
        </div>
      </a-form-item>

      <a-form-item
        label="基线版本"
        name="sourceBranchId"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select v-model:value="formState.sourceBranchId" @change="handleBaseChange">
          <a-select-option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.appVersion }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="发行标识"> {{ sourceBarnch?.releaseTag }} </a-form-item>
      <a-form-item label="备注" name="description">
        <a-textarea v-model:value="formState.description" :rows="5" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postAppCreateBranchByAppId } from '/@/apis/gct-platform/AppController';
  import type { CreateBranchRequest, AppBranchResponse } from '/@/apis/gct-platform/model';

  const props = defineProps<{
    branches: AppBranchResponse[];
  }>();

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: CreateBranchRequest = reactive({
    appId: undefined,
    appVersion: undefined,
    description: undefined,
    sourceBranchId: undefined,
  });

  const verState = reactive({
    v1: undefined,
    v2: undefined,
    v3: undefined,
  });

  const sourceBarnch = computed(() => {
    if (!formState.sourceBranchId) return {};
    return props.branches.find((b) => b.id === formState.sourceBranchId);
  });

  const validateAppVersion = async () => {
    if (
      [undefined, null].includes(verState.v1 as any) ||
      [undefined, null].includes(verState.v2 as any) ||
      [undefined, null].includes(verState.v3 as any)
    ) {
      return Promise.reject('请输入版本号');
    } else {
      const verString = [verState.v1, verState.v2, verState.v3]
        .map((v) => String(v).padStart(3, '0'))
        .join('');
      const baseVerString = sourceBarnch.value?.appVersion
        ?.split('.')
        .map((v) => String(v).padStart(3, '0'))
        .join('');
      if (verString <= baseVerString!) {
        return Promise.reject('版本号需要高于基线版本');
      }
      return Promise.resolve();
    }
  };

  const handleBaseChange = () => {
    formRef.value?.validateFields(['appVersion']);
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    Object.assign(verState, {
      v1: undefined,
      v2: undefined,
      v3: undefined,
    });
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postAppCreateBranchByAppId(
        {
          appId: formState.appId!,
        },
        {
          ...formState,
          appVersion: `${verState.v1}.${verState.v2}.${verState.v3}`,
        },
      );
      emit('ok');
      message.success(t('sys.operationSuccess'));
      closeModal();
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
