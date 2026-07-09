<template>
  <Scrollbar>
    <div v-if="releaseList?.length" class="release-list">
      <a-collapse
        :bordered="false"
        expandIconPosition="right"
        ghost
        v-model:activeKey="activeKey"
        class="release-collapse-inner"
      >
        <template #expandIcon="{ isActive }">
          <i v-if="isActive" class="iconfont collapse-icon icon-pad_arrow_up"></i>
          <i v-else class="iconfont collapse-icon icon-pad_arrow_down"></i>
        </template>

        <a-collapse-panel v-for="(item, idx) in releaseList" :key="idx">
          <template #header>
            <div class="header-title-content">
              <img :src="folderIcon" alt="" class="header-icon mr-2" />
              <span class="title" :title="item.txnDefinitionName">
                {{ item.txnDefinitionName }}
              </span>
            </div>
          </template>

          <div class="content">
            <form-list
              :sourceList="item.formList"
              :selectedId="selectSelfInfo?.id"
              @select="(row) => handleSelect(row)"
            />
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div v-else class="nocode-common-loading-warp">
      <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </Scrollbar>
</template>

<script setup lang="ts" name="biz-release-list">
  import { computed, ref } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import FormList from '../form-list.vue';
  import { Empty } from 'ant-design-vue';
  import folderIcon from '/@/assets/icons/edhr/icon_folder.svg';
  import { ESubCategoryEnum } from '../../enums';

  const props = defineProps<{
    releaseData: any[];
    selectDocData?: any;
    selectSelfInfo?: any;
  }>();

  const emit = defineEmits<{
    (e: 'select', data: any, subCategory: ESubCategoryEnum): void;
  }>();

  const activeKey = ref(0);

  const releaseList = computed(() => {
    return props.releaseData;
  });

  function handleSelect(data) {
    emit('select', data, ESubCategoryEnum.RELEASE_FORM);
  }
</script>

<style lang="less" scoped>
  .release-collapse-inner {
    .header-title-content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    :deep(.ant-collapse-header) {
      padding: 8px 16px;
      background-color: #f9fafb;
      border-top: 1px solid #e8e8e8;
      border-bottom: 1px solid #e8e8e8;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    :deep(.ant-collapse-content-box) {
      padding: 12px 8px;
    }

    :deep(.content-item) {
      padding-left: 8px;
    }
  }
</style>
