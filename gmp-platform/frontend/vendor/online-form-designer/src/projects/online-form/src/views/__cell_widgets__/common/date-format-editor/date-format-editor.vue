<template>
  <form-item
    class="date-format-editor"
    :label="t('sys.component.fieldTypeProps.dateFormat')"
    :inline="false"
  >
    <template #label>
      <span> {{ t('sys.component.fieldTypeProps.dateFormat') }} </span>
      <div class="date-format-editor__switch">
        <span class="date-format-editor__switch_text">{{ $t('sys.customize') }}</span>
        <a-switch size="small" v-model:checked="customFormat" :disabled="disabled" />
      </div>
    </template>
    <a-row>
      <a-col :span="5" v-if="!customFormat">
        <a-select
          class="date-format-editor__separator"
          size="small"
          v-model:value="separatorValue"
          :options="separatorOptions"
          :disabled="disabled"
        />
      </a-col>
      <a-col :span="19" v-if="!customFormat">
        <a-select
          class="date-format-editor__template"
          size="small"
          v-model:value="templateValue"
          :options="templateOptions"
          :disabled="disabled"
        />
      </a-col>
      <a-col :span="24" v-if="!!customFormat">
        <a-input
          class="date-format-editor__custom"
          size="small"
          v-model:value="widget.format"
          :disabled="disabled"
          :placeholder="
            t('sys.pleaseInputSth', { sth: t('sys.component.fieldTypeProps.dateFormat') })
          "
        />
      </a-col>
    </a-row>
  </form-item>
</template>

<script setup lang="ts" name="data-type-format-editor">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { toRefs } from 'vue';
  import { useDateFormatEditor } from './date-format-editor';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.DateTime;
    fieldType: FIELD_TYPE;
    disabled: boolean;
  }>();

  const { widget, fieldType } = toRefs(props);
  const { customFormat, separatorValue, templateValue, separatorOptions, templateOptions } =
    useDateFormatEditor(widget, fieldType);
</script>

<style lang="less" scoped>
  .date-format-editor__separator {
    width: 100%;
  }
  .date-format-editor__template {
    width: 100%;
    padding-left: 4px;
  }

  .date-format-editor__custom {
    margin-top: 4px;
  }

  .date-format-editor__switch {
    float: right;
    line-height: 1;
  }
  .date-format-editor__switch_text {
    vertical-align: middle;
    margin-right: 5px;
  }
</style>
