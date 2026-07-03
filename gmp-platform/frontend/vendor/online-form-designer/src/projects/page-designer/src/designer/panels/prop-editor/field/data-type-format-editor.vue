<template>
  <a-input-group>
    <a-row :gutter="0">
      <a-col :span="5">
        <a-select v-model:value="separatorValue" style="width: 100%">
          <a-select-option value="-">-</a-select-option>
          <a-select-option value="/">/</a-select-option>
          <a-select-option value=".">.</a-select-option>
        </a-select>
      </a-col>
      <a-col :span="19">
        <a-select
          v-model:value="formatValue"
          :options="options"
          style="width: 100%; padding-left: 4px"
        />
      </a-col>
    </a-row>
  </a-input-group>
</template>

<script setup lang="ts" name="data-type-format-editor">
  import { computed, watch, toRaw, ref } from 'vue';
  import { props } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge } from 'lodash-es';

  const { t } = useI18n();
  const defProps = defineProps(props);

  const options = ref<{ label: string; value: string | number | boolean }[]>([]);

  const separatorValue = computed<string>({
    get() {
      return defProps.widget?.props.separator ?? '';
    },
    set(value: string) {
      merge(defProps.widget?.props, {
        separator: value,
        format: (defProps.propConfig.initPickerType ?? '').replace(/-/g, value),
        dateType: defProps.propConfig.initPickerType ?? '',
      });
    },
  });

  const formatValue = computed<string>({
    get() {
      return defProps.widget?.props.format ?? '';
    },
    set(value: string) {
      merge(defProps.widget?.props, {
        format: value,
        dateType: value.replace(new RegExp(`\\${separatorValue.value}`, 'g'), '-'),
      });
    },
  });

  watch(
    separatorValue,
    async (val) => {
      options.value = (
        typeof defProps.propConfig.options === 'function'
          ? await defProps.propConfig.options(toRaw(defProps.widget))
          : defProps.propConfig.options
      ).map((item) => {
        return {
          value: item.value.replace(/-/g, val),
          label: item.label.replace(/-/g, val),
        };
      });
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped></style>
