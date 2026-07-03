<template>
  <a-form-item :label="t('sys.kit.fixsure')" :required="widget.props.required">
    <a-select v-if="!widget.props.readonly"></a-select>
    <span v-else>示例治具</span>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-device-select">
  import { IFixsureSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  defineProps<{
    widget: IFixsureSelect;
  }>();
</script>

<style lang="less" scoped></style>
