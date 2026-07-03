<template>
  <div>
    <slot name="operator">
      <div class="flex gap-2 justify-end mb-2">
        <gcExportButtonDesign :widget="importWidget" />
        <gcImportButtonDesign :widget="exportWidget" />
      </div>
    </slot>
    <SearchPanel :mode="'design'" :widget="props.widget" />
    <DataTable :mode="'design'" :widget="props.widget" />
  </div>
</template>

<script setup lang="ts" name="gct-eDHR-order-manage-designer">
  import { computed } from 'vue';
  import { IOrderManage } from './schema';
  import SearchPanel from '../components/search-panel.vue';
  import DataTable from './data-table/data-table.vue';
  import gcImportButtonDesign from '../../../../components/widgets/web/other/gc-import-button/gc-import-button-design.vue';
  import gcExportButtonDesign from '../../../../components/widgets/web/other/gc-export-button/gc-export-button-design.vue';

  const props = defineProps<{
    widget: IOrderManage;
  }>();

  const importWidget = computed(() => {
    return {
      id: `gc-import-button${new Date().getTime()}`,
      name: '导入',
      props: {
        title: '导入',
        ...props.widget.props,
      },
    };
  });
  const exportWidget = computed(() => {
    return {
      id: `gc-export-button${new Date().getTime()}`,
      name: '导出',
      props: {
        title: '导出',
        ...props.widget.props,
      },
    };
  });
</script>

<style scoped lang="less"></style>
