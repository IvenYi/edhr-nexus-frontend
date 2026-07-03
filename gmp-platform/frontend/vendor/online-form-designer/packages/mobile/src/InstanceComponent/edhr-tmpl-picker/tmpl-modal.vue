<template>
  <van-popup
    :closeable="false"
    v-model:show="showPopup"
    destroy-on-close
    position="right"
    style="height: 100%"
    :teleport="teleport"
    :style="{
      width: '800px',
    }"
    @closed="cancel"
  >
    <div class="popup-container">
      <div class="popup-title ks-row-middle pl-16px pr-10px">
        <div class="ks-col ell">{{ title }}</div>
        <div class="px-2 py-1 text-[#a6a6a6] cursor-pointer" @click="cancel">
          <i class="gct-iconfont icon-guanbi-Paddanchuang"></i>
        </div>
      </div>
      <div class="ks-col relative px16px pt16px bg-[#F7F8FA]">
        <div class="px16px pt16px bg-white rounded-8px h100% ks-row flex-col">
          <div class="mb16px ks-row-middle">
            <van-field
              class="rounded-100px"
              :model-value="searchValue"
              placeholder="搜索"
              style="padding: 6px 8px 6px 14px; background-color: #f4f5f7"
              :clearable="true"
              @update:model-value="handleSearchChange"
            >
              <template #left-icon>
                <i class="iconfont icon-sousuoMedpro mr6px text-[12px] lh-14px"></i>
              </template>
            </van-field>

            <treeSelect
              :treeData="categoryList"
              @change="handleCategoryChange"
              :modelValue="selectCategory.id"
            >
              <div class="primary-color text-16px text-right ell w160px ml6px">
                {{ selectCategory.name || '全部分类' }}
                <span class="iconfont icon-arrow_down_pad"></span>
              </div>
            </treeSelect>
          </div>
          <div class="ks-col">
            <vxe-table
              :loading="reload"
              max-height="100%"
              ref="tableRef"
              show-overflow
              :data="tableData"
              min-height="88"
              :tree-config="{}"
              :row-config="{ isHover: true, keyField: 'id', height: 44 }"
              :radio-config="{
                highlight: true,
                trigger: 'row',
                reserve: true,
                checkRowKey,
              }"
              @radio-change="radioChangeEvent"
              @scroll="scrollTable"
            >
              <vxe-column :show-overflow="false" type="radio" width="40" :resizable="false" />
              <vxe-column field="name" :title="$t('sys.name')" show-overflow tree-node>
                <template #default="{ row }">
                  <div class="ks-row">
                    <div class="gct-text-overflow">{{ row.version || row.name }}</div>
                    <div v-if="row.default" class="gct-custom-tag ml4px">{{
                      $t('sys.default')
                    }}</div>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="description" :title="$t('sys.description')" show-overflow>
                <template #default="{ row }">
                  {{ row.description || '--' }}
                </template>
              </vxe-column>
              <vxe-column
                field="modifyUserName"
                :title="$t('sys.appDesigner.modifier')"
                width="100"
                show-overflow
              />
              <vxe-column
                field="modifyTime"
                :title="$t('sys.appDesigner.modificationTime')"
                width="170"
              />
              <template #empty>
                <div class="h200px flex justify-center items-center flex-col">
                  <img :src="simpleImage" />
                  <div class="mt8px">暂无数据</div>
                </div>
              </template>
            </vxe-table>
          </div>
        </div>
      </div>
      <div class="flex-shrink-0 flex items-center px-4 py-3">
        <van-button class="flex-shrink-0 w-32 h-10" @click="cancel">取消</van-button>
        <van-button
          type="primary"
          class="ml-3! w-full h-10"
          :disabled="!selectedVal"
          @click="submit"
        >
          确认
        </van-button>
      </div>
    </div>
  </van-popup>
</template>
<script setup lang="ts">
  import { nextTick, onMounted, ref, computed, watch } from 'vue';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';
  import { useTableReload } from './hook';
  import simpleImage from '/@/assets/svg/pic_nodata.svg';
  import treeSelect from '@mobile/components/tree-select.vue';
  import { CategoryModuleEnum } from '@gct/runtime';

  const { teleport } = usePadTeleport();
  const props = defineProps<{
    title: string;
    destroyVm: Function;
    moduleType: CategoryModuleEnum;
    /**
     * 是否引用版本
     */
    rdoVersion: boolean;
    isControlled?: boolean;
  }>();
  const { moduleType, rdoVersion, isControlled } = props;
  const tableRef = ref();
  const {
    tableData,
    radioChangeEvent,
    selectedVal,
    searchValue,
    categoryList,
    selectCategory,
    getSourceData,
    pageNo,
    scrollTable,
    reload,
  } = useTableReload({ tableRef, moduleType, isControlled });
  const checkRowKey = ref();
  const showPopup = ref(false);
  const resolveCallback = ref(null);
  function openPicker(id?: string) {
    if (id) {
      checkRowKey.value = id.split(':')[1] || id.split(':')[0];
    }
    showPopup.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  }
  function submit() {
    cancel();
    if (rdoVersion && selectedVal.value.children?.length) {
      const row = selectedVal.value.children.find((i) => i.default);
      resolveCallback.value && resolveCallback.value(row);
    } else {
      resolveCallback.value && resolveCallback.value(selectedVal.value);
    }
  }
  function cancel() {
    showPopup.value = false;
    props.destroyVm && props.destroyVm();
  }
  function handleCategoryChange(node) {
    selectCategory.value = node.option;
    pageNo.value = 1;
    tableData.value = [];
    getSourceData();
  }
  function handleSearchChange(val) {
    console.log('handleSearchChange', val);
    searchValue.value = val;
    pageNo.value = 1;
    tableData.value = [];
    getSourceData();
  }

  defineExpose({ openPicker });
</script>
<style lang="less" scoped>
  :deep(.vxe-table--render-default .vxe-cell) {
    padding-right: 16px;
    padding-left: 16px;
  }

  .popup-title {
    height: 56px;
    border-bottom: 1px solid #e0e3eb;
    color: #1a1d23;
    font-size: 17px;
    font-weight: 600;
  }

  .popup-container {
    display: flex;
    position: absolute;
    top: 0;
    bottom: 0;
    flex-direction: column;
    width: 100%;
  }
</style>
