<template>
  <spread-sheet :loading="loading" />
</template>

<script setup lang="ts" name="apaas-dp-print-sheet-view">
  import SpreadSheet from '/@online-form/views/designer/modules/sheet-view.vue';
  import { usePrint } from '/@online-form/views/designer/hooks/usePrint';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PlatformEnum } from '@gct/nocode-base';
  import { watch } from 'vue';

  const props = defineProps<{
    dataId: string;
    model?: string;
  }>();

  const { setPlatformType } = useSpreadSheet();

  setPlatformType(PlatformEnum.INTEGRATION_PAAS_DP);

  const { initialize, loading } = usePrint();

  watch(
    () => props.dataId,
    async () => {
      initialize(props.dataId, undefined, undefined, undefined, props.model);
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
