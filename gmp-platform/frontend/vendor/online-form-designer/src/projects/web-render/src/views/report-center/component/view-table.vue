<template>
  <div class="px16px">
    <BasicTable
      :dataSource="tableData"
      :columns="viewcolumns"
      :striped="false"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'name'">
          <a @click="toDetail(record)">
            <IconNext :color="themeSetting.themeColor" :value="returnIconType(record)" :size="15" />
            {{ record.name }}
          </a>
        </template>
      </template>
    </BasicTable>
  </div>
  <DetailReport ref="detailRef" :compId="detail" />
</template>

<script setup lang="ts" name="view-table">
  import { ref, reactive, onMounted, computed, unref } from 'vue';
  import { viewcolumns } from '../constant/settings';
  import { BasicTable } from '/@/components/Table';
  import { chartType } from '../constant/chart';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import DetailReport from '../modals/detail-report.vue';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  const props = defineProps<{ tableData?: any; pagination: any }>();
  const { themeSetting } = useThemeSetting();

  const emit = defineEmits(['reload']);
  onMounted(() => {});
  const detailRef = ref();

  const detail = ref();
  // 表格类型图标
  const returnIconType = (option) => {
    if (!option) return {};
    const { reportType } = option;
    let icon;
    if (reportType === chartType.CROSS_TABLE) {
      icon = 'icon-jiaochabiao';
    } else if (reportType === chartType.SCHEDULE_TABLE) {
      icon = 'icon-a-biaoge_table-file4';
    } else {
      icon = '';
    }
    return icon;
  };

  const handleTableChange = (paginationInfo) => {
    emit('reload', paginationInfo);
  };

  const toDetail = (record) => {
    detail.value = record;
    detailRef.value.open = true;
  };
</script>

<style lang="scss" scoped></style>
