<template>
  <div :class="['search-bar']">
    <van-search
      class="flex-grow-1"
      shape="round"
      v-model:modelValue="_searchVal"
      placeholder="请输入关键词查询"
      @search="handleSearch"
    />
    <div v-if="showAddBtn" class="add-btn" @click.stop="handleAdd">
      <i class="iconfont icon-chuangjian"></i>
      {{ t('sys.insert') }}
    </div>
  </div>
</template>

<script lang="ts" setup name="search-bar">
  import { i18n } from '@mobile/locales/setupI18n';
  import { ref } from 'vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      defaultSearchVal?: string;
      showAddBtn?: boolean;
    }>(),
    {
      defaultSearchVal: '',
      showAddBtn: true,
    },
  );

  const emit = defineEmits<{
    (e: 'search', value: string): void;
    (e: 'add'): void;
  }>();

  const _searchVal = ref(props.defaultSearchVal);

  const handleSearch = (value) => {
    emit('search', value);
  };

  const handleAdd = () => {
    emit('add');
  };
</script>

<style lang="less" scoped>
  .search-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e0e3eb;
    background: #fff;

    .van-search {
      --van-search-content-background: #f4f5f7;
      --van-cell-value-color: #a6a6a6;
      --van-cell-value-font-size: 16px;
      --van-search-input-height: 36px;
    }

    .add-btn {
      padding-right: 16px;
      color: #026ac8;
      cursor: pointer;
    }
  }
</style>
