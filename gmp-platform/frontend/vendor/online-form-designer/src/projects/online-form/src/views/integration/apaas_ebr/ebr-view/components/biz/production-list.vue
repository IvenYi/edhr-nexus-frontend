<template>
  <Scrollbar>
    <div v-if="!isEmptyData" class="production-list">
      <sub-module-list
        :subModuleList="[
          ESubCategoryEnum.APPENDIX_FORM,
          ESubCategoryEnum.TXN_FORM,
          ESubCategoryEnum.REWORK_FORM,
        ]"
      >
        <template #appendix_content v-if="productionData.appendixList?.length">
          <form-list
            :sourceList="productionData.appendixList"
            :selectedId="selectSelfInfo?.id"
            @select="(row) => handleSelect(row, ESubCategoryEnum.APPENDIX_FORM)"
          />
        </template>
        <template #txn_content v-if="productionData.txnList?.length">
          <form-list
            :sourceList="productionData.txnList"
            :selectedId="selectSelfInfo?.id"
            @select="(row) => handleSelect(row, ESubCategoryEnum.TXN_FORM)"
          />
        </template>
        <template #rework_content v-if="productionData.reworkList?.length">
          <form-list
            :sourceList="productionData.reworkList"
            :selectedId="selectSelfInfo?.id"
            @select="(row) => handleSelect(row, ESubCategoryEnum.REWORK_FORM)"
          />
        </template>
      </sub-module-list>
    </div>
    <div v-else class="nocode-common-loading-warp">
      <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </Scrollbar>
</template>

<script setup lang="ts" name="biz-production-list">
  import { computed } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import FormList from '../form-list.vue';
  import SubModuleList from '../sub-module-list.vue';
  import { ESubCategoryEnum } from '../../enums';
  import { Empty } from 'ant-design-vue';

  const props = defineProps<{
    productionData: any;
    subCategory?: ESubCategoryEnum;
    selectSelfInfo?: any;
  }>();

  const emit = defineEmits<{
    (e: 'select', data: any, subCategory: ESubCategoryEnum): void;
  }>();

  const productionData = computed(() => {
    return props.productionData;
  });

  const isEmptyData = computed(() => {
    return (
      !productionData.value ||
      (productionData.value?.appendixList?.length === 0 &&
        productionData.value?.reworkList?.length === 0 &&
        productionData.value?.txnList?.length === 0)
    );
  });

  function handleSelect(data, subCategory) {
    emit('select', data, subCategory);
  }
</script>

<style lang="less" scoped>
  .production-list {
    padding: 12px 8px;
  }
</style>
