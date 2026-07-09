<template>
  <Scrollbar>
    <div v-if="inspectionList?.length" class="inspection-list">
      <a-collapse
        :bordered="false"
        expandIconPosition="right"
        ghost
        v-model:activeKey="activeKey"
        class="inspection-collapse-inner"
      >
        <template #expandIcon="{ isActive }">
          <i v-if="isActive" class="iconfont collapse-icon icon-pad_arrow_up"></i>
          <i v-else class="iconfont collapse-icon icon-pad_arrow_down"></i>
        </template>

        <a-collapse-panel v-for="(item, idx) in inspectionList" :key="idx">
          <template #header>
            <div class="header-title-content">
              <img :src="folderIcon" alt="" class="header-icon mr-2" />
              <span class="title" :title="item.txnDefinitionName">
                {{ item.txnDefinitionName }}
              </span>
            </div>
          </template>

          <div class="content">
            <sub-module-list
              :subModuleList="[
                ESubCategoryEnum.INSPECTION_FORM,
                ESubCategoryEnum.APPENDIX_FORM,
                ESubCategoryEnum.TXN_FORM,
              ]"
            >
              <template #inspection_content>
                <form-list
                  :sourceList="item.formList"
                  :selectedId="selectDocData?.id"
                  @select="(row) => handleSelect(row, ESubCategoryEnum.INSPECTION_FORM)"
                >
                  <template #prefix="{ data }">
                    <img
                      class="doc-icon"
                      :src="InstanceStatusIconMap[data.instanceStatus]"
                      alt=""
                    />
                  </template>
                  <template #suffix="{ data }">
                    <i
                      v-if="isSuitableForm(data)"
                      class="iconfont icon-Frame"
                      :title="$t('sys.edhr.instList')"
                      @click="onOpenInstance(data)"
                    ></i>
                    <i v-else></i>
                  </template>
                </form-list>
              </template>
              <template #appendix_content>
                <form-list
                  :sourceList="item.appendixList"
                  :selectedId="selectSelfInfo?.id"
                  @select="(row) => handleSelect(row, ESubCategoryEnum.APPENDIX_FORM)"
                />
              </template>
              <template #txn_content>
                <form-list
                  :sourceList="item.txnList"
                  :selectedId="selectSelfInfo?.id"
                  @select="(row) => handleSelect(row, ESubCategoryEnum.TXN_FORM)"
                />
              </template>
            </sub-module-list>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div v-else class="nocode-common-loading-warp">
      <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </Scrollbar>
</template>

<script setup lang="ts" name="biz-inspection-list">
  import { computed, ref } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { InstanceStatusIconMap } from '../../../utils/instance-status/instance-status-icons';
  import FormList from '../form-list.vue';
  import SubModuleList from '../sub-module-list.vue';
  import { ESubCategoryEnum } from '../../enums';
  import { Empty } from 'ant-design-vue';
  import folderIcon from '/@/assets/icons/edhr/icon_folder.svg';
  import { FormTypeEnum } from '@gct/nocode-base';

  const props = defineProps<{
    inspectionData: any[];
    subCategory?: ESubCategoryEnum;
    selectDocData?: any;
    selectSelfInfo?: any;
  }>();

  const emit = defineEmits<{
    (e: 'select', data: any, subCategory: ESubCategoryEnum): void;
    (e: 'openInstance', data: any): void;
  }>();

  const activeKey = ref(0);

  const isSuitableForm = (item) => {
    return [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(item.formType);
  };

  const inspectionList = computed(() => {
    return props.inspectionData;
  });

  function handleSelect(data, subCategory) {
    emit('select', data, subCategory);
  }

  function onOpenInstance(data) {
    emit('openInstance', data);
  }
</script>

<style lang="less" scoped>
  .inspection-collapse-inner {
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
  }
</style>
