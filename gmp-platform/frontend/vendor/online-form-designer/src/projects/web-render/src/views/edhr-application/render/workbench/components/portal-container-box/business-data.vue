<template>
  <CardBox :cardExtraProps="{ title: compTitle, style: { height: '100%' } }">
    <template #card-body>
      <a-spin :spinning="loading" size="default" :wrapperClassName="`${prefixCls}__loading-wrap`">
        <div v-if="hasData" class="data-container">
          <div class="data-item" v-for="info in dataList" :key="info.key">
            <div class="data-item-icon" :style="{ background: getItemColor(info.key) }">
              <IconNext :value="info.icon" color="#1A1D23" :size="18" />
            </div>
            <div class="data-item-content">
              <div class="data-item-value">
                {{ info.value
                }}<span v-if="info.key === 'workHoursSum'">{{
                  $t('sys.edhr.dashboard.hours')
                }}</span>
              </div>
              <div class="data-item-title ell" :title="info.title">{{ info.title }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-data scroll-wrap empty-wrap">
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin: 0" />
        </div>
      </a-spin>
    </template>
  </CardBox>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Empty } from 'ant-design-vue';
  import CardBox from './card-box.vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { IconNext } from '/@/components/Icon';

  const { prefixCls } = useDesign('business-data');

  interface Props {
    /** 组件标题 */
    compTitle: string;
  }
  defineProps<Props>();

  const dataList = ref([
    {
      key: 'goodQtySum',
      value: 0,
      title: $t('sys.edhr.dashboard.myReportGoodQty'),
      icon: 'icon-preset:edhr-liangpinshu',
    },
    {
      key: 'notGoodQtySum',
      value: 0,
      title: $t('sys.edhr.dashboard.myReportNotGoodQty'),
      icon: 'icon-preset:edhr-buliangpinshu',
    },
    // { key: 'scrapQtySum', value: 0, title: '我今日报废数', icon: 'icon-preset:edhr-baofeishu' },
    {
      key: 'workHoursSum',
      value: 0,
      title: $t('sys.edhr.dashboard.myReportWorkingHours'),
      icon: 'icon-preset:edhr-gongshi',
    },
  ]);

  const loading = ref(false);

  const hasData = ref(false);

  const getItemColor = (key: string) => {
    switch (key) {
      case 'goodQtySum':
        return '#95DE64'; // 绿色
      case 'notGoodQtySum':
        return '#FFB84D'; // 黄色
      case 'scrapQtySum':
        return '#FF7C7C'; // 红色
      case 'workHoursSum':
        return '#C3B6FF'; // 紫色
      default:
        return '#eee';
    }
  };

  onMounted(async () => {
    loading.value = true;
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_form_report_info',
        bsKey: 'biz_workbench_search',
      },
      {},
    );
    if (res) {
      hasData.value = true;
      Object.keys(res).forEach((key) => {
        const item = dataList.value.find((item) => item.key === key);
        if (item) {
          item.value = res[key];
        }
      });
    } else {
      hasData.value = false;
    }
    loading.value = false;
  });
</script>

<style scoped lang="less">
  @prefix-cls: ~'@{namespace}-business-data';

  .@{prefix-cls} {
    &__loading-wrap {
      width: 100%;
      height: 100%;

      .ant-spin-container {
        padding: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
  .data-container {
    display: flex;
    gap: 16px;
    background: #fff;
    border-radius: 8px;

    .data-item {
      display: flex;
      align-items: center;
      flex: 1;
      height: 84px;
      min-width: 0; /* Allow the item to shrink */
      border: 1px solid #e8ebf0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      padding: 12px;

      .data-item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        color: #fff;
        font-size: 20px;
        border-radius: 4px;
      }

      .data-item-content {
        margin-left: 16px;
        flex: 1;
        overflow: hidden;

        .data-item-value {
          font-size: 24px;
          line-height: 1.25;
          font-weight: 500;
          color: #1a1d23;

          span {
            font-size: 14px;
          }
        }

        .data-item-title {
          font-weight: 400;
          font-size: 14px;
          color: #1a1d23;
        }
      }
    }
  }
  .empty-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
