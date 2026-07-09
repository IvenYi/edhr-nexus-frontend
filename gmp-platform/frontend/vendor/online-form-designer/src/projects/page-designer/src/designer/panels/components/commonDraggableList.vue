<template>
  <draggable
    :list="modelValue"
    handle=".mover"
    :animation="200"
    chosen-class="drawing-chosen"
    drag-class="drawing-drag"
    item-key="id"
    class="dragable-wrap max-h420px overflow-auto"
  >
    <template #item="{ element, index }">
      <div class="ks-row-middle fieldrow mb8px">
        <i class="iconfont icon-drag mover cursor-pointer mr8px text-[#C3C3C3]"></i>
        <div class="ks-col gct-text-overflow text-[#212528]" :title="element[showLabel]">
          {{ element[showLabel] }}
        </div>

        <a-tooltip placement="top">
          <template #title>{{ $t('sys.edit') }}</template>
          <i
            class="iconfont icon-bianji cursor-pointer ml8px primary-gct-hover text-[#797A7D]"
            @click="emit('editRow', element, index)"
          ></i>
        </a-tooltip>
        <a-popconfirm
          placement="topLeft"
          :title="$t('sys.pageDesigner.confirmExecution')"
          @confirm="deleteRow(index)"
        >
          <a-tooltip placement="top">
            <template #title>{{ $t('sys.delete') }}</template>
            <i
              class="iconfont icon-shanchu2 cursor-pointer ml8px error-gct-hover text-[#797A7D]"
            ></i>
          </a-tooltip>
        </a-popconfirm>
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import draggable from 'vuedraggable';

  const props = defineProps<{ modelValue: any[]; labelKey?: string }>();
  const showLabel = props.labelKey || 'label';
  const emit = defineEmits(['update:modelValue', 'editRow']);
  const deleteRow = (index) => {
    props.modelValue.splice(index, 1);
  };
</script>
<style scoped lang="less">
  .fieldrow {
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;
  }
</style>
