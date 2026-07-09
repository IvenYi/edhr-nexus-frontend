<template>
  <basic-popup
    v-model:show="show"
    :title="`选择${produceLabel}`"
    :popup-props="popupProps"
    :extraStyle="{ width: '480px' }"
    class="operation-selector-popup"
  >
    <van-search
      class="search-bar"
      shape="round"
      v-model:modelValue="searchVal"
      :placeholder="`请输入${produceLabel}号查询`"
    />
    <div class="p-16px h-[calc(100%_-_52px)] overflow-auto" ref="criticalElement">
      <scroll-list
        :pageSize="10"
        class="h-full"
        :loader="loader"
        v-slot="{ list }"
        v-if="criticalElement"
        ref="scrollListRef"
      >
        <div
          @click="checkedRow(i)"
          :class="{ selected: checked.name_ === i.name_ }"
          v-for="i in list"
          class="ks-row-middle mb8px bg-white h120px rounded-8px px16px py12px"
          :key="i.id_"
        >
          <div class="ks-col h100% overflow-hidden">
            <div class="gct-color-text-1 text-16px mb4px font-600">
              <Highlight :text="i.name_" :keyword="searchVal" />
            </div>
            <div class="gct-color-text-5 text-14px">
              <div class="ell">产品编码：{{ i.product_code_ }}</div>
              <div class="ell">产品名称：{{ i.product_name_ }}</div>
              <div class="ell">规格型号：{{ i.product_spec_ }}</div>
            </div>
          </div>
          <van-radio :checked="checked.name_ === i.name_" />
        </div>
      </scroll-list>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-140px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="onConfirm" :disabled="!checked.name_"
          >确认切换</van-button
        >
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import ScrollList from '@mobile/views/edhr/_comps_/scroll-list/index.vue';
  import { MATERIAL_STATUS_ENUM, TASK_TYPE__ENUM } from '@mobile/views/edhr/_utils_/interface';
  import { watchDebounced } from '@vueuse/core';

  const props = defineProps<{
    popupProps: any;
    context: {
      material_status_: MATERIAL_STATUS_ENUM;
      name: string;
      task_type_: TASK_TYPE__ENUM;
      isReworkProduce: boolean;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();
  type ProduceType = {
    id_: string;
    name_: string;
    product_code_: string;
    product_name_: string;
    product_spec_: string;
  };
  type resData = {
    pageNo: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
    data: ProduceType;
  };
  const { material_status_, task_type_, isReworkProduce } = props.context;
  const labelMap = {
    [MATERIAL_STATUS_ENUM.LOT]: '批次',
    [MATERIAL_STATUS_ENUM.SN]: 'SN',
  };
  const scrollListRef = ref();
  const produceLabel = labelMap[material_status_];
  const criticalElement = ref();
  const show = ref<boolean>(true);
  const searchVal = ref<string>('');
  const checked = ref<{ name_: string; id_?: string }>({ name_: props.context.name });
  function checkedRow({ name_, id_ }: ProduceType) {
    checked.value = { name_, id_ };
  }
  const onConfirm = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(checked.value);
    }
    show.value = false;
  };

  async function getProduceList(queryData = {}): Promise<resData> {
    const res = (await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_mfg_order',
        bsKey: 'scan',
      },
      {},
      {
        material_status_: material_status_,
        task_type_,
        ...queryData,
      },
    )) as any;
    res.data =
      res.data?.map((i) => {
        return {
          ...i,
          product_name_: i.product_version_
            ? `${i.product_name_}:${i.product_version_}`
            : i.product_name_,
        };
      }) || [];
    console.log(res);
    return res;
  }
  /**批次返工特殊逻辑 */
  async function getProduceReworkList({ pageNo, pageSize, name_ } = {}) {
    const res = (await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_container',
        bsKey: 'listByPage',
      },
      {
        exp: 'AND(task_type_.eq,status_.ne)',
        query: {
          'task_type_.eq': 'production',
          'status_.ne': 'ended',
          'name_.like': name_,
        },
        modelKey: 'dm_rework_task_operaion_info_jhwd',
        fieldKey: 'f_container_id_jhwd',
        pageNo,
        pageSize,
        refModelKey: 'em_container',
        foreignFields: ['product_id_.code_', 'product_id_.spec_'],
      },
    )) as any;
    res.data =
      res.data?.map((i) => {
        return {
          ...i,
          product_name_: res.dict?.product_id_?.[i.product_id_] || '',
          product_code_: i.__FOREIGN__['product_id_.code_'],
          product_spec_: i.__FOREIGN__['product_id_.spec_'],
        };
      }) || [];
    return res;
  }
  const loader = isReworkProduce ? getProduceReworkList : getProduceList;
  watchDebounced(
    searchVal,
    () => {
      if (scrollListRef.value && scrollListRef.value.onSearch) {
        scrollListRef.value.onSearch({
          name_: searchVal.value,
        });
      }
    },
    { debounce: 500 },
  );
</script>

<style scoped lang="less">
  .container-row {
    height: 120px;
    border-radius: 8px;
    background: #fff;
  }

  .selected {
    border: 1px solid rgb(0 153 255 / 30%);
    background: rgb(0 153 255 / 8%);
  }

  .search-bar.van-search {
    --van-search-input-height: 36px;

    padding: 0 16px 16px;
    background: #fff;
    box-shadow: -4px 0 24px 0 rgb(0 0 0 / 16%);
  }
</style>
<style lang="less">
  .operation-selector-popup {
    .popup__header {
      box-shadow: none;
    }
  }
</style>
