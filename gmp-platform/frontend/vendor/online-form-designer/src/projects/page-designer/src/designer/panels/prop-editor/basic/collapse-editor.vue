<template>
  <div>
    <a-form-item name="isSupportFold" style="margin-bottom: 10px">
      <a-checkbox
        v-show="isSupportFold === '1'"
        v-model:checked="defaultFold"
        class="fold-checkbox"
        >{{ t('sys.pageDesigner.defaultFold') }}</a-checkbox
      >
      <a-radio-group v-model:value="isSupportFold" @change="handleRadioChange" size="small">
        <a-radio value="1">{{ t('sys.pageDesigner.support') }}</a-radio>
        <a-radio value="0">{{ t('sys.pageDesigner.nonsupport') }}</a-radio>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script setup lang="ts" name="collapse-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  const { t } = useI18n();
  const defProps = defineProps(props);
  type CollapseValue = { support: string; defaultFold: boolean };
  const { propValue } = usePropEditor<CollapseValue>(defProps.propName, defProps.changeCallback);
  const isSupportFold = computed({
    get() {
      return propValue.value.support;
    },
    set(val) {
      propValue.value = { ...propValue.value, support: val };
    },
  });
  const defaultFold = computed({
    get() {
      return propValue.value.defaultFold;
    },
    set(val) {
      propValue.value = { ...propValue.value, defaultFold: val };
    },
  });

  const handleRadioChange = (e) => {
    if (e.target.value === '1') {
      propValue.value.defaultFold = true;
    }
  };
</script>

<style lang="less" scoped>
  .fold-checkbox {
    position: absolute;
    right: 0;
    top: -26px;
    font-size: 12px;
  }
</style>
