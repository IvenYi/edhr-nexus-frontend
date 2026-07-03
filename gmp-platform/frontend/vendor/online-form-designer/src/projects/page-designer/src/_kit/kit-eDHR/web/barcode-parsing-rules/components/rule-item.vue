<template>
  <draggable
    :list="data"
    handle=".mover"
    :animation="200"
    chosen-class="drawing-chosen"
    drag-class="drawing-drag"
    item-key="id"
    class="dragable-wrap max-h420px overflow-auto"
    @end="() => emit('update:list', data)"
  >
    <template #item="{ element, index }">
      <div class="bg-[#f2f4f7] p8px rounded-[4px] ks-row-middle gap-8px rule-item">
        <i v-if="!disabled" class="iconfont icon-drag mover"></i>
        <div class="ks-col">
          <a-select
            :value="element.type"
            :options="fieldOptions"
            :disabled="disabled"
            style="width: 100%"
            :allowClear="false"
            @change="(val) => onItemChange(val, index)"
          />
        </div>
        <div v-if="element.type === Config_Fields.expiration">
          <a-input
            :placeholder="$t('sys.edhr.inputValidDateFormat')"
            :disabled="disabled"
            v-model:value="element.format"
            defaultValue="YYYYMMDD"
          />
        </div>
        <div v-if="element.type === Config_Fields.other">
          <a-input
            :placeholder="$t('sys.onlineForm.pleaseEnterAlias')"
            v-model:value="element.alias"
            :disabled="disabled"
          />
        </div>
        <i
          v-if="!disabled"
          class="iconfont icon-shanchu1 text-[#8b8b8b]"
          :class="[
            data.length <= 1 && 'disabled',
            data.length > 1 ? 'cursor-pointer' : 'cursor-not-allowed',
          ]"
          @click="data.length > 1 && deleteRow(index)"
        ></i>
      </div>
    </template>
  </draggable>
</template>
<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import draggable from 'vuedraggable';
  import { Config_Fields } from './type';
  import { uuid2 } from '/@/utils/uuid';

  const props = defineProps<{ list: any[]; disabled?: boolean }>();
  const emit = defineEmits(['update:list', 'editRow']);

  // 使用 ref 存储本地数据
  const data = ref<any[]>([...props.list]);
  const hasTypes = computed(() => data.value.map((i) => i.type));

  // 监听 props.list 的变化，同步到本地 data
  watch(
    () => props.list,
    (newVal) => {
      data.value = [...newVal];
    },
    { deep: true },
  );

  const deleteRow = (index: number) => {
    data.value.splice(index, 1);
    emit('update:list', data.value);
  };

  const fieldOptions = computed(() => {
    return Object.values(Config_Fields).map((e) => {
      return {
        value: e,
        label: $t(`sys.edhr.labelConfigFields.${e}`),
        disabled: e !== Config_Fields.other && hasTypes.value.includes(e),
      };
    });
  });

  const onItemChange = (val: any, idx: number) => {
    data.value[idx].type = val;
    data.value[idx].key = val === Config_Fields.other ? uuid2(32) : val;
    emit('update:list', data.value);
  };
</script>
<style lang="less" scoped>
  .mover {
    color: #96a0b5;
    font-size: 16px;
    cursor: pointer;
  }

  .rule-item {
    & + & {
      margin-top: 8px;
    }
  }

  .disabled {
    color: #c3c3c3;
  }
</style>
