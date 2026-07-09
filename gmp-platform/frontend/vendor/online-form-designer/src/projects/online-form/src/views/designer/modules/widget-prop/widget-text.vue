<template>
  <form-item :label="$t('sys.onlineForm.cellContent')" :inline="false" class="important-mt-0px">
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
  <form-item :label="$t('sys.onlineForm.textAreaSize')" :inline="false">
    <size-editor
      :disabled="disabled"
      v-model:width="formState.layout.width"
      v-model:height="formState.layout.height"
    />
  </form-item>
  <form-item :label="$t('sys.onlineForm.textStyle')" :inline="false">
    <font-editor :disabled="disabled" :widget="widget" />
  </form-item>
  <form-item :label="$t('sys.onlineForm.horizontalAlignment')" class="important-mt-6px">
    <div class="pl-6px">
      <align-editor
        :disabled="disabled"
        type="horizontal"
        v-model:value="formState.styles.justifyContent"
      />
    </div>
  </form-item>
  <form-item :label="$t('sys.onlineForm.verticalAlignment')" class="important-mt-6px">
    <div class="pl-6px">
      <align-editor
        :disabled="disabled"
        type="vertical"
        v-model:value="formState.styles.alignItems"
      />
    </div>
  </form-item>
</template>

<script setup lang="ts">
  // import PanelFormItem from '/@online-form/views/designer/modules/panel/panel-form-item.vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import ValueEditor from '/@online-form/views/designer/modules/prop-editor/value-editor.vue';
  import SizeEditor from '/@online-form/views/designer/modules/prop-editor/size-editor.vue';
  import AlignEditor from '/@online-form/views/designer/modules/prop-editor/align-editor.vue';
  import FontEditor from '/@online-form/views/designer/modules/prop-editor/font-editor.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed } from 'vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const props = defineProps<{
    widget: PaperWidget.Text;
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
</script>

<style scoped lang="less"></style>
