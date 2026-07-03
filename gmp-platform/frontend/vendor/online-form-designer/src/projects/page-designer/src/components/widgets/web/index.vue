<template>
  <component :is="defComponet" :widget="widget" :formData="formData">
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </component>
</template>

<script lang="ts" setup>
  import { computed, reactive, onMounted } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { AsyncGctComponents } from '/@page-designer/components/pcModule';
  import { useDependency } from '/@/projects/web-render/src/render/Event/Dependency/useDependency';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData: object;
  }>();

  const comWidget = reactive(props.widget);
  onMounted(() => {
    /**应用国际化 */
    if (comWidget.i18n) {
      let i18n = comWidget.i18n;
      for (let k in i18n) {
        let i18nKey = i18n[k];
        i18nKey && (comWidget.props[k] = t(i18nKey));
      }
    }
  });

  const defComponet = computed(() => {
    if (props.widget && props.widget._plugin) {
      return AsyncGctComponents.getComponentByPluginTag(props.widget._plugin.key);
    }
    return AsyncGctComponents.getComponentByType(props.widget.type);
  });
  useDependency(props.widget, props.formData, true);
</script>
<style lang="less" scoped></style>
