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

    <QuickSearchEditor
      v-if="isRefType || isRefMultiType"
      :fieldMeta="fieldMeta"
      :disabled="disabled"
      v-model:search-field="formState.searchField"
    />

    <RefAutofillEditor
      v-if="isRefType || isShowAutoFillConfig"
      :fieldMeta="fieldMeta"
      :disabled="disabled"
      v-model:autofill-rules="formState.autofillRules"
    />

    <RefDataFilterEditor
      v-if="isRefType || isRefMultiType"
      :fieldMeta="fieldMeta"
      :disabled="disabled"
      v-model:data-filter="formState.dataFilter"
    />
  </a-form>
</template>

<script setup lang="ts">
  import { FIELD_TYPE } from '@gct/runtime';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  import QuickSearchEditor from '../common/quick-search-editor/quick-search-editor.vue';
  import RefDataFilterEditor from '../common/ref-data-filter-editor/ref-data-filter-editor.vue';
  import RefAutofillEditor from '../common/ref-autofill-editor/ref-autofill-editor.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { computed, ref } from 'vue';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = useI18n();

  const formRef = ref<any>(null);

  const props = defineProps<{
    fieldMeta: IBindField;
    widget: CellWidget.Ref;
    disabled: boolean;
  }>();

  const isRefType = computed(() => {
    return props.fieldMeta.fieldType === FIELD_TYPE.REF;
  });

  const isRefMultiType = computed(() => {
    return props.fieldMeta.fieldType === FIELD_TYPE.REF_MULTI;
  });

  const isShowAutoFillConfig = computed(() => {
    return [
      FIELD_TYPE.ROUTING_OPERATION,
      FIELD_TYPE.NOT_GOOD_REASON,
      FIELD_TYPE.NOT_GOOD_GROUP,
      FIELD_TYPE.SCRAP_REASON,
      FIELD_TYPE.SCRAP_GROUP,
      FIELD_TYPE.SCRAP_MATERIAL,
      FIELD_TYPE.DEVICE_REF,
    ].includes(props.fieldMeta.fieldType as FIELD_TYPE);
  });

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
