<template>
  <div class="p-8px bg-[#eee]">
    <template v-if="list.length > 0">
      <vue-draggable
        v-model="list"
        :animation="200"
        ghostClass="ghost"
        itemKey="id"
        handle=".check-item-drag"
      >
        <template #item="{ element: item, index }">
          <CardItem class="card-item" :item="item" :list="list" :seq="index + 1" :table="table" :disabled="disabled" />
        </template>
      </vue-draggable>
    </template>
    <div v-else class="text-center text-[#999]"> 暂无数据 </div>
  </div>
</template>

<script setup lang="ts">
  import CardItem from './card.vue';
  import type { CheckItem } from './type';
  import VueDraggable from 'vuedraggable';
  import { computed } from 'vue';
  import type { ITable } from '/@online-form/views/designer/types';

  const props = defineProps<{
    table: ITable;
    ds: {
      data: CheckItem[];
    };
    disabled?: boolean;
  }>();

  const list = computed({
    get() {
      return props.ds.data;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.ds.data = value;
    },
  });
</script>

<style lang="less" scoped>
  .card-item:not(:last-child) {
    margin-bottom: 8px;
  }
</style>
