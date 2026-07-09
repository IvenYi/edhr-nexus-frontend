<template>
  <div class="selected-tags w-full mt-4px shadow-top">
    <div
      class="w-full flex-1 overflow-y-auto"
      :class="{ 'toggle-box': isExpand }"
      v-if="nodes.length"
    >
      <span class="pr-8px text-sm mr-8px border-r">
        已选
        <span style="color: var(--van-primary-color)">
          {{ nodes.length }}
          <van-icon @click="toggle" :name="isExpand ? 'arrow-up' : 'arrow-down'" />
        </span>
      </span>
      <van-tag
        v-for="item in nodes"
        :key="item.id"
        class="mx-2px mb-6px px-2px tag-wrap"
        size="medium"
        round
        color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
        text-color="var(--van-primary-color)"
        closeable
        @close="emit('remove', item)"
      >
        <span>
          {{ item.name }}
        </span>
      </van-tag>
    </div>
  </div>
</template>

<script lang="ts" setup name="selected-tags">
  import { i18n } from '@mobile/locales/setupI18n';
  import { SelectTreeNode } from '../types/tree-select-popup';
  import { ref } from 'vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      nodes: SelectTreeNode[];
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'remove', node: SelectTreeNode): void;
  }>();

  const isExpand = ref<Boolean>(false);
  const toggle = () => {
    isExpand.value = !isExpand.value;
  };
</script>

<style lang="less" scoped>
  .selected-tags {
    .shadow-top {
      box-shadow: 0 -1px 4px 0 rgb(0 0 0 / 12%);
    }
    .border-r {
      border-right: 1px solid var(--van-cell-border-color);
    }
    .tag-wrap {
      max-width: calc(100% - 4px);
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .toggle-box {
      height: 27px;
      overflow: hidden;
    }
  }
</style>
