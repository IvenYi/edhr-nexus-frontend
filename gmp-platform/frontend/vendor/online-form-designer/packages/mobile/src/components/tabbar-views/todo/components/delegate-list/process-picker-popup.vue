<template>
  <van-popup
    v-model:show="visible"
    position="right"
    :duration="0"
    :style="{ width: '100%', height: '100%' }"
    :zIndex="20"
  >
    <div class="relative z-0 h-full flex flex-col">
      <!-- header -->
      <PageHeader title="审批流程" @back="visible = false" class="border-b-solid border-zinc-100" />

      <div
        ref="listContainerRef"
        class="grow relative z-0 p-3 md:p-6 pb-24 overflow-y-auto bg-[#F5F6F7]"
      >
        <div class="md:mx-auto md:max-w-2xl">
          <!-- 全部委托 -->
          <div
            class="flex justify-between items-center mb-3 md:mb-4 px-4 py-3 bg-white rounded-lg"
            @click="handleAllSelectedChange"
          >
            <span class="font-500">全部委托</span>
            <Radio :checked="isAllSelected" />
          </div>

          <!-- 部分 -->
          <div class="mt-3">
            <div
              v-for="row in _availableAppProcessList"
              :key="row.appTag"
              class="mb-3 md:mb-4 pb-3 bg-white rounded-lg"
            >
              <div
                class="flex items-center mb-1 px-4 pt-3 pb-2 text-sm text-zinc-500 border-b-solid border-zinc-100"
              >
                <div class="shrink-0 primary-color">
                  <i class="icon gct-iconfont icon-biaodan-yingyongicon"></i>
                </div>
                <div class="grow ml-2 min-w-0 truncate">{{ row.appName }}</div>
              </div>
              <div>
                <div v-for="p in row.processList" :key="p.processKey">
                  <div
                    class="flex justify-between items-center px-4 py-3"
                    @click="handleOptionClick((p as any)._mock_key_)"
                  >
                    <span class="text-black font-500">
                      <span v-if="p.processName">{{ p.processName }}</span>
                      <span v-else class="opacity-20">{{ p.processKey }}</span>
                    </span>
                    <Radio :checked="selectedMockKeys.includes((p as any)._mock_key_)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- submit -->
      <div class="absolute z-10 right-0 bottom-0 left-0 p-3 md:p-6 bg-white md:bg-[#F5F6F7]">
        <div class="md:mx-auto md:max-w-2xl">
          <van-button block type="primary" @click="handleConfirm">确认</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import PageHeader from '@mobile/components/common/page-header.vue';
  import Radio from '@mobile/components/common/radio.vue';
  import type { AppProcess } from '@mobile/apis/gct-platform/model';
  import type { IMockProcess } from './util';

  const props = defineProps<{
    availableAppProcessList: AppProcess[];
  }>();

  const emit = defineEmits(['confirm']);

  const listContainerRef = ref();
  const visible = ref(false);
  const isAllSelected = ref(false);
  const selectedMockKeys = ref<string[]>([]);

  const _availableAppProcessList = computed(() => {
    return props.availableAppProcessList.map((app) => {
      (app.processList || []).forEach((p) => {
        (p as any)._mock_key_ = JSON.stringify({
          appTag: app.appTag,
          processKey: p.processKey,
        });
      });
      return app;
    });
  });

  const flatProcessList = computed(() => {
    return _availableAppProcessList.value.map((a) => a.processList).flat();
  });

  const handleSelectAll = () => {
    selectedMockKeys.value = flatProcessList.value.map((p: any) => p._mock_key_);
  };

  const handleAllSelectedChange = () => {
    isAllSelected.value = !isAllSelected.value;

    if (isAllSelected.value) {
      handleSelectAll();
    } else {
      selectedMockKeys.value = [];
    }
  };

  const handleOptionClick = (mockKey: string) => {
    const list = selectedMockKeys.value;
    if (list.includes(mockKey)) {
      selectedMockKeys.value = list.filter((k) => k !== mockKey);
      isAllSelected.value = false;
    } else {
      selectedMockKeys.value.push(mockKey);
    }
  };

  const handleConfirm = () => {
    const _flatList = flatProcessList.value;
    const keys = selectedMockKeys.value;
    const mockProcessList = isAllSelected.value
      ? []
      : keys.length
        ? keys
            .sort((aKey, bKey) => {
              const aIndex = _flatList.findIndex((p: any) => p._mock_key_ === aKey);
              const bIndex = _flatList.findIndex((p: any) => p._mock_key_ === bKey);
              console.log({ aIndex, bIndex });
              return aIndex > bIndex ? 1 : -1;
            })
            .map((key) => JSON.parse(key))
        : undefined;

    emit('confirm', { mockProcessList });
  };

  const open = (mockProcessList?: IMockProcess[]) => {
    isAllSelected.value = false; // reset
    selectedMockKeys.value = (mockProcessList || []).map((p) => JSON.stringify(p));

    // 有且仅为空数组时，默认全选
    if (mockProcessList?.length === 0) {
      isAllSelected.value = true;
      handleSelectAll();
    }

    visible.value = true;
    setTimeout(() => {
      listContainerRef.value?.scrollTo({ top: 0 });
    }, 1);
  };

  const close = () => {
    visible.value = false;
  };

  defineExpose({ open, close });
</script>
