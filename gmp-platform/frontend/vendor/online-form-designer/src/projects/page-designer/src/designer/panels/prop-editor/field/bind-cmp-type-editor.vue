<template>
  <a-select v-model:value="propValue" style="width: 100%" size="small">
    <a-select-option v-for="option in options" :value="option.value" :key="option.value">{{
      t(option.label)
    }}</a-select-option>
  </a-select>
</template>

<script setup lang="ts" name="bind-cmp-type-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { Ch_BindCmpStyleEnum, bindCmpStyleMap } from '/@page-designer/enum';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const options = computed(() => {
    const vl =
      typeof defProps.propConfig.bindCmpStyleKey === 'function'
        ? defProps.propConfig.bindCmpStyleKey(defProps.widget)
        : defProps.propConfig.bindCmpStyleKey;

    const keys = bindCmpStyleMap[vl];
    if (keys) {
      return keys
        .filter((item) => {
          if (
            defProps.propConfig.filterOptionsCallback &&
            typeof defProps.propConfig.filterOptionsCallback === 'function'
          ) {
            return defProps.propConfig.filterOptionsCallback(item, defProps.widget);
          }
          return true;
        })
        .map((key) => {
          return {
            label: Ch_BindCmpStyleEnum[key],
            value: key,
          };
        });
    }
    return [];
  });
</script>

<style lang="less" scoped></style>
