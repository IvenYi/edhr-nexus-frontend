<template>
  <Scrollbar>
    <div v-if="linkList?.length" class="link-list">
      <div class="content">
        <form-list
          :sourceList="linkList"
          :selectedId="selectSelfInfo?.id"
          @select="(row) => handleSelect(row)"
        />
      </div>
    </div>
    <div v-else class="nocode-common-loading-warp">
      <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </Scrollbar>
</template>

<script setup lang="ts" name="biz-link-list">
  import { computed } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import FormList from '../form-list.vue';
  import { Empty } from 'ant-design-vue';
  import { ESubCategoryEnum } from '../../enums';

  const props = defineProps<{
    linkData: any[];
    selectDocData?: any;
    selectSelfInfo?: any;
  }>();

  const emit = defineEmits<{
    (e: 'select', data: any, subCategory: ESubCategoryEnum): void;
  }>();

  const linkList = computed(() => {
    return props.linkData;
  });

  function handleSelect(data) {
    emit('select', data, ESubCategoryEnum.LINK_FORM);
  }
</script>

<style lang="less" scoped>
  .link-list {
    padding: 12px 8px;
  }
</style>
