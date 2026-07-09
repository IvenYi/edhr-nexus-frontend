<template>
  <div class="data-list-pager">
    <div class="pager-wrap">
      <span class="pager-item border" :class="{ disable: current <= 1 }" @click="firstPage">
        <vertical-right-outlined />
      </span>
      <span class="pager-item border" :class="{ disable: current <= 1 }" @click="prePage">
        <left-outlined />
      </span>
      <span class="pager-item">页</span>
      <span class="pager-item pageNum-select">
        <a-select v-model:value="selectpage" style="width: 57px; padding: 0 3px" size="small">
          <a-select-option v-for="e in options" :key="e" :label="e" :value="e" />
        </a-select>
      </span>
      <span class="pager-item border" :class="{ disable: current >= maxPage }" @click="nextPage">
        <right-outlined />
      </span>
      <span class="pager-item border" :class="{ disable: current >= maxPage }" @click="endPage">
        <vertical-left-outlined />
      </span>
    </div>
  </div>
</template>
<script setup lang="ts" name="pager-select">
  import { ref, computed, reactive, watch } from 'vue';

  const emit = defineEmits(['update:current', 'page-change']);

  const props = defineProps({
    pageSize: {
      type: Number,
      default: () => 25,
    },
    total: {
      type: Number,
      default: () => 0,
    },
    current: {
      type: Number,
      default: () => 1,
    },
  });
  const maxPage = computed((): number => {
    return Math.ceil(props.total / props.pageSize);
  });
  const options = computed((): number[] => {
    const list = reactive<number[]>([]);
    let i = 1;
    while (i <= maxPage.value) {
      list.push(i);
      i++;
    }
    return list;
  });

  const selectpage = computed({
    get() {
      return props.current;
    },
    set(val) {
      emit('update:current', val);
      emit('page-change', val);
    },
  });

  const firstPage = () => {
    if (selectpage.value <= 1) return;
    selectpage.value = options.value[0];
  };
  const prePage = () => {
    if (selectpage.value <= 1) return;
    selectpage.value--;
  };
  const nextPage = () => {
    if (selectpage.value >= maxPage.value) return;
    selectpage.value++;
  };
  const endPage = () => {
    if (selectpage.value >= maxPage.value) return;
    selectpage.value = maxPage.value;
  };
</script>
<style lang="scss" scoped>
  .data-list-pager {
    width: 100%;
    padding-top: 8px;
    padding-bottom: 8px;
    color: #333;
    .pager-wrap {
      width: 100%;
      .pager-item {
        display: inline-block;
        text-align: center;

        & {
          margin-right: 4px;
        }
        &.border {
          color: #666;
          width: 24px;
          height: 24px;
          border-radius: 2px;
          border: 1px solid #d9d9d9;
          cursor: pointer;
        }
        &.disable {
          color: #bfbfbf;
          cursor: not-allowed;
          & > span {
            pointer-events: none;
          }
        }
      }
    }
  }
  :deep(.ant-select-single.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector) {
    padding: 0 3px;
  }
  :deep(
      .ant-select-single.ant-select-sm:not(.ant-select-customize-input).ant-select-show-arrow
        .ant-select-selection-item
    ) {
    padding-right: 15px;
  }
  :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background-color: transparent;
  }
</style>
