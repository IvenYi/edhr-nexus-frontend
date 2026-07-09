<template>
  <BasicGrid
    :class="[ns.b()]"
    :columns="columns"
    :data="data"
    :hasRowEmbed="true"
    height="auto"
    v-model:pagination="_pagination"
    :isExpandAll="isExpandAll"
  >
    <template #row_embed="{ row }">
      <BasicGrid :class="[ns.e('row-grid')]" :columns="embedColumns" :data="row.children">
        <template v-for="(slot, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps"></slot>
        </template>
      </BasicGrid>
    </template>
    <template v-for="(slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </BasicGrid>
</template>

<script lang="ts" setup name="embed-grid">
  import { useNamespace } from '@gct/runtime';
  import BasicGrid from '../basic-grid/basic-grid.vue';
  import { GridColumn } from '../basic-grid';
  import { EmbedGridRowData } from './types';
  import { GridPaginationValue } from '../grid-pagination';
  import { computed } from 'vue';

  const ns = useNamespace('embed-grid');

  const props = withDefaults(
    defineProps<{
      columns: GridColumn[];
      embedColumns: GridColumn[];
      data: EmbedGridRowData[];
      pagination?: GridPaginationValue;
      /** 是否展开所有,每次数据变更的时候 */
      isExpandAll?: boolean;
    }>(),
    {
      isExpandAll: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:pagination', value: GridPaginationValue): void;
  }>();

  // 分页参数
  const _pagination = computed({
    get() {
      return props.pagination;
    },
    set(v) {
      emit('update:pagination', v!);
    },
  });
</script>

<style lang="scss" scoped>
  $embed-grid: ();

  @include b(embed-grid) {
    @include set-component-css-var(embed-grid, $embed-grid);
  }
</style>
