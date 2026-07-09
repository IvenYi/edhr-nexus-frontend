<template>
  <div class="slect-list flex flex-col h-full">
    <div class="flex-1 overflow-y-auto">
      <van-cell @click="setVal(i)" v-for="(i, index) in selectData" :key="index">
        <template #title>
          <div class="flex">
            <van-checkbox
              v-if="type === SelectType.MULTIPLE"
              class="mr-12px mb-auto mt-5px"
              v-model="i.checked"
              shape="square"
              icon-size="16"
            />
            <div class="flex-1">
              <div class="text-base" v-html="i.label"></div>
              <div class="text-sm text-[#666666]">{{ i.labels }}</div>
            </div>
          </div>
        </template>
      </van-cell>
    </div>
    <div
      class="w-full p-12px shadow-top"
      v-show="type === SelectType.MULTIPLE && selectData.length"
    >
      <van-button class="w-full px-4px" type="primary" @click="setMulVal">完成</van-button>
    </div>
  </div>
</template>

<script setup name="selectList" lang="ts">
  import { SelectType, type optionType } from '../typing';

  const props = defineProps<{
    selectData: optionType[];
    type: string;
  }>();

  const emit = defineEmits(['setSelectData']);

  const setVal = (val: any) => {
    if (props.type === SelectType.SINGLE) {
      emit('setSelectData', val);
    } else {
      return;
    }
  };

  const setMulVal = () => {
    if (props.type === SelectType.MULTIPLE) {
      emit('setSelectData', props.selectData);
    }
  };
</script>

<style scoped lang="less">
  .slect-list {
    border-top: 1px solid var(--van-cell-border-color);
  }
  :deep(.van-cell) {
    &::after {
      right: 0;
      left: 0;
    }
  }
  .shadow-top {
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.12);
  }
</style>
