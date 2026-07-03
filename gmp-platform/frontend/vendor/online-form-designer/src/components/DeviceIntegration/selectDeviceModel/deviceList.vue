<template>
  <div class="ks-row">
    <div class="p16px text-[#1A1D23] font-600">设备</div>
    <div class="px16px">
      <a-input
        v-model:value="searchValue"
        placeholder="搜索设备名称、编码"
        @change="changeDeviceList"
      >
        <template #prefix>
          <span class="gct-iconfont icon-search"></span>
        </template>
      </a-input>
    </div>
    <div class="ks-col overflow-y-auto mt16px" ref="listRef">
      <DeviceItem
        :selected="i.id === modelValue"
        v-for="i in deviceList"
        :item="i"
        :key="i.id"
        @click="selectDevice(i)"
      />
      <div class="text-center w100%" ref="loadMoreRef" v-show="hasMore">
        <a-spin />
      </div>
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" v-if="!deviceList.length && !hasMore" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import DeviceItem from './deviceItem.vue';
  import { getDeviceInterconnectionPageList } from '/@/apis/gct-platform/DeviceInterconnectionController';
  import { debounce } from 'lodash-es';
  import { Empty } from 'ant-design-vue';

  const props = defineProps<{ modelValue?: string }>();
  const emit = defineEmits(['update:modelValue']);
  const pageNo = ref(1);
  const pageSize = 10;
  const searchValue = ref();
  const deviceList = ref<any[]>([]);
  const listRef = ref<HTMLElement | null>(null);
  const loadMoreRef = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;
  const loading = ref(false);
  const hasMore = ref(true);
  async function getDeviceList() {
    if (loading.value || !hasMore.value) return;
    loading.value = true;
    const { data, totalCount } = await getDeviceInterconnectionPageList({
      pageNo: pageNo.value,
      pageSize: pageSize,
      keyword: searchValue.value,
    });
    deviceList.value.push(...data);
    if (deviceList.value.length >= totalCount) {
      hasMore.value = false;
    } else {
      pageNo.value++;
    }
    loading.value = false;
    // 列表变化后，确保 observer 能继续工作
    await nextTick();
  }

  onMounted(async () => {
    await getDeviceList();
    initObserver();
  });
  /** 初始化 IntersectionObserver */
  function initObserver() {
    if (!listRef.value || !loadMoreRef.value) return;
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          getDeviceList();
        }
      },
      {
        root: listRef.value, // 👈 关键：使用滚动容器
        rootMargin: '0px 0px 100px 0px', // 提前 100px 触发
        threshold: 0,
      },
    );
    observer.observe(loadMoreRef.value);
  }
  /**
   * 改变设备列表
   */
  const changeDeviceList = debounce(() => {
    pageNo.value = 1;
    hasMore.value = true;
    deviceList.value = [];
    getDeviceList();
  }, 300);

  onBeforeUnmount(() => {
    if (observer && loadMoreRef.value) {
      observer.unobserve(loadMoreRef.value);
      observer.disconnect();
    }
  });

  function selectDevice(item: any) {
    if (item.id === props.modelValue) return;
    emit('update:modelValue', item.id);
    emit('select', item);
  }
</script>
<style scoped lang="less"></style>
