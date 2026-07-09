<template>
  <form-item :label="$t('sys.onlineForm.pageNumberStyle')" :inline="false" class="important-mt-0px">
    <a-select
      :disabled="disabled"
      v-model:value="formState.format"
      class="w-full"
      size="small"
      @change="handleFormatChange"
    >
      <a-select-option v-for="f in PaginationFormatOptions" :value="f.exp" :key="f.exp">{{
        f.label
      }}</a-select-option>
    </a-select>
    <a-textarea
      class="mt-6px"
      :disabled="disabled"
      v-if="formState.format === PaginationFormat.Custom"
      v-model:value="formState.customFormat"
      show-count
      :rows="3"
      :maxlength="120"
      :placeholder="CustomFormatPlaceholder"
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
  import { PaginationFormat } from '@gct/nocode-base';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { PaginationFormatOptions } from '/@online-form/views/designer/enums';
  import SizeEditor from '/@online-form/views/designer/modules/prop-editor/size-editor.vue';
  import AlignEditor from '/@online-form/views/designer/modules/prop-editor/align-editor.vue';
  import FontEditor from '/@online-form/views/designer/modules/prop-editor/font-editor.vue';
  import { computed } from 'vue';

  const props = defineProps<{
    widget: PaperWidget.Pagination;
    disabled?: boolean;
  }>();

  const DefaultCustomFormat = 'Page ${no} / ${total}';
  const CustomFormatPlaceholder = $t('sys.onlineForm.forExample') + '：' + DefaultCustomFormat;

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const handleFormatChange = (value) => {
    if (value === PaginationFormat.Custom) {
      Object.assign(props.widget, {
        customFormat: DefaultCustomFormat,
      });
    }
  };
</script>

<style></style>
