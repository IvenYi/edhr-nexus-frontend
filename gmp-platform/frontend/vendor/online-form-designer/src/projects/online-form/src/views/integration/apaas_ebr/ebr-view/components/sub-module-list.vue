<template>
  <div class="sub-module-list" v-if="subModuleList?.length">
    <div class="sub-module-list__item" v-for="s in subModuleList" :key="s">
      <div class="sub-module-list__title">{{ $t(`sys.edhr.ebr.subModule.${s}`) }}</div>
      <slot :name="s + '_' + 'content'"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ESubCategoryEnum } from '../enums';

  defineProps<{
    subModuleList: ESubCategoryEnum[];
  }>();
</script>

<style scoped lang="less">
  .sub-module-list {
    &__item {
      margin-bottom: 24px;
    }

    &__title {
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 24px;
      margin-bottom: 8px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 12px;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #a6a6a6;
      }
    }
  }
</style>
