<template>
  <div class="flex items-center w100% empty justify-center h100% position-relative">
    <span v-if="isDesign" class="empty-title">结果预览</span>
    <div class="flex flex-col items-center">
      <img
        v-if="isDesign"
        :src="chartTypeImg[props.reportType]"
        style="width: 250px"
        class="type-item"
      />
      <img v-else :src="chartTypePreImg[props.reportType]" style="width: 250px" class="type-item" />
      <div class="color-[#A6A6A6] mt-20px">
        {{
          !isDesign
            ? '缺少维度和度量'
            : props.reportType === 'crossTable'
            ? ' 当前报表建议：至少 1 个行（维度）或列（维度）或指标（度量）'
            : ' 当前报表建议：至少 1 个列/行（维度或度量）'
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { chartTypeImg, chartTypePreImg } from '/@web-render/views/report-center/constant/chart';

  const props = defineProps<{
    reportType: string;
    isDesign: boolean;
  }>();
</script>
<style lang="scss" scoped>
  .empty {
    background: #f9fafb;
  }
  .empty-title {
    position: absolute;
    left: 16px;
    top: 32px;
  }
</style>
