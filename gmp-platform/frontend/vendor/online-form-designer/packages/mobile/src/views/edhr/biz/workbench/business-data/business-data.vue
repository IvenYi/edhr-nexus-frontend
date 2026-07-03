<template>
  <SectionCard
    :class="['business-data']"
    title="业务数据"
    :empty="isEmpty"
    :loading="loading"
    @refresh="onRefresh"
  >
    <div class="business-data__list">
      <ItemCard
        class="business-data__item"
        v-for="item in CardList"
        :key="item.key"
        :title="item.title"
        :icon="item.icon"
        :bgColor="item.bgColor"
        :sum="sumData[item.key]"
        :unit="item.unit"
      />
    </div>
  </SectionCard>
</template>

<script lang="ts" setup name="business-data">
  import { i18n } from '@mobile/locales/setupI18n';
  import SectionCard from '../layout/section-card.vue';
  import { computed, reactive } from 'vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey as postGeneral } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import ItemCard from './item-card.vue';

  const { t } = i18n.global;

  const loading = ref(false);
  const isEmpty = ref(false);
  const CardList = [
    {
      key: 'goodQtySum',
      title: '我今日报工良品数',
      bgColor: '#B8E69F',
      icon: 'icon-preset:edhr-liangpinshu',
    },
    {
      key: 'notGoodQtySum',
      title: '我今日报工不良品数',
      bgColor: '#F0DFBC',
      icon: 'icon-preset:edhr-buliangpinshu',
    },
    {
      key: 'workHoursSum',
      title: '我今日报工工时',
      bgColor: '#BCD3FD',
      icon: 'icon-preset:edhr-gongshi',
      unit: '小时',
    },
  ];
  const sumData = reactive({
    goodQtySum: 0,
    notGoodQtySum: 0,
    scrapQtySum: 0,
    workHoursSum: 0,
  });
  const getData = async () => {
    loading.value = true;
    const res = await postGeneral(
      {
        modelCategory: 'entity',
        modelKey: 'em_form_report_info',
        bsKey: 'biz_workbench_search',
      },
      {},
    );
    if (res) {
      isEmpty.value = false;
      Object.assign(sumData, res);
    } else {
      isEmpty.value = true;
    }
    loading.value = false;
  };

  onMounted(() => {
    getData();
  });

  const onRefresh = () => {
    getData();
  };
</script>

<style lang="less" scoped>
  .business-data {
    &__list {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: start;
      gap: 8px;
    }

    &__item {
      width: 180px;
      height: 144px;
      cursor: pointer;
      flex-grow: 1;
    }
  }
</style>
