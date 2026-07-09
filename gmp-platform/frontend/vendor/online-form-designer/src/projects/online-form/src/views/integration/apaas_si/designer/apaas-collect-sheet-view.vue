<template>
  <spread-sheet :loading="loading" :isRecord="isRecord">
    <template #logbookFormConfig>
      <slot name="logbookFormConfig"></slot>
    </template>
  </spread-sheet>
</template>

<script setup lang="ts" name="apaas-collect-sheet-view">
  import SpreadSheet from '/@online-form/views/designer/modules/sheet-view.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { usePrint } from '/@online-form/views/designer/hooks/usePrint';
  import { PlatformEnum } from '@gct/nocode-base';
  import { watch } from 'vue';

  const { initialize, loading } = usePrint();

  const { setPlatformType } = useSpreadSheet();

  const props = defineProps<{
    /** 模板id */
    dataId: string;
    isRecord?: number; // 是否是记录本
  }>();

  setPlatformType(PlatformEnum.INTEGRATION_PAAS_SI);

  watch(
    () => props.dataId,
    async () => {
      initialize(props.dataId);
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less">
  @import url('/@online-form/views/designer/styles/spread-sheet.less');
  @import url('/@online-form/views/designer/styles/dynamic-area.less');
  .designer {
    &__spread-sheet {
      background: #e6e9ef;
    }
  }
</style>
