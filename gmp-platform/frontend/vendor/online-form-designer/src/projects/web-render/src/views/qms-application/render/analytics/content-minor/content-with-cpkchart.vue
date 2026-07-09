<template>
  <div>
    <DataGrid :showHeader="false" :title="t('统计值')" :dataSource="statisticsData" />
    <DataGrid :showHeader="false" :title="t('常量')" :dataSource="constantData" class="mt-[-4px]" />
  </div>
  <DataGrid :showHeader="false" :title="t('计算值')" :dataSource="calculatedData" />
  <DataGrid :showHeader="false" :title="t('工序能力(组内)')" :dataSource="processCapabilityData" />
  <DataGrid
    :showHeader="false"
    :title="t('工序能力(整体)')"
    :dataSource="processCapabilityOverallData"
  />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { camelCase } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DataGrid from '../../../components/data-grid/data-grid.vue';
  import {
    statisticsFields,
    constantFields,
    calculatedFields,
    processCapabilityFields,
    processCapabilityOverallFields,
  } from '../../../constants/measureColumns';

  const defProps = defineProps<{
    analyticsData: any;
  }>();

  const { t } = useI18n();

  const computeResult = computed(() => defProps.analyticsData?.computeResult ?? {});
  const planData = computed(() => defProps.analyticsData?.plan ?? {});

  const statisticsData = computed(() => {
    return getIndicatorData(statisticsFields);
  });

  const constantData = computed(() => {
    return [
      ...getIndicatorData(constantFields),
      {
        name: t(`sys.kit.qms.indicator.${camelCase('subgroup_size_')}`),
        value: planData.value?.subgroup_size_,
      },
    ];
  });

  const calculatedData = computed(() => {
    return getIndicatorData(calculatedFields);
  });

  const processCapabilityData = computed(() => {
    return getIndicatorData(processCapabilityFields);
  });

  const processCapabilityOverallData = computed(() => {
    return getIndicatorData(processCapabilityOverallFields);
  });

  function getIndicatorData(indicatorFields: string[]) {
    return indicatorFields.map((it) => {
      return {
        name: t(`sys.kit.qms.indicator.${camelCase(it)}`),
        value: computeResult.value[it],
      };
    });
  }
</script>
