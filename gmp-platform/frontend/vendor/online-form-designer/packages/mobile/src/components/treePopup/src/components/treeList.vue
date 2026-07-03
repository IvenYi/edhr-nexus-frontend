<template>
  <div class="tree-list">
    <div class="overflow-y-auto px-14px border-b">
      <div class="tree-tab flex pb-10px">
        <span
          class="ml-3px mr-10px"
          v-for="(val, index) in checkedSingleData"
          @click.stop="backTo(val)"
          :key="val.value + index"
          >{{ val.label }}</span
        >
        <span class="mx-3px tree-text">请选择</span>
      </div>
    </div>
    <div class="tree-list-container">
      <van-cell
        @click.stop="setVal(i)"
        :class="{ 'is-active': active === i.value }"
        v-for="(i, index) in treeSingleData"
        :key="index"
      >
        <template #title>
          <span v-html="i.label"></span>
        </template>
        <template #right-icon>
          <div class="ks-row-middle">
            <van-icon name="success" class="text-18px primary-color" v-if="active === i.value" />
          </div>
        </template>
      </van-cell>
    </div>
  </div>
</template>

<script setup name="treelist" lang="ts">
  import { type optionType } from '../typing';

  const props = defineProps<{
    checkedSingleData: any[];
    treeSingleData: optionType[];
    activeKey: string;
    type: string;
  }>();
  const active = ref(props.activeKey) || '';
  const emit = defineEmits(['checkTreeData', 'getBackData']);

  function setVal(value: any) {
    active.value = value.value;
    value.children?.length && emit('checkTreeData', value.children, value.value);
  }

  function backTo(value: any) {
    value.value && emit('getBackData', value, value.parentId);
  }

  defineExpose({ active, setVal });
</script>

<style scoped lang="less">
  .is-active {
    color: var(--van-primary-color);
  }
  .tree-tab {
    span {
      white-space: nowrap;
    }
  }
  .tree-text {
    color: var(--van-primary-color);
  }
  .border-b {
    &::-webkit-scrollbar {
      height: 0;
    }
    border-bottom: 1px solid var(--van-cell-border-color);
  }

  :deep(.van-cell) {
    &::after {
      border-bottom: transparent;
      right: 0;
      left: 0;
    }
  }
</style>
