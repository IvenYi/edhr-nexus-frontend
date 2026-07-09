<template>
  <form-item :label="$t('sys.onlineForm.qrCodeType')" :inline="false" class="important-mt-0px">
    <a-select :disabled="disabled" v-model:value="formState.codeType" class="w-full" size="small">
      <a-select-option v-for="item in codeList" :value="item.code" :key="item.code">{{
        item.title
      }}</a-select-option>
    </a-select>
  </form-item>
  <form-item :label="$t('sys.onlineForm.qrCodeContent')" :inline="false">
    <value-editor
      :disabled="disabled"
      v-model:value="formState.value"
      v-model:value-type="formState.valueType"
      v-model:field-type="formState.fieldType"
      v-model:model-link="formState.modelLink"
      v-model:field-link="formState.fieldLink"
      v-model:is-Field-Model="formState.isFieldModel"
      v-model:model-key="formState.modelKey"
      v-model:sub-model-key="formState.subModelKey"
      v-model:sub-field-key="formState.subFieldKey"
      v-model:create-type="formState.createType"
      v-model:ref-model-key="formState.refModelKey"
    />
  </form-item>
</template>

<script setup lang="ts">
  // import PanelFormItem from '/@online-form/views/designer/modules/panel/panel-form-item.vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import ValueEditor from '/@online-form/views/designer/modules/prop-editor/value-editor.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed } from 'vue';
  import { BwipCodeTypeOptions } from '/@online-form/views/designer/enums';
  import { PaperWidgeType } from '@gct/nocode-base';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const props = defineProps<{
    widget: PaperWidget.Barcode;
    disabled?: boolean;
  }>();

  const { doc } = useSpreadSheet();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const codeList = computed(() => {
    return BwipCodeTypeOptions.filter((t) => t.widget === PaperWidgeType.Qrcode);
  });
</script>

<style></style>
