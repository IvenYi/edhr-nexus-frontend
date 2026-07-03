<template>
  <GridDesign2 v-if=" childSize.length > 0" v-bind="props">
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
  import ColModal from '../../../web/layout/grid/component/col-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep, merge } from 'lodash-es';
  import { buildShortUUID } from '/@/utils/uuid';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { widget as gridCol } from '/@page-designer/schema/mobile/layout/grid-col';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { GridDesign2 } from './grid-design2';
  import { IModalData } from '@gct/runtime';

  const emit = defineEmits(['deleteOneself']);
  const props = defineProps(widgetProps);
  const { t } = useI18n();

  const { emitCache } = useDesigner();

  const { setSelectedWidget } = useSelectedWidget();

  const childSize = computed(() => {
    return props.widget.children || [];
  });

  onMounted(() => {
  });

  const openModal = async () => {
    const result = await gct.openUtil.modal<IModalData>(
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
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.props.colSpan = (result.data || [])[0].spanArr;
      (result.data || [])[0].spanArr.forEach((e) => {
        const id = buildShortUUID('grid-col');
        // eslint-disable-next-line vue/no-mutating-props
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
