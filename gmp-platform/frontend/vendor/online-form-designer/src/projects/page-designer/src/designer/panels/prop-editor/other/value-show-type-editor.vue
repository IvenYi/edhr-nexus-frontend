<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="8">布尔值</a-col>
    <a-col :span="16">
      <a-select v-model:value="propValue.boolean">
        <a-select-option value="radio">单选</a-select-option>
        <a-select-option value="select">下拉选择</a-select-option>
        <a-select-option value="switch">开关</a-select-option>
      </a-select>
    </a-col>
    <a-col :span="8">小数</a-col>
    <a-col :span="16">
      <a-select v-model:value="propValue.decimal">
        <a-select-option value="input">输入</a-select-option>
        <a-select-option value="select">下拉选择</a-select-option>
      </a-select>
    </a-col>
    <a-col :span="8">整数</a-col>
    <a-col :span="16">
      <a-select v-model:value="propValue.integer">
        <a-select-option value="input">输入</a-select-option>
        <a-select-option value="select">下拉选择</a-select-option>
      </a-select>
    </a-col>
    <a-col :span="8">字符串</a-col>
    <a-col :span="16">
      <a-select v-model:value="propValue.string">
        <a-select-option value="input">输入</a-select-option>
        <a-select-option value="select">下拉选择</a-select-option>
      </a-select>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="value-show-type-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style lang="less" scoped></style>
