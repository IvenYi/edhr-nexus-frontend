<template>
  <TableActionAuto :class="[ns.b()]" />
</template>

<script lang="ts" setup name="grid-btns">
  import { useNamespace } from '@gct/runtime';

  import { TableActionAuto } from '/@/components/Table';

  const ns = useNamespace('grid-btns');
</script>

<style lang="scss" scoped>
  $grid-btns: ();

  @include b(grid-btns) {
    @include set-component-css-var(grid-btns, $grid-btns);

    // 按钮间隔紧凑
    :deep(.ant-btn.ant-btn-sm) {
      padding: 0;
    }

    // 更多的...图标竖着放
    :deep(.ant-dropdown-trigger) {
      transform: rotate(90deg);
    }
  }
</style>
