<template>
  <field :widget="comWidget" :rowValue="rowValue" :index="index" />
</template>

<script setup lang="ts">
  import { ColumnTable, FormulaTable } from '/@page-designer/types/web';
  import field from './field.vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { reactive, onMounted } from 'vue';

  // const { t } = useI18n();
  const props = defineProps<{
    widget: ColumnTable | FormulaTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();
  const comWidget = reactive(props.widget);
  onMounted(() => {
    /**应用国际化 */
    if (comWidget.i18n) {
      let i18n = comWidget.i18n;
      for (let k in i18n) {
        let i18nKey = i18n[k];
        i18nKey && (comWidget.props[k] = $t(i18nKey));
      }
    }
  });
</script>
<style scoped lang="less"></style>
