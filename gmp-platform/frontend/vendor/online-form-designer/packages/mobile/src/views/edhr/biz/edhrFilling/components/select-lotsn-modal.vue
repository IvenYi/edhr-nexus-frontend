<template>
  <basic-popup
    :showHeader="false"
    :showFooter="false"
    v-model:show="show"
    :popup-props="popupProps"
    :extraStyle="{ width: '100%' }"
    class="operation-selector-popup"
  >
    <div class="ks-row-middle bg-white pl16px">
      <div class="text-[#1A1D23] gct-iconfont icon-fanhui-padduan" @click="show = false"></div>
      <van-search
        class="search-bar ks-col"
        shape="round"
        v-model:modelValue="searchVal"
        placeholder="请输入批次/SN"
        @search="search"
      />
    </div>

    <div class="pl24px">
      <div
        @click="checkedRow(i)"
        v-for="i in list"
        class="ks-row-middle h50px container-row"
        :key="i.id"
      >
        <div
          v-if="i.materialStatus === MATERIAL_STATUS_ENUM.LOT"
          class="bg-[#3074E2] color-[#fff] leading-none text-[12px] py4px rounded-4px w38px text-center"
        >
          批次
        </div>
        <div
          v-if="i.materialStatus === MATERIAL_STATUS_ENUM.SN"
          class="bg-[#9066EC] color-[#fff] leading-none text-[12px] py4px rounded-4px w38px text-center"
        >
          SN
        </div>
        <div class="gct-color-text-1 text-16px ml8px">
          <Highlight :text="i.value" :keyword="searchVal" />
        </div>
      </div>
    </div>
    <Empty class="mt100px" description="暂无搜索结果" v-if="!list?.length" />
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  import { watchDebounced } from '@vueuse/core';
  import { getEdhrInstanceSearchHistoryList } from '/@/apis/gct-apaas/EdhrInstanceSearchHistoryController';
  import { MATERIAL_STATUS_ENUM } from '@mobile/views/edhr/_utils_/interface';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const props = defineProps<{
    popupProps: any;
    context: {};
    onOk?: Function;
    onCancel?: Function;
  }>();

  const list = ref<any[]>([]);
  const show = ref<boolean>(true);
  const searchVal = ref<string>('');

  function checkedRow(row) {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(row);
    }
    show.value = false;
  }

  async function loader({ materialNo } = {}) {
    const res = await getEdhrInstanceSearchHistoryList({ materialNo });
    list.value = res.map((item) => {
      return {
        value: item.materialNo,
        id: item.id,
        materialStatus: item.materialStatus,
      };
    });
  }

  watchDebounced(
    searchVal,
    () => {
      loader({ materialNo: searchVal.value });
    },
    { debounce: 500 },
  );
  loader();

  async function search(val) {
    checkedRow({ value: val });
  }
</script>

<style scoped lang="less">
  .container-row {
    border-bottom: 1px solid #e0e3eb;
  }

  .search-bar.van-search {
    --van-search-input-height: 36px;

    padding: 14px 16px;
  }
</style>
<style lang="less">
  .operation-selector-popup {
    .popup__header {
      box-shadow: none;
    }
  }
</style>
