<template>
  <Scrollbar v-if="data.length">
    <FieldDiffCard
      v-for="(item, i) in data"
      :key="i"
      :data="item"
      :class="[selectedValue?.key === item.key && 'selected']"
      @click="item.type !== FieldDiffType.REMOVE && emit('change', item)"
    />
  </Scrollbar>
  <template v-else>
    <div class="empty-data">
      <a-empty :description="$t('sys.noData')" :image="EmptyImg" />
    </div>
  </template>
</template>
<script lang="ts" setup name="field-diff-list">
  import { Scrollbar } from '/@/components/Scrollbar';
  import FieldDiffCard from './field-diff-card.vue';
  import { FieldDiffType } from '../index/types';
  import EmptyImg from '/@/assets/svg/pic_edhr_nodata.svg';

  defineProps<{
    data: any[];
    selectedValue?: any;
  }>();

  const emit = defineEmits<{
    (e: 'change', val: any): void;
  }>();
</script>
<style lang="less" scoped>
  :deep(.scrollbar__view) {
    padding: 0 12px 12px;
  }

  .empty-data {
    display: flex;
    align-items: center;
    justify-content: center;
    :deep(.ant-empty) {
      .ant-empty-image {
        height: 114px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 14px;
        color: #8b8b8b;
      }
    }
  }
</style>
