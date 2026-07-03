<template>
  <van-popover @open="open" placement="bottom-start">
    <van-cell-group inset class="w400px gct-info py8px">
      <van-cell :border="false" title-class="w75px flex-none!" value-class="text-left!">
        <template #title> 产品编码: </template>
        <template #value>{{ productCode }} </template>
      </van-cell>
      <van-cell :border="false" title-class="w75px flex-none!" value-class="text-left!">
        <template #title> 产品名称: </template>
        <template #value>{{ productInfo.product_name_ }} </template>
      </van-cell>
      <van-cell :border="false" title-class="w75px flex-none!" value-class="text-left!">
        <template #title> 规格型号: </template>
        <template #value>{{ productInfo.product_spec_ }} </template>
      </van-cell>
      <van-cell :border="false" title-class="w75px flex-none!" value-class="text-left!">
        <template #title> 产品家族: </template>
        <template #value>{{ productInfo.product_family }} </template>
      </van-cell>
      <van-cell :border="false" title-class="w75px flex-none!" value-class="text-left!">
        <template #title> 单位: </template>
        <template #value> {{ productInfo.uom_id_ }} </template>
      </van-cell>
      <van-cell :border="false" title-class="w75px flex-none!" value-class="text-left!">
        <template #title> 描述: </template>
        <template #value> {{ productInfo.description_ }} </template>
      </van-cell>
    </van-cell-group>
    <template #reference>
      <slot></slot>
    </template>
  </van-popover>
</template>

<script setup lang="ts">
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { ref, onMounted, reactive, computed } from 'vue';
  import { getTranslateValue } from '@mobile/utils/translate';

  const props = defineProps<{
    productId: string;
    productCode: string;
  }>();

  const productInfo = reactive<any>({});
  function open() {
    getProduceRdoInfo(props.productId);
  }

  async function getProduceRdoInfo(refId: string) {
    if (!refId) return;
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_product',
        bsKey: 'rdoGetVersionByRefId',
      },
      {
        foreignFields: [],
      },
      {
        includeDeleted: 1,
        refId,
      },
    );
    productInfo.product_name_ = res.data.name_;
    productInfo.product_spec_ = res.data.spec_;
    productInfo.product_family = getTranslateValue(res, 'product_family_id_') || '-';
    productInfo.description_ = res.data.description_ || '-';
    productInfo.uom_id_ = getTranslateValue(res, 'uom_id_') || '-';
  }
</script>
<style scoped lang="less">
  .gct-info {
    --van-cell-font-size: 16px;
    --van-cell-value-font-size: 16px;
    --van-cell-text-color: #5a5f6b;
    --van-cell-value-color: #1a1d23;
    --van-cell-vertical-padding: 8px;
  }
</style>
