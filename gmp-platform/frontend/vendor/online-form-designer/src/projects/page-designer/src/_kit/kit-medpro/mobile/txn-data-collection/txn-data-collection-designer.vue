<template>
  <div class="txn-data-collection-card-list">
    <van-cell class="txn-data-collection-card" v-for="item of groupData" :key="item.name" is-link>
      <template #title>
        <div class="txn-data-collection-card-title">
          <span>
            {{ item.name }}
          </span>
        </div>
      </template>
      <template #right-icon>
        <van-icon name="arrow" class="arrow-icon" />
      </template>
    </van-cell>
  </div>
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref, toRefs, watch } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import type { CollapseInstance } from 'vant';

  const collapseRef = ref<CollapseInstance>();

  const props = defineProps(widgetProps);

  const { defaultExpand } = toRefs(props.widget.props);

  watch(
    () => defaultExpand.value,
    (val) => {
      collapseRef.value?.toggleAll(val);
    },
  );

  const groupData = ref([
    {
      name: '数据采集项1',
      placeholder: '请输入',
    },
    {
      name: '数据采集项2',
      placeholder: '请选择',
    },
  ]);
</script>

<style lang="less" scoped>
  .txn-data-collection-card {
    margin: 8px 0;
    border-radius: 6px;
    background-color: #fff;
    align-items: center;

    &-title {
      display: flex;
      align-items: center;
      padding: 4px 6px;
      position: relative;

      span {
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        margin-left: 4px;
      }
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        content: '';
        width: 3px;
        height: 16px;
        background: var(--van-primary-color);
        transform: translate(0, -50%);
      }
    }
  }
</style>
