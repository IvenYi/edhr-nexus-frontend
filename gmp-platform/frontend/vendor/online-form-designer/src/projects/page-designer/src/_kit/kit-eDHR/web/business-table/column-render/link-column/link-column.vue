<template>
  <span @click="() => handleClick()">
    <table-cell :class="ns.b()" :widget="column" :rowValue="row" :index="rowIndex" />
  </span>
</template>

<script lang="ts" setup name="link-column">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { tableCell } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { IBusinessTable } from '../../schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const { t } = useI18n();
  const ns = useNamespace('link-column');
  const Event = getPageEvent();

  const props = withDefaults(
    defineProps<{
      widget: IBusinessTable;
      column: any;
      row: any;
      rowIndex: number;
    }>(),
    {},
  );

  const handleClick = () => {
    Event.runEventByName(
      'linkColClick',
      props.widget.events,
      props.column,
      props.row,
      props.rowIndex,
    );
  };
</script>

<style lang="scss" scoped>
  $link-column: ();

  @include b(link-column) {
    @include set-component-css-var(link-column, $link-column);

    color: var(--ant-primary-color);
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }
</style>
