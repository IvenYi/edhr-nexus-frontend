<template>
  <a-form-item-rest>
    <a-select
      style="width: 310px; margin-right: 8px"
      :value="selectValue"
      :placeholder="$t('sys.chooseText')"
      :options="fieldOptions"
      @change="changeValue"
    />
  </a-form-item-rest>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, computed } from 'vue';

  const props = defineProps<{
    value?: string;
  }>();
  const selectValue = computed(() => props.value || undefined);
  const feildCascaderName = ref({});
  function changeValue(key, { label }) {
    feildCascaderName.value = label;
    emit('update:value', key);
  }
  const emit = defineEmits(['update:value']);

  enum FieldKeys {
    FORM_TMPL_CODE = 'form_tmpl_code',
    DHR_TMPL_CODE = 'dhr_tmpl_code',
    CONTAINER = 'container',
    SN = 'sn',
    MFG_ORDER_CODE = 'mfg_order_code',
    PRODUCT_FAMILY_CODE = 'product_family_code',
    PRODUCT_FAMILY_NAME = 'product_family_name',
    PRODUCT_CODE = 'product_code',
    PRODUCT_NAME = 'product_name',
    SPEC = 'spec',
  }

  enum FieldLabels {
    FORM_TMPL_CODE = '表单模板编码',
    DHR_TMPL_CODE = 'DHR模板编码',
    CONTAINER = '批次',
    SN = 'sn',
    MFG_ORDER_CODE = '工单编号',
    PRODUCT_FAMILY_CODE = '产品家族编码',
    PRODUCT_FAMILY_NAME = '产品家族名称',
    PRODUCT_CODE = '产品编码',
    PRODUCT_NAME = '产品名称',
    SPEC = '规格型号',
  }
  const fieldOptions = [
    { value: FieldKeys.FORM_TMPL_CODE, label: FieldLabels.FORM_TMPL_CODE },
    { value: FieldKeys.DHR_TMPL_CODE, label: FieldLabels.DHR_TMPL_CODE },
    { value: FieldKeys.CONTAINER, label: FieldLabels.CONTAINER },
    { value: FieldKeys.SN, label: FieldLabels.SN },
    { value: FieldKeys.MFG_ORDER_CODE, label: FieldLabels.MFG_ORDER_CODE },
    { value: FieldKeys.PRODUCT_FAMILY_CODE, label: FieldLabels.PRODUCT_FAMILY_CODE },
    { value: FieldKeys.PRODUCT_FAMILY_NAME, label: FieldLabels.PRODUCT_FAMILY_NAME },
    { value: FieldKeys.PRODUCT_CODE, label: FieldLabels.PRODUCT_CODE },
    { value: FieldKeys.PRODUCT_NAME, label: FieldLabels.PRODUCT_NAME },
    { value: FieldKeys.SPEC, label: FieldLabels.SPEC },
  ];
  defineExpose({
    feildCascaderName,
  });
</script>
<style scoped lang="less"></style>
