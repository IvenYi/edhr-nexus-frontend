<template>
  <a-row
    v-if="!isNewDesigner"
    :gutter="[widget.props.gutter || 0, 0]"
    class="grid"
    :style="{
      height: widget.style.height ? `${widget.style.height}px` : 'auto',
      overflow: 'auto',
    }"
  >
    <template v-for="(colWidget, colIndex) in widget.children" :key="colWidget.id">
      <grid-col-design
        :widget="colWidget"
        :parent-list="widget.children"
        :index-of-parent-list="colIndex"
        :parent-widget="widget"
      />
    </template>
  </a-row>
  <GridDesign2 v-if="isNewDesigner && childSize.length > 0" v-bind="props">
    <template #container="args">
      <slot name="container" v-bind="args"></slot>
    </template>
    <template #item="args">
      <slot name="item" v-bind="args"></slot>
    </template>
  </GridDesign2>
</template>

<script setup lang="ts" name="gct-grid">
  import { onMounted, nextTick, computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import GridColDesign from './component/grid-col-design.vue';
  import ColModal from './component/col-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep, merge } from 'lodash-es';
  import { buildShortUUID } from '/@/utils/uuid';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { widget as gridCol } from '/@page-designer/schema/web/layout/grid-col';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { GridDesign2 } from './grid-design2';

  const emit = defineEmits(['deleteOneself']);
  const props = defineProps(widgetProps);
  const { t } = useI18n();

  const { emitCache } = useDesigner();
  const { setSelectedWidget } = useSelectedWidget();

  const childSize = computed(() => {
    return props.widget.children || [];
  });

  onMounted(() => {
    if (!props.widget.children?.length) {
      if (props.isNewDesigner) {
        return;
      }
      nextTick(() => {
        openModal();
      });
    }
  });

  const openModal = async () => {
    const result = await gct.openUtil.modal(
      ColModal,
      {},
      {
        title: t('sys.pageDesigner.selectGridStyle'),
        width: 640,
        // height: 702,
        okText: t('sys.okText'),
        showFooter: true,
      },
    );
    if (result.ok) {
      props.widget.props.colSpan = (result.data || [])[0].spanArr;
      (result.data || [])[0].spanArr.forEach((e) => {
        const id = buildShortUUID('grid-col');
        props.widget.children?.push(
          merge(cloneDeep(gridCol), {
            id,
            alias: t('sys.pageDesigner.gridchild'),
            props: { span: e },
          }),
        );
      });

      setSelectedWidget(props.widget);
      emitCache();
    } else {
      emit('deleteOneself');
    }
  };
</script>

<style lang="less" scoped>
  .grid {
    // min-height: 58px;
    // margin-right: 0 !important;
    // margin-left: 0 !important;
    margin: 1px;
    // & > div {
    //   // background-color: #f9f9f9;
    //   // background-color: #fff;
    // }
  }
</style>
