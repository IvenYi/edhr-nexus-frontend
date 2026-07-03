<template>
  <a-form-item :label="t('受控组件')" name="widgetId">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('受控组件') })"
      v-model:value="formState.widgetId"
    >
      <a-select-option v-for="item in modals" :key="item.id" :value="item.id">
        {{ item.name }}
      </a-select-option>
    </a-select>
  </a-form-item>

  <a-form-item :label="t('执行动作')" name="action">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('执行动作') })"
      v-model:value="formState.action"
    >
      <a-select-option v-for="item in widgetActions.modal" :key="item.value" :value="item.value">
        {{ item.label }}
      </a-select-option>
    </a-select>
  </a-form-item>
</template>

<script lang="ts" setup>
  import { computed, PropType } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWidgetPicker } from '../../hooks/useWidgetPicker';
  import { widgetActions } from '../../schema/widgetActions';
  import { Control } from '../../types';

  const { t } = useI18n();
  const { modals } = useWidgetPicker();

  const props = defineProps({
    formState: {
      type: Object as PropType<Control.WidgetModal>,
      default: () => ({}),
    },
  });

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      Object.assign(props.formState, value);
    },
  });
</script>

<style lang="less" scoped></style>
