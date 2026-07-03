<template>
  <div class="batch-split-modal">
    <a-form
      :model="formState"
      ref="formRef"
      :label-col="{ style: { width: '80px' } }"
      :labelAlign="'right'"
    >
      <a-row :gutter="12">
        <a-col :span="24">
          <a-form-item :label="$t('sys.type') + '：'">
            <a-radio-group v-model:value="formState.type" :options="typeOptions" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            v-if="formState.type === 'container_qty_'"
            :label="$t('sys.quantity') + '：'"
            name="container_qty_"
            :rules="[
              { required: true, message: $t('sys.pleaseInputSth', { sth: $t('sys.quantity') }) },
            ]"
          >
            <a-input-number
              class="w100%"
              v-model:value="formState.container_qty_"
              :placeholder="$t('sys.pleaseInputSth')"
              :min="0"
            />
          </a-form-item>
          <a-form-item
            v-else
            :label="$t('sys.edhr.lotQty') + '：'"
            name="container_num_"
            :rules="[
              {
                required: true,
                message: $t('sys.pleaseInputSth', { sth: $t('sys.edhr.lotQty') }),
              },
            ]"
          >
            <a-input-number
              class="w100%"
              v-model:value="formState.container_num_"
              :placeholder="$t('sys.pleaseInputSth')"
              :min="1"
              :precision="0"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
      <a-button style="margin-right: 8px" @click="onCancel">{{ $t('sys.cancelText') }}</a-button>
      <a-button type="primary" @click="onSubmit">{{ $t('sys.okText') }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { IModal } from '@gct/runtime';
  import { message as Message } from 'ant-design-vue';

  const defProps = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const formRef = ref();
  const formState = ref({
    type: 'container_num_',
    container_num_: '',
    container_qty_: '',
  });

  const typeOptions = [
    { label: $t('sys.edhr.splitType.container_qty_'), value: 'container_qty_' },
    { label: $t('sys.edhr.splitType.container_num_'), value: 'container_num_' },
  ];

  async function onSubmit() {
    await formRef.value.validate();
    const data: any = { type: formState.value.type };
    const splitNum =
      formState.value.type === 'container_num_'
        ? formState.value.container_num_
        : formState.value.container_qty_;
    if (splitNum > defProps.data.unProducedCount) {
      Message.warn($t('sys.edhr.splitMaxTip'));
      return;
    }
    Object.assign(
      data,
      formState.value.type === 'container_num_'
        ? {
            container_num_: formState.value.container_num_,
          }
        : {
            container_qty_: formState.value.container_qty_,
          },
    );
    defProps.modal.dismiss({
      ok: true,
      data,
    });
  }

  function onCancel() {
    defProps.modal.dismiss();
  }
</script>

<style lang="less" scoped>
  .batch-split-modal {
    padding: 16px;
    margin-bottom: 32px;
  }
</style>
