<template>
  <form-item
    :label="$t('sys.onlineForm.timeDifferenceFormat')"
    :inline="false"
    class="important-mt-0px"
  >
    <a-select :disabled="disabled" v-model:value="formState.format" class="w-full" size="small">
      <a-select-option v-for="(key, value) in TimeDiffFormat" :value="value" :key="key">{{
        t(`sys.onlineForm.timeDiffFormat.${value}`)
      }}</a-select-option>
    </a-select>
  </form-item>
  <form-item :inline="false">
    <template #label>
      <span>{{ $t('sys.startTime') }}</span>
    </template>
    <template #extra>
      <a-checkbox :disabled="disabled" v-model:checked="formState.startDefault">{{
        $t('sys.onlineForm.defaultSystemTime')
      }}</a-checkbox>
    </template>
    <a-select
      :disabled="disabled || formState.startDefault"
      v-model:value="formState.startField.field"
      class="w-full"
      size="small"
    >
      <a-select-option v-for="f in modelFields" :value="f.key" :key="f.key">{{
        f.name
      }}</a-select-option>
    </a-select>
  </form-item>
  <form-item :inline="false">
    <template #label>
      <span>{{ $t('sys.endTime') }}</span>
    </template>
    <template #extra>
      <a-checkbox :disabled="disabled" v-model:checked="formState.endDefault">{{
        $t('sys.onlineForm.defaultSystemTime')
      }}</a-checkbox>
    </template>
    <a-select
      :disabled="disabled || formState.endDefault"
      v-model:value="formState.endField.field"
      class="w-full"
      size="small"
    >
      <a-select-option v-for="f in modelFields" :value="f.key" :key="f.key">{{
        f.name
      }}</a-select-option>
    </a-select>
  </form-item>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed, watch } from 'vue';
  import { TimeDiffFormat } from '@gct/nocode-base';
  import { useSpreadSheet } from '../../hooks/useSpreadSheet';
  import { useModelFields } from '../../hooks/useModelFields';
  import type { IBindField } from '@gct/nocode-base';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    widget: PaperWidget.TimeDiff;
    disabled?: boolean;
  }>();

  const { currentCell } = useSpreadSheet();
  const { modelMetaMap } = useModelFields();
  const { t } = useI18n();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  // 仅支持时间类型的字段
  const modelFields = computed(() => {
    if (!currentCell.value?.modelKey) return [];
    return modelMetaMap.value[currentCell.value.modelKey].fields.filter((item) => {
      return [FIELD_TYPE.TIME, FIELD_TYPE.DATE_TIME, FIELD_TYPE.DATE].includes(item.type as any);
    });
  });

  watch(
    () => props.widget.startDefault,
    (value) => {
      if (value) {
        Object.assign(props.widget, {
          startField: {},
        });
      }
    },
  );

  watch(
    () => props.widget.endDefault,
    (value) => {
      if (value) {
        Object.assign(props.widget, {
          endField: {},
        });
      }
    },
  );

  const getBindField = (field?: string): IBindField | null => {
    if (!field) return null;
    const fieldMeta = modelFields.value.find((item) => item.key === field);
    if (!fieldMeta) return null;
    const bindField: IBindField = {
      field,
      fieldType: fieldMeta.type as FIELD_TYPE,
      model: currentCell.value?.modelKey,
    };
    if (currentCell.value?.refFieldKey) {
      bindField.subModelKey = currentCell.value?.modelKey;
      bindField.subFieldKey = currentCell.value?.refFieldKey;
    }
    return bindField;
  };

  watch(
    () => props.widget.startField.field,
    (field) => {
      const bindField = getBindField(field);
      bindField &&
        Object.assign(props.widget, {
          startField: bindField,
        });
    },
  );

  watch(
    () => props.widget.endField.field,
    (field) => {
      const bindField = getBindField(field);
      bindField &&
        Object.assign(props.widget, {
          endField: bindField,
        });
    },
  );
</script>

<style></style>
