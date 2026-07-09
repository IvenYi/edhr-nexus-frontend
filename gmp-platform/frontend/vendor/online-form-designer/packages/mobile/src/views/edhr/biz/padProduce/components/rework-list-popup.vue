<template>
  <basic-popup
    v-model:show="show"
    title="选择返工标题"
    :popup-props="popupProps"
    :extraStyle="{ width: '480px' }"
    class="operation-selector-popup"
  >
    <van-search
      class="search-bar"
      shape="round"
      v-model:modelValue="searchVal"
      :placeholder="`请输入返工标题查询`"
    />
    <div class="p-16px h-[calc(100%_-_52px)] overflow-auto">
      <div
        @click="checkedRow(i)"
        :class="{ selected: checked.id_ === i.id_ }"
        v-for="i in reworkList"
        class="ks-row-middle mb8px bg-white rounded-8px px16px py12px"
        :key="i.id_"
      >
        <div class="ks-col h100%">
          <div class="gct-color-text-1 text-16px mb4px font-600">
            <Highlight :text="i.rework_name_" :keyword="searchVal" />
          </div>
          <div class="gct-color-text-5 text-14px">
            <div>返工数量：{{ i.qty_ }}</div>
            <div class="break-all">返工描述：{{ i.description_ }}</div>
          </div>
        </div>
        <van-radio :checked="checked.id_ === i.id_" />
      </div>
      <Empty class="h-full" description="暂无搜索结果" v-if="!list?.length" />
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-140px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="onConfirm" :disabled="!checked.id_"
          >确认切换</van-button
        >
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  import { getReworkList } from '@mobile/views/edhr/_hooks_/useApi';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const props = defineProps<{
    popupProps: any;
    context: {
      container_id_: string;
      rework_id: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();
  const { container_id_, rework_id } = props.context;
  const show = ref<boolean>(true);
  const searchVal = ref<string>('');
  const checked = ref<{ id_: string }>({ id_: rework_id });
  const list = ref([]);
  const onConfirm = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(checked.value);
    }
    show.value = false;
  };
  console.log(checked, props);

  const reworkList = computed(() => {
    const key = searchVal.value.trim();
    if (!key) {
      return list.value;
    }

    return list.value.filter((item) =>
      item.rework_name_.toLowerCase().includes(key.toLowerCase()),
    );
  })
  async function getProduceList() {
    list.value = await getReworkList(container_id_);
  }
  function checkedRow(row) {
    checked.value = row;
  }
  onMounted(async () => {
    await getProduceList();
    checked.value = list.value.find((i) => i.id_ === rework_id) || {};
  });
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
