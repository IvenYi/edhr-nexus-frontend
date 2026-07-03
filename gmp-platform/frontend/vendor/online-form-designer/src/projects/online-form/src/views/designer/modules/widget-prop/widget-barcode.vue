<template>
  <form-item :label="$t('sys.onlineForm.barcodeType')" :inline="false" class="important-mt-0px">
    <a-select :disabled="disabled" v-model:value="formState.codeType" class="w-full">
      <a-select-option v-for="item in codeList" :value="item.code" :key="item.code">{{
        item.title
      }}</a-select-option>
    </a-select>
  </form-item>
  <form-item :label="$t('sys.onlineForm.barcodeContent')" :inline="false">
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
  <form-item :label="$t('sys.onlineForm.horizontalAlignment')">
    <div class="pl-6px">
      <align-editor
        :disabled="disabled"
        type="horizontal"
        :value="formState.styles?.justifyContent ?? 'flex-start'"
        @update:value="handleUpdateAlign"
      />
    </div>
  </form-item>
  <form-item :label="$t('sys.onlineForm.displayBarcodeContent')" class="justify-between mt-12px">
    <div class="flex justify-end">
      <a-switch :disabled="disabled" v-model:checked="formState.showValue" size="small" />
    </div>
  </form-item>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import ValueEditor from '/@online-form/views/designer/modules/prop-editor/value-editor.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed } from 'vue';
  import { BwipCodeTypeOptions } from '/@online-form/views/designer/enums';
  import { PaperWidgeType } from '@gct/nocode-base';

  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import AlignEditor from '/@online-form/views/designer/modules/prop-editor/align-editor.vue';

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
    return BwipCodeTypeOptions.filter((t) => t.widget === PaperWidgeType.Barcode);
  });

  const handleUpdateAlign = (value: string) => {
    if (props.widget.styles === undefined) {
      Object.assign(props.widget, {
        styles: {},
      });
    }
    Object.assign(props.widget.styles!, {
      justifyContent: value,
    });
  };
</script>

<style></style>
