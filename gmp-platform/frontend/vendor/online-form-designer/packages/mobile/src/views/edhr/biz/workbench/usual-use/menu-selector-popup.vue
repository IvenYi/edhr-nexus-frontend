<template>
  <basic-popup
    v-model:show="show"
    title="编辑我的常用"
    class="menu-selector-popup"
    :popup-props="{ ...popupProps }"
    :extraStyle="{ width: '480px' }"
  >
    <div class="p-16px h-full">
      <van-loading v-if="loading" :loading="loading">加载中</van-loading>
      <template v-else-if="list.length">
        <van-cell
          v-for="i in list"
          :key="i.id"
          :title="i.name"
          clickable
          @click="() => handleSelected(i)"
          class="item bg-white mb-10px overflow-hidden"
        >
          <template #title>
            <div class="name">
              {{ i.name }}
            </div>
          </template>
          <template #right-icon>
            <van-checkbox shape="square" :modelValue="_selectedIds.includes(i.id)" />
          </template>
        </van-cell>
      </template>
      <Empty
        v-else-if="!list.length"
        class="w-full h-full rounded-12px"
        description="暂无数据"
        :size="[90, 66]"
      />
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleOk">确认切换</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';
  import { getMenuConfigAvailableList } from '/@/apis/gct-apaas/MenuConfigController';

  const props = withDefaults(
    defineProps<{
      popupProps: any;
      selectedIds: string[];
      onOk?: Function;
    }>(),
    {
      selectedIds: () => [],
    },
  );

  const show = ref<boolean>(true);
  const loading = ref(false);
  const list = ref<any[]>([]);
  const _selectedIds = ref<string[]>(props.selectedIds);

  const getData = async () => {
    loading.value = true;
    const res = await getMenuConfigAvailableList({
      menuType: 'PAD',
    });
    console.log('菜单', res);
    list.value = res
      .filter((i) => !!i.linkPage && i.linkPage !== 'edhr-workbench')
      .sort((a, b) => a.sortNum - b.sortNum);
    loading.value = false;
  };

  onMounted(async () => {
    await getData();
    const allMenuIds = list.value.map((i) => i.id);
    // 过滤掉不存在的id
    _selectedIds.value = _selectedIds.value.filter((i) => allMenuIds.includes(i));
  });

  const handleSelected = (i) => {
    if (_selectedIds.value.includes(i.id)) {
      _selectedIds.value = _selectedIds.value.filter((j) => j !== i.id);
    } else {
      _selectedIds.value.push(i.id);
    }
  };

  const handleOk = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk([..._selectedIds.value]);
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

  .page {
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
  .menu-selector-popup {
    .popup__header {
      box-shadow: none;
    }
  }
</style>
