<template>
  <div class="hosted-field-config">
    <a-collapse class="override" v-model:activeKey="activeCollapse" ghost expandIconPosition="right">
      <a-collapse-panel key="2" :header="$t('sys.model.fieldAttr')">
        <form-item :label="$t('sys.bi.fieldType')" :inline="false">
          <span>{{ fieldTypeLabel }}</span>
        </form-item>
        <form-item :label="$t('sys.FieldName')" :inline="false">
          {{ fieldName }}
        </form-item>
        <form-item :label="$t('sys.onlineForm.fieldKey')" :inline="false">
          {{ fieldMeta?.field || '-' }}
        </form-item>
        <form-item :label="$t('sys.dataSet.modelName')" :inline="false">
          <a-breadcrumb v-if="fieldPathChains.length !== 0" separator=">">
            <a-breadcrumb-item v-for="(path, index) of fieldPathChains" :key="index">
              {{ path }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          <span v-else>-</span>
        </form-item>
        <form-item :label="$t('sys.onlineForm.belongModelKey')" :inline="false">
          {{ fieldMeta?.model || '-' }}
        </form-item>
      </a-collapse-panel>
    </a-collapse>

    <a-tabs v-model:activeKey="activeTab" class="field-tabs">
      <a-tab-pane key="tab1" :tab="$t('sys.config')">
        <template v-if="!hiddenSetting">
          <a-collapse
            class="override"
            v-model:activeKey="activeCollapse"
            ghost
            expandIconPosition="right"
          >
            <a-collapse-panel key="3" :header="$t('sys.cardDesign.cfg_form.field_cfg')">
              <HostedCellWidgetProps
                :field-meta="fieldMeta"
                :field-widget="fieldWidget"
                :readonly="readonly"
                :isViewModel="isViewModel"
                :disabled="sheetReadonly"
              />
            </a-collapse-panel>
            <a-collapse-panel key="4" :header="$t('sys.onlineForm.styleConfiguration')">
              <HostedCellWidgetStyle
                :field-meta="fieldMeta"
                :field-widget="fieldWidget"
                :disabled="sheetReadonly"
                :disabledCellSize="disabledCellSize"
              />
            </a-collapse-panel>
          </a-collapse>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import HostedCellWidgetProps from './hosted-cell-widget-props.vue';
  import HostedCellWidgetStyle from './hosted-cell-widget-style.vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { isParamBindField } from '/@online-form/views/designer/hooks/useParam';

  const props = defineProps<{
    fieldMeta: Record<string, any>;
    fieldWidget: Record<string, any>;
  }>();

  const { getFieldMeta } = useModelFields();
  const { doc, designMode, sheetReadonly } = useSpreadSheet();

  const activeCollapse = ref(['1', '2', '3', '4', '5', '6', '7']);
  const activeTab = ref('tab1');

  const fieldInfo = computed(() => getFieldMeta(props.fieldMeta));
  const fieldPathChains = computed(
    () => getFieldMeta(props.fieldMeta, { showFullPath: true, showFieldName: false }).name ?? [],
  );
  const hiddenSetting = computed(() => isParamBindField(props.fieldMeta));
  const readonly = computed(() => designMode.value === 'Print' || Boolean(props.fieldMeta?.isFieldModel));
  const disabledCellSize = computed(
    () => props.fieldMeta?.fieldType === 'image' && props.fieldWidget?.imageDisplayMode === 'ADAPTIVE',
  );
  const isViewModel = computed(() => doc.value.formType === 'VIEW');
  const fieldName = computed(() => fieldInfo.value?.name || '-');
  const fieldTypeLabel = computed(() => {
    const type = props.fieldMeta?.fieldType;
    return type ? $t(`sys.model.${type === 'enum' ? 'ref_enum' : type}`) : '-';
  });
</script>

<style lang="less" scoped>
  .hosted-field-config {
    .field-tabs {
      :deep(.ant-tabs-nav) {
        margin-bottom: 0;
        padding-left: 12px;
        border-top: 1px solid #e0e3ea;

        &::before {
          border-bottom: none;
        }
      }
    }
  }
</style>
