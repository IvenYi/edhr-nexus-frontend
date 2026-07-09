<template>
  <basic-popup
    v-model:show="show"
    title="选择批次"
    :popup-props="popupProps"
    :extraStyle="{ width: '480px' }"
    class="operation-selector-popup"
  >
    <van-search
      class="search-bar"
      shape="round"
      v-model:modelValue="searchVal"
      :placeholder="`请输入批次号查询`"
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
          @click="checkedRow(checked.includes(i.materialNo), i.materialNo)"
          :class="{ selected: checked.includes(i.materialNo) }"
          v-for="i in list"
          class="ks-row-middle mb8px bg-white h120px rounded-8px px16px py12px"
          :key="i.id_"
        >
          <div class="ks-col h100% overflow-hidden">
            <div class="gct-color-text-1 text-16px mb4px font-600">
              <Highlight :text="i.materialNo" :keyword="searchVal" />
            </div>
            <div class="gct-color-text-5 text-14px">
              <div class="ell">产品编码：{{ i.product_code_ }}</div>
              <div class="ell">产品名称：{{ i.product_name_ }}</div>
              <div class="ell">规格型号：{{ i.product_spec_ }}</div>
            </div>
          </div>
          <van-checkbox shape="square" :checked="checked.includes(i.materialNo)" />
        </div>
      </scroll-list>
    </div>
    <div
      v-if="checked.length"
      class="flex-shrink-0 flex flex-wrap max-h-[138px] px-4 pt-3 pb-1 border-t-solid border-b-solid border-zinc-100 overflow-y-auto absolute bottom-60px w100% bg-[#fff]"
    >
      <div
        v-for="(o, index) in checked"
        :key="o"
        class="flex items-center mr-2 mb-2 pl-3 pr-2 py-1 bg-[#F2F5F8] rounded-full"
      >
        <!-- label -->
        <div class="flex-shrink-0 leading-none">
          {{ o }}
        </div>
        <!-- remove -->
        <div
          class="flex-shrink-0 flex justify-center items-center ml-2 w-4 h-4 bg-[#A6A6A6] text-white rounded-full"
          @click="() => checked.splice(index, 1)"
        >
          <i class="icon gct-iconfont icon-guanbi-danchuang text-[10px]"></i>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-140px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="onConfirm">确认</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  import ScrollList from '@mobile/views/edhr/_comps_/scroll-list/index.vue';
  import { watchDebounced } from '@vueuse/core';
  import { postEdhrInstancePageListGroup } from '/@/apis/gct-apaas/EdhrInstanceController';

  const props = defineProps<{
    popupProps: any;
    context: {
      relatedMaterialNos: string[];
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const scrollListRef = ref();
  const criticalElement = ref();
  const show = ref<boolean>(true);
  const searchVal = ref<string>('');
  const checked = ref<string[]>([...props.context.relatedMaterialNos]);
  function checkedRow(selected, materialNo: string) {
    if (selected) {
      let index;
      while ((index = checked.value.indexOf(materialNo)) !== -1) {
        checked.value.splice(index, 1);
      }
    } else {
      checked.value.push(materialNo);
    }
  }
  const onConfirm = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk([...checked.value]);
    }
    show.value = false;
  };

  /**批次返工特殊逻辑 */
  async function getProduceList({ pageNo, pageSize, name_ } = {}) {
    const res = (await postEdhrInstancePageListGroup({
      pageNo,
      pageSize,
      materialNos: name_ ? [name_] : [],
    })) as any;
    res.data =
      res.data?.map((i) => {
        return {
          ...i,
          product_name_: i.productName || '',
          product_code_: i.productCode,
          product_spec_: i.spec,
        };
      }) || [];
    return res;
  }
  const loader = getProduceList;
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
