<template>
  <a-collapse class="override" v-model:activeKey="activeCollapse" ghost expandIconPosition="right">
    <a-collapse-panel key="2" :header="$t('sys.model.fieldAttr')">
      <form-item :label="$t('sys.bi.fieldType')" :inline="false">
        <div class="flex items-center leading-none field-name-area">
          <i class="iconfont mr-8px" :class="getFieldIcon(fieldMeta.fieldType!)"></i>
          <span>{{
            $t(`sys.model.${fieldMeta.fieldType! === 'enum' ? 'ref_enum' : fieldMeta.fieldType!}`)
          }}</span>
        </div>
      </form-item>
      <form-item :label="$t('sys.FieldName')" :inline="false">
        {{ fieldName }}
        <i
          v-if="showFieldEdit"
          :title="$t('sys.model.editField')"
          :onClick="onEdit"
          class="field-edit iconfont icon-bianji"
        ></i>
      </form-item>
      <form-item :label="$t('sys.onlineForm.fieldKey')" :inline="false">
        {{ fieldMeta?.field }}
      </form-item>

      <form-item :label="$t('sys.dataSet.modelName')" :inline="false">
        <a-breadcrumb v-if="fieldPathChains.length !== 0" separator=">">
          <a-breadcrumb-item v-for="(path, index) of fieldPathChains" :key="index">{{
            path
          }}</a-breadcrumb-item>
        </a-breadcrumb>
      </form-item>

      <form-item :label="$t('sys.onlineForm.belongModelKey')" :inline="false">
        {{ fieldMeta.model }}
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
            <CellWidgetProps
              :field-meta="fieldMeta"
              :field-widget="fieldWidget!"
              :readonly="readonly"
              :isViewModel="isViewModel"
              :disabled="sheetReadonly"
            />
          </a-collapse-panel>
          <a-collapse-panel key="4" :header="$t('sys.onlineForm.styleConfiguration')">
            <CellWidgetStyle
              :field-meta="fieldMeta"
              :field-widget="fieldWidget!"
              :disabled="sheetReadonly"
              :disabledCellSize="disabledCellSize"
            />
          </a-collapse-panel>
        </a-collapse>
      </template>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { DesignMode } from '/@online-form/views/designer/enums';
  import { FormTypeEnum, ImageDisplayModeEnum } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import CellWidgetProps from '/@online-form/views/__cell_widgets__/cell-widget-props.vue';
  import CellWidgetStyle from '/@online-form/views/__cell_widgets__/cell-widget-style.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { isParamBindField } from '/@online-form/views/designer/hooks/useParam';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useReverseModeling } from '../../hooks/reverse-modeling';
  import { FIELD_TYPE } from '@gct/runtime';

  const { getFieldMeta } = useModelFields();

  const { doc, designMode, sheetReadonly, editField, isEasyEdition } = useSpreadSheet();

  const { isPresetField } = useReverseModeling();

  const activeCollapse = ref(['1', '2', '3', '4', '5', '6', '7']);
  const activeTab = ref('tab1');

  const props = defineProps<{
    fieldMeta: IBindField;
    fieldWidget: CellWidget.BasicSchema;
  }>();

  const fieldPathChains = computed(() => {
    return getFieldMeta(props.fieldMeta, { showFullPath: true, showFieldName: false }).name ?? [];
  });

  const hiddenSetting = computed(() => {
    return isParamBindField(props.fieldMeta);
  });
  const readonly = computed(() => {
    console.log('readonly-----', props);
    if (designMode.value === DesignMode.Print) {
      return true;
    }
    if (props.fieldMeta.isFieldModel) {
      return true;
    }
    return false;
  });

  const disabledCellSize = computed(() => {
    return (
      props.fieldMeta.fieldType === FIELD_TYPE.IMAGE &&
      props.fieldWidget.imageDisplayMode === ImageDisplayModeEnum.ADAPTIVE
    );
  });

  const isViewModel = computed(() => {
    return doc.value.formType === FormTypeEnum.VIEW;
  });

  const fieldName = computed(() => {
    return getFieldMeta(props.fieldMeta).name;
  });

  const showFieldEdit = computed(() => {
    return (
      isEasyEdition.value &&
      !isPresetField({ key: props.fieldMeta.field!, modelKey: props.fieldMeta.model! })
    );
  });

  const availableTabs = computed(() => {
    const tabs: string[] = ['tab1'];
    return tabs;
  });

  watch(
    [availableTabs, activeTab],
    ([tabs, currentTab]) => {
      if (!tabs.includes(currentTab)) {
        activeTab.value = tabs[0];
      }
    },
    { immediate: true },
  );

  const onEdit = () => {
    editField({ fieldKey: props.fieldMeta.field!, modelKey: props.fieldMeta.model! });
  };
</script>

<style lang="less" scoped>
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

  .field-name-area {
    .iconfont {
      color: var(--ant-primary-color);
    }
  }

  .field-edit {
    margin-top: -3px;
    float: right;
    cursor: pointer;
  }
</style>
