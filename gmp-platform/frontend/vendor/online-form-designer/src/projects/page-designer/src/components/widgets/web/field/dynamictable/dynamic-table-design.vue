<template>
  <div>
    <div class="ks-row-middle mb5px">
      <div class="mr10px w-full flex" v-if="displayLabelText">
        <span class="required-gct" v-show="required">*</span>
        <span class="sub-table-title">
          <span> {{ widget.props.label || globFieldInfo.label }}</span>
          <info-circle-outlined class="ml5px explain-icon" v-if="!!showExplain" />
        </span>
      </div>
      <DesignTableButtons
        reverse
        class="ks-col"
        :buttons="btnGroupWidget.children"
        :parentWidget="widget"
        :visibleButtons="btnGroupWidget.visibleButtons"
      >
        <template #renderActions="args">
          <slot v-bind="args"></slot>
        </template>
      </DesignTableButtons>
    </div>
    <vxeRefTable
      :datasource="[{ index: 1 }]"
      :columns="tableColumns"
      :operateColumn="operateColumn"
      :tableWidget="(widget as DynamicTable)"
      :editMethods="editMethods"
      :serialNumber="serialNumber"
      :editMode="editMode"
      v-if="tableColumns.length"
    >
      <template #renderActions="args">
        <slot v-bind="args"></slot>
      </template>
    </vxeRefTable>
    <div class="p10px h100px ks-row-center-middle bg-[#f9f9f9]" v-else>
      <span class="text-[#bfbfbf] text-16px"> {{ t('sys.pageDesigner.selectModelFields') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-dynamic-table">
  import { computed, inject, toRefs, toRef } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { SCOPE } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { DynamicTable } from '/@/projects/page-designer/src/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAsyncFieldConfig } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import { transformButtons } from './components/transform';
  import {
    vxeRefTable,
    DesignTableButtons,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeDesignTable';
  const { t } = useI18n();
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const props = defineProps(widgetProps);
  const { setSelectedWidget, selectedWidget } = useSelectedWidget();
  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { serialNumber, editMethods, editMode, displayLabelText, required,showExplain } = toRefs(
    props.widget.props,
  );
  const btnGroupWidget = computed(() => {
    return props.widget.children![2];
  });
  const tableColumns = computed(() => {
    return props.widget.children![3].children;
  });
  const operateColumn = toRef(() => {
    if (props.widget.children![1].children.length) {
      return props.widget.children![1];
    }
  });

  useAsyncFieldConfig(props.widget);

  const { wrapperStyle: btnStyle } = useStyle(btnGroupWidget.value);
  function activeContainer() {
    //**子表 的关联模型传达给按钮组 */
    btnGroupWidget.value.props.model = props.widget.props.bindModelKey;
    setSelectedWidget(btnGroupWidget.value, scope);
  }

  if (btnGroupWidget.value?.props) {
    btnGroupWidget.value.visibleButtons =
      btnGroupWidget.value.visibleButtons || btnGroupWidget.value.props.visibleButtons;
    btnGroupWidget.value.props = undefined;
    btnGroupWidget.value.id = undefined;
    btnGroupWidget.value.key = undefined;
  }
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
    operateColumn.value.id = undefined;
  }
</script>

<style lang="less" scoped>
  .is-selected {
    outline: var(--ant-primary-color) solid 1px;
  }

  :deep(.active) {
    background-color: rgb(13 170 156 / 10%);
  }
</style>
