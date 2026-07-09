<template>
  <a-popover placement="bottomLeft" overlayClassName="edhr-product-popover">
    <template #content>
      <CardViewRender :id="id" modelKey="em_product" :fetch="getRdoData" />
    </template>
    <span class="primary-gct-hover cursor-pointer">{{ name || '--'}}</span>
  </a-popover>
</template>
<script setup lang="ts">
  import { CardViewRender } from '@gct/runtime-render-web';
  import { gctMemoizeAsync } from '@gct/base';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { transformDataToDict } from '/@page-designer/components/widgets/hooks/utils';

  const props = defineProps<{
    id: string;
    name: string;
  }>();

  const loadModelAsync = gctMemoizeAsync(
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  );
  async function getRdoData() {
    if (!props.id) return;
    const { data = {}, dict = {} } = await loadModelAsync(
      {
        modelKey: 'em_product',
        bsKey: 'rdoGetVersionByRefId',
        modelCategory: 'entity',
      },
      {
        foreignFields: [],
      },
      {
        includeDeleted: 1,
        refId: props.id,
      },
    );
    return transformDataToDict(data, dict);
  }
</script>
<style lang="less">
  .edhr-product-popover .ant-popover-inner-content {
    padding: 0;
  }
</style>
