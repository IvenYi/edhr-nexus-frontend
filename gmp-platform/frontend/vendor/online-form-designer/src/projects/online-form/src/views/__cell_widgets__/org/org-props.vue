<template>
  <a-form ref="formRef" :model="formState">
    <form-item :label="`${t('sys.pageDesigner.fieldPlaceholder')}`" :inline="false">
      <a-input
        size="small"
        v-model:value="formState.placeholder"
        :placeholder="t('sys.inputText')"
        :disabled="disabled"
        show-count
        :maxlength="32"
      />
    </form-item>

    <form-item :label="`${t('sys.defaultValue')}`" name="defaultValue" :inline="false">
      <a-select
        size="small"
        v-model:value="formState.defaultValue"
        :placeholder="t('sys.chooseText')"
        :disabled="disabled"
      >
        <a-select-option :value="FieldSysVarDefaultValueEnum.NULL">{{
          t('sys.none')
        }}</a-select-option>
        <a-select-option :value="FieldSysVarDefaultValueEnum.CURRENT_ORG">{{
          t('sys.sysCurrentOrg')
        }}</a-select-option>
      </a-select>
    </form-item>
  </a-form>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldSysVarDefaultValueEnum } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { computed, ref } from 'vue';

  const { t } = useI18n();

  const formRef = ref<any>(null);

  const props = defineProps<{
    widget: CellWidget.Org;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });
</script>

<style></style>
