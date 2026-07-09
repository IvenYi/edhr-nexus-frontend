<template>
  <div>
    <van-form ref="NgFormRef">
      <van-field
        :model-value="ngFormReasonText"
        is-link
        readonly
        label="报废原因"
        placeholder="请选择报废原因"
        @click="handleReasonSelect"
        :rules="[{ validator: validateReason }]"
        input-align="right"
      />
      <van-field
        v-model.number="ngFormData.scrap_qty_"
        label="报废数量"
        :rules="[{ validator: validateQty }]"
        placeholder="请输入报废数量"
        input-align="right"
        type="number"
        :max="9999999"
      />
    </van-form>

    <div class="p-16px">
      <van-button block plain type="primary" @click="handleAdd">添加报废</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { GctPopup } from '@mobile/utils/popup';
  import NgReasonPicker from './reason-picker-popup.vue';

  interface INgItem {
    scrap_group_id_?: string;
    scrap_group_name_?: string;
    scrap_qty_?: number;
    scrap_reason_id_?: string;
    scrap_reason_name_?: string;
  }

  const emit = defineEmits(['add']);
  const DefaultFormData = {
    scrap_group_id_: undefined,
    scrap_group_name_: undefined,
    scrap_qty_: undefined,
    scrap_reason_id_: undefined,
    scrap_reason_name_: undefined,
  };

  const NgFormRef = ref();
  const ngFormData = ref<INgItem>({
    ...DefaultFormData,
  });
  const ngFormReasonText = computed(() => {
    const { scrap_group_name_, scrap_reason_name_ } = ngFormData.value;
    return scrap_reason_name_ ? `${scrap_group_name_}/${scrap_reason_name_}` : scrap_group_name_;
  });

  const validateReason = () => {
    if (!ngFormData.value.scrap_group_id_) return '报废原因不能为空';
    return true;
  };
  const validateQty = () => {
    if ([undefined, ''].includes(ngFormData.value.scrap_qty_ as any)) return '报废数量不能为空';
    if (ngFormData.value.scrap_qty_! < 0) return '报废数量不能小于0';
    if (ngFormData.value.scrap_qty_! > 9999999) return '报废数量不能大于999999';
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
