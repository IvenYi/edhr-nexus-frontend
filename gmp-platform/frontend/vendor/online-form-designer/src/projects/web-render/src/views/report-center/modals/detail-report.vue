<template>
  <a-drawer
    placement="right"
    v-model:visible="open"
    :bodyStyle="{ padding: 0, background: '#F7F8FA' }"
    :mask="false"
    width="100%"
  >
    <template #closeIcon>
      <div class="color-[#000000] leave">
        <left-outlined />
      </div>
    </template>
    <template #title>
      <div class="text-center font-700">
        {{ t('sys.report.reportDetail') }}
      </div>
    </template>
    <div class="comp-basic-info bg-[#ffffff]">
      <div class="info-content">
        <div class="font-700 mt-12px mb-4px title ell" :title="info?.name">
          {{ info?.name }}
        </div>
        <div class="ell color-[#5A5F6B]" :title="info?.description">
          {{ info?.description }}
        </div>
      </div>
    </div>
    <div class="comp-detail-info">
      <div class="info-content mt-12px bg-[#ffffff]">
        <ReportTable
          v-if="info?.json && open"
          :schema="info?.json"
          :isDesign="false"
          :reportName="info.name"
        />
      </div>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">
  import { ref, watch, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ScrollContainer } from '/@/components/Container';
  import { ReportTable } from '@gct/runtime-web';
  import { getReportInfo } from '/@/apis/gct-apaas/ReportController';

  const props = defineProps<{
    compId: Object;
  }>();
  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const open = ref(false);
  const info = ref();

  watch(
    () => props.compId,
    async (val) => {
      if (val) {
        const res = await getReportInfo({ id: val?.id });
        info.value = {
          ...res,
          json: JSON.parse(res?.runtimeJson),
        };
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  defineExpose({
    open,
  });
</script>

<style lang="less" scoped>
  .comp-basic-info {
    height: 105px;
    display: flex;
    justify-content: center;
    align-items: center;
    .info-content {
      width: 1205px;
      padding: 12px 0;
    }
  }
  .title {
    font-size: 18px;
  }
  .comp-detail-info {
    position: relative;
    display: flex;
    justify-content: center;
    height: calc(100vh - 160px);
    .anchor {
      position: absolute;
      right: calc(50vw - 680px);
      top: 20px;
      line-height: 2;
      .anchor-item {
        padding-left: 8px;
        border-left: 2px solid #ccc;
      }
      .selected {
        color: var(--ant-primary-color);
        border-left: 2px solid var(--ant-primary-color);
      }
    }
    .info-content {
      width: 1205px;
      // padding: 40px;
    }
  }
  .leave {
    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
