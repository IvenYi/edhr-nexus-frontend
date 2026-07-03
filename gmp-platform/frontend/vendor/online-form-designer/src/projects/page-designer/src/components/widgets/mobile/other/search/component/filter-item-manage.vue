<template>
  <!-- <div class="filter-manage-area" @click.stop="showPopup">
    <i class="iconfont icon-shezhi"></i>
    筛选项管理
  </div> -->
  <van-cell
    class="filter-manage-area"
    title="筛选项管理"
    @click.stop="showPopup"
    clickable
    :border="false"
  >
    <template #icon>
      <i class="iconfont icon-shezhi mr-4px"></i>
    </template>
  </van-cell>
  <van-popup
    v-model:show="show"
    position="right"
    teleport="body"
    :style="{ width: '100%', height: '100%' }"
    closeable
    close-icon="arrow-left"
    close-icon-position="top-left"
    @opened="onPopupOpened"
    @close="onPopupClose"
  >
    <div class="flex flex-col h-full">
      <div class="text-center text-18px font-bold p12px leading-8 title">筛选项管理</div>
      <div class="w-full px-16px">
        <div class="flex justify-between pt-12px">
          <span class="pr-8px text-16px text-[#333] font-bold">
            已选
            <span style="color: var(--van-primary-color)">{{ selectList.length }}</span>
          </span>
          <span class="text-[#999] text-12px">拖拽可调整顺序</span>
        </div>
        <div class="py-12px select-tag-area" ref="selectTagRef">
          <van-tag
            v-for="(id, index) in selectList"
            :key="`${id}_${index}`"
            class="mx-4px px-4px"
            type="primary"
            size="medium"
            color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
            text-color="var(--van-primary-color)"
            :closeable="!isDisabled"
            @close="close(id)"
            >{{ fieldMap[id] }}</van-tag
          >
        </div>
      </div>
      <div class="flex justify-between py-12px px-16px">
        <span class="text-16px text-[#333] font-bold">更多字段</span>
        <span class="text-12px text-[#999]">打开/关闭筛选项</span>
      </div>
      <div class="overflow-y-scroll flex-1 mb-4px option-container">
        <van-cell v-for="option in plainOptions" :key="option.value" :border="false">
          <template #title>
            <span>{{ option.label }}</span>
          </template>
          <template #right-icon>
            <div class="ks-row-middle">
              <van-switch
                size="22"
                :disabled="isDisabled && checkedMap[option.value]"
                v-model="checkedMap[option.value]"
                @change="(v) => onSwitchChange(v, option.value)"
              />
            </div>
          </template>
        </van-cell>
      </div>
      <div class="w-full p-12px">
        <van-button class="w-full px-4px" type="primary" @click="onConfirm">完成</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts" name="gct-timepicker">
  import { ref, computed, toRefs, watch, reactive, toRef, toRaw, nextTick, onUnmounted } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';
  import { deleteAndInsertArr } from '/@/utils';
  import Sortable from 'sortablejs';
  import { useStorage } from '@vueuse/core';
  import { UserData, CurrentTenant } from '@mobile/stores/loginHooks';

  const { t } = useI18n();

  const props = defineProps<{ cacheKey: string; columns: any[] }>();

  const emit = defineEmits(['changeColumnsByIds']);

  const { columns } = toRefs(props);
  const { cacheKey } = toRaw(props);

  const plainOptions = ref<any[]>([]);

  const checkedMap = reactive({});

  const selectList = ref<string[]>([]);

  const selectTagRef = ref();

  const show = ref(false);

  const state = useStorage<{ [key: string]: any }>(`${UserData.value.userId}_${cacheKey}`, () => {
    return [];
  });

  const fieldMap = toRef(() =>
    columns.value.reduce((total, curr) => {
      total[curr.id] = curr.props.label;
      return total;
    }, {}),
  );

  let sortable;

  const onPopupOpened = () => {
    if (selectTagRef.value) {
      sortable = Sortable.create(selectTagRef.value, {
        animation: 150, // 过度效果，定义排序动画的时间
        ghostClass: 'blue-background-class',
        onEnd(event) {
          const temp = [...selectList.value];
          deleteAndInsertArr(temp, event.oldIndex, event.newIndex);
          selectList.value = temp;
        },
      });
    }
  };

  const onPopupClose = () => {
    sortable && sortable.destroy();
  };

  onUnmounted(() => {
    sortable && sortable.destroy();
  });

  watch(show, (v) => {
    v && transformColumns();
  });

  watch(
    columns,
    () => {
      transformColumns();
      changeColumns();
    },
    {
      immediate: true,
    },
  );

  function transformColumns() {
    plainOptions.value = columns.value.map((item) => {
      if (state.value.length !== 0) {
        checkedMap[item.id] = state.value.includes(item.id);
      } else {
        checkedMap[item.id] = true;
      }
      return {
        value: item.id,
        label: item.props.label,
      };
    });

    if (state.value.length !== 0) {
      selectList.value = state.value.slice();
    } else {
      selectList.value = columns.value.map((item) => item.id);
    }
  }

  const isDisabled = computed(() => {
    return selectList.value.length <= 1;
  });

  const close = (id) => {
    checkedMap[id] = false;
    selectList.value = selectList.value.filter((item) => item !== id);
  };

  const onSwitchChange = (visible, id) => {
    if (visible) {
      selectList.value = selectList.value.concat(id);
    } else {
      selectList.value = selectList.value.filter((item) => item !== id);
    }
  };

  const showPopup = () => {
    show.value = true;
  };

  const onCancel = () => {
    show.value = false;
  };

  const onConfirm = () => {
    state.value = selectList.value.slice();
    onCancel();
    changeColumns();
  };

  function changeColumns() {
    emit('changeColumnsByIds', selectList.value);
  }
</script>
<style scoped lang="less">
  .filter-manage-area {
    position: relative;
    padding: 4px 12px;
    color: #333;
    line-height: 22px;
    > .iconfont {
      vertical-align: bottom;
    }
  }
  .title {
    z-index: 1;
    top: 0;
    width: 100%;
    position: relative;
  }

  .select-tag-area {
    position: relative;
    &:after {
      position: absolute;
      box-sizing: border-box;
      content: ' ';
      pointer-events: none;
      right: var(--van-padding-md);
      bottom: 0;
      left: var(--van-padding-md);
      border-bottom: 1px solid var(--van-cell-border-color);
      right: 0;
      left: 0;
      transform: scaleY(0.5);
    }
  }

  .option-container {
    min-height: 200px;
  }

  :deep(.van-cell) {
    &::after {
      right: 0;
      left: 0;
    }
  }

  .blue-background-class {
    background-color: #ddd;
  }
</style>
