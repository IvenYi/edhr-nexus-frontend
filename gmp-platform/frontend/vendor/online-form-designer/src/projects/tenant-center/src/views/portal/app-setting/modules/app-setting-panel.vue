<template>
  <div
    class="app-setting-panel"
    :style="{
      '--type-height':
        props.type === AppTypeEnum.PRO ? 'calc(100vh - 220px)' : 'calc(100vh - 150px)',
    }"
  >
    <div class="search" v-if="props.list && props.list.length">
      <a-input
        v-model:value="keyword"
        :placeholder="t('sys.developer.appCenter.searchPlaceholder')"
      >
        <template #suffix>
          <i class="search-icon iconfont icon-sousuo" style="color: #212528"></i>
        </template>
      </a-input>
    </div>

    <div class="app-card__list">
      <ScrollContainer>
        <div v-if="isExistAppInfo" class="card">
          <app-card
            v-for="item in appList"
            :key="item.id"
            :data="item"
            class="mb-8px"
            :type="props.type"
          />
        </div>
        <div v-else class="empty-data">
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </ScrollContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import AppCard from '../components/app-card.vue';
  import { AppTypeEnum, AppTypeI18nMap } from '../types';
  import type { AppResponse } from '/@/apis/gct-platform/model';
  import { ScrollContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = withDefaults(
    defineProps<{
      type: AppTypeEnum;
      list?: AppResponse[];
    }>(),
    {
      list: () => [],
    },
  );
  const keyword = ref<string>('');
  const { t } = useI18n();
  const typeName = computed(() => {
    return t(AppTypeI18nMap[props.type]);
  });

  const appList = computed(() => {
    if (!keyword.value || !keyword.value.trim()) {
      return props.list;
    }
    return props.list.filter(
      (item) =>
        item.name?.includes(keyword.value.trim()) || item.id?.includes(keyword.value.trim()),
    );
  });

  const isExistAppInfo = computed(() => {
    return appList.value.length !== 0;
  });
</script>

<style lang="less" scoped>
  .app-setting-panel {
    height: var(--type-height);
    background-color: #fff;
    display: flex;
    flex-direction: column;

    .title {
      font-size: 18px;
      font-weight: 500;
      display: flex;
      align-items: center;
      flex: none;
      &::before {
        content: '';
        height: 16px;
        width: 4px;
        background-color: var(--ant-primary-color);
        border-radius: 2px;
        margin-right: 8px;
      }
    }

    .search {
      flex: none;
      padding: 12px 16px 0;
      width: 365px;
    }

    .app-card__list {
      flex: 1;
      overflow-y: auto;
      margin-top: 16px;
      position: relative;
      & > div:not(:first-child) {
        margin-top: 16px;
      }
      .empty-data {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    }
  }
  .card {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(365px, 1fr));
    grid-gap: 24px;
    padding: 8px 20px 20px 20px;
  }
</style>
