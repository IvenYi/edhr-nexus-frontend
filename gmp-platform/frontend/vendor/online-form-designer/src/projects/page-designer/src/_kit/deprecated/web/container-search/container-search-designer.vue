<template>
  <div
    class="min-h-[48px]"
    :class="{ 'is-empty': !widget.props.model || !showResultFields?.length }"
    :data-placeholder="
      !widget.props.model
        ? t('sys.pageDesigner.selectAssociatedModel')
        : t('sys.kit.selectShowResultFields')
    "
  >
    <div v-if="widget.props.model && showResultFields?.length">
      <div class="flex items-center">
        <label>{{ widget.props.title }}：</label>
        <SelectSearchDesign class="flex-1" :widget="widget" />
      </div>
      <div class="results-field-container mt-2 p-4 grid grid-cols-5 gap-2">
        <div v-for="field in showFields" :key="field.key">
          <span title="field.fieldId">{{ field.name }}: {{ field.key }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="gct-container-search-design">
  import { toRefs, computed } from 'vue';
  import { IContainerSearch } from './schema';
  import SelectSearchDesign from '/@page-designer/components/widgets/web/other/select-search/select-search-design.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps<{ widget: IContainerSearch }>();
  const { showResultFields } = toRefs(defProps.widget.props);

  const showFields = computed(() => {
    return (
      (defProps.widget.props?.form?.children ?? []).map((f) => {
        return {
          name: f.fieldName || f?.props?.label || f?.props?.fieldName,
          key: f?.props?.field,
          fieldId: f?.id,
        };
      }) || []
    );
  });

  console.log(defProps.widget, 'widget:children');
</script>

<style lang="less" scoped>
  .is-empty {
    &::before {
      content: attr(data-placeholder);
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #5d6474;
      font-size: 14px;
      background-color: #fbfbfc;
    }
  }

  .results-field-container {
    background: #f7f8fa;
    border-radius: 4px;
  }
</style>
