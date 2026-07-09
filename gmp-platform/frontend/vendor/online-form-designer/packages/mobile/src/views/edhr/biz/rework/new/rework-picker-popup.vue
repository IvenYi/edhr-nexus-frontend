<template>
  <basic-popup
    v-model:show="show"
    title="返工批次切换"
    :popup-props="popupProps"
    class="rework-picker-popup"
    :extraStyle="{ width: '480px' }"
  >
    <van-search
      class="search-bar"
      shape="round"
      v-model:modelValue="_searchVal"
      placeholder="请输入任务名称查询"
      @search="handleSearch"
    />
    <div class="p-16px h-[calc(100%_-_52px)]">
      <div v-if="list.length > 0" class="h-full overflow-auto">
        <van-radio-group :modelValue="checked">
          <van-cell-group inset>
            <van-cell
              v-for="i in list"
              :key="i.id_"
              :title="i.name_"
              clickable
              @click="checked = i.id_"
              class="item bg-white mb-10px overflow-hidden"
              :class="checked === i.id_ ? 'selected' : ''"
            >
              <template #title>
                <div class="name">
                  <Highlight :text="i.name_" :keyword="searchKey" />
                </div>
              </template>
              <template #right-icon>
                <van-radio :name="i.id_" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
      <Empty class="h-full" v-else description="暂无搜索结果" />
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="onConfirm">确认切换</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const props = defineProps<{
    popupProps: any;
    context: {
      id: string;
      list: Array<{
        id_: string;
        name_: string;
      }>;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const searchKey = ref<string>('');
  const _searchVal = ref<string>('');
  const checked = ref<string>(props.context.id);

  const handleSearch = () => {
    searchKey.value = _searchVal.value;
  };

  const list = computed(() => {
    const key = searchKey.value.trim();
    if (!key) {
      return props.context.list;
    }

    return props.context.list.filter((item) =>
      item.name_.toLowerCase().includes(key.toLowerCase()),
    );
  });

  const onConfirm = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      const find = list.value.find((item) => item.id_ === checked.value);
      props.onOk(find);
    }
    show.value = false;
  };
</script>

<style scoped lang="less">
  :deep(.van-cell-group) {
    background: transparent;
  }
  :deep(.van-cell-group--inset) {
    margin: 0;
  }

  .item {
    &.van-cell {
      padding: 12px 16px;
      border-radius: 8px;
    }
  }

  .name {
    font-weight: 500;
    font-size: 16px;
    color: #1a1d23;
  }

  .path {
    font-weight: 400;
    font-size: 14px;
    color: #8b8b8b;
  }

  .selected {
    background: #f0f6fc;
    border: 1px solid #026ac8;
  }

  .search-bar.van-search {
    --van-search-input-height: 36px;
    padding: 0 16px 16px 16px;
    background: #fff;
    box-shadow: -4px 0px 24px 0px rgba(0, 0, 0, 0.16);
  }
</style>

<style lang="less">
  .rework-picker-popup {
    .popup__header {
      box-shadow: none;
    }
  }
</style>
