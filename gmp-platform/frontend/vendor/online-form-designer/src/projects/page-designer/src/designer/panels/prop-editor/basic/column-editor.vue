<template>
  <div class="select-none">
    <a-form-item name="isSupportFold">
      <a-checkbox v-show="isSupportFold" v-model:checked="defaultFold" class="fold-checkbox">
        {{ t('sys.pageDesigner.defaultCollapsed') }}
      </a-checkbox>
      <a-radio-group
        v-model:value="isSupportFold"
        @change="handleRadioChange"
        size="small"
        class="mt-1"
      >
        <a-radio :value="true">{{ t('sys.pageDesigner.support') }}</a-radio>
        <a-radio :value="false">{{ t('sys.pageDesigner.nonsupport') }}</a-radio>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script setup lang="ts" name="column-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  const defProps = defineProps(props);

  const { t } = useI18n();
  const { propValue } = usePropEditor<CollapseValue>(defProps.propName, defProps.changeCallback);

  type CollapseValue = { support: string; defaultFold: boolean };

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
    if (e.target.value) {
      defaultFold.value = false;
    }
  };
</script>

<style lang="less" scoped>
  .fold-checkbox {
    position: absolute;
    right: 0;
    top: -22px;
    font-size: 12px;
  }
</style>
