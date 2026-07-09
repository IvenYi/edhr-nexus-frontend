<template>
  <div>
    <van-form ref="NgFormRef">
      <van-field
        :model-value="ngFormReasonText"
        is-link
        readonly
        label="不良原因"
        placeholder="请选择不良原因"
        @click="handleReasonSelect"
        :rules="[{ validator: validateReason }]"
        input-align="right"
      />
      <van-field
        v-model.number="ngFormData.not_good_qty_"
        label="不良数量"
        :rules="[{ validator: validateQty }]"
        placeholder="请输入不良数量"
        input-align="right"
        type="number"
        :max="9999999"
      />
    </van-form>

    <div class="p-16px">
      <van-button block plain type="primary" @click="handleAdd">添加不良</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { GctPopup } from '@mobile/utils/popup';
  import NgReasonPicker from './reason-picker-popup.vue';

  interface INgItem {
    not_good_group_id_?: string;
    not_good_group_name_?: string;
    not_good_qty_?: number;
    not_good_reason_id_?: string;
    not_good_reason_name_?: string;
  }

  const emit = defineEmits(['add']);
  const DefaultFormData = {
    not_good_group_id_: undefined,
    not_good_group_name_: undefined,
    not_good_qty_: undefined,
    not_good_reason_id_: undefined,
    not_good_reason_name_: undefined,
  };

  const NgFormRef = ref();
  const ngFormData = ref<INgItem>({
    ...DefaultFormData,
  });
  const ngFormReasonText = computed(() => {
    const { not_good_group_name_, not_good_reason_name_ } = ngFormData.value;
    return not_good_reason_name_
      ? `${not_good_group_name_}/${not_good_reason_name_}`
      : not_good_group_name_;
  });

  const validateReason = () => {
    if (!ngFormData.value.not_good_group_id_) return '不良原因不能为空';
    return true;
  };
  const validateQty = () => {
    if ([undefined, ''].includes(ngFormData.value.not_good_qty_ as any)) return '不良数量不能为空';
    if (ngFormData.value.not_good_qty_! < 0) return '不良数量不能小于0';
    if (ngFormData.value.not_good_qty_! > 9999999) return '不良数量不能大于999999';
    return true;
  };

  const handleAdd = async () => {
    try {
      await NgFormRef.value?.validate();
      emit('add', { ...ngFormData.value });
      Object.assign(ngFormData.value, DefaultFormData);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleReasonSelect = () => {
    GctPopup.open(NgReasonPicker, {
      popupProps: {
        position: 'bottom',
      },
      onOk: (value: INgItem) => {
        Object.assign(ngFormData.value, { ...value });
      },
    });
  };
</script>

<style scoped lang="less"></style>
