<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.notes')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState">
      <a-form-item label="" name="remark">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.remark"
          :placeholder="
            t('sys.pleaseInputSth', {
              sth: t('sys.notes'),
            })
          "
          :rows="5"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { putPrintResourceUpdateRemarkById } from '/@/apis/gct-platform/PrintResourceController';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: {
    id?: string;
    remark?: string;
  } = reactive({
    id: undefined,
    remark: undefined,
  });

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await putPrintResourceUpdateRemarkById(
        { id: formState.id! },
        {
          remark: formState.remark,
        },
      );
      message.success(t('sys.operationSuccess'));
      closeModal();
      emit('ok');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
