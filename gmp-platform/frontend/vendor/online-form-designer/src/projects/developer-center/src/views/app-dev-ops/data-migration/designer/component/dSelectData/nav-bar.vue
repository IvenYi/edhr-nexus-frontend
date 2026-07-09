<template>
  <a-tabs
    :activeKey="selectKey"
    hide-add
    type="editable-card"
    @edit="onEdit"
    @tabClick="change"
    :animated="false"
  >
    <a-tab-pane v-for="pane in barOptions" :key="pane.key" closable>
      <template #tab>
        <a-checkbox :checked="pane.checked" :indeterminate="pane.indeterminate && pane.checked">
          <div class="ell max-w-160px" :title="pane.title"> {{ pane.title }}</div>
        </a-checkbox>
      </template>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';

  const defProps = defineProps<{
    barOptions: object[];
    selectKey: string;
  }>();
  const emit = defineEmits(['update:selectKey', 'deleteBarKeys']);
  const onEdit = (targetKey: string) => {
    emit('deleteBarKeys', targetKey);
  };
  const change = (targetKey: string) => {
    emit('update:selectKey', targetKey);
  };
</script>
<style scoped lang="less">
  :deep(.ant-tabs-nav) {
    height: 46px;
    margin-bottom: 0;

    .ant-tabs-tab-active {
      border-bottom: 2px solid var(--ant-primary-color) !important;
    }
  }
  :deep(.ant-tabs-tab-remove) {
    opacity: 0;

  }
  :deep(.ant-tabs-tab-with-remove){
    &:hover{
      .ant-tabs-tab-remove{
        opacity: 1 !important;
      }
    }
  }
</style>
