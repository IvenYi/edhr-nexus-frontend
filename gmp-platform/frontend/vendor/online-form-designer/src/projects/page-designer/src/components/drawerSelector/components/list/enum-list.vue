<template>
  <van-list
    v-if="!props.displayFields || props.displayFields.length <= 1"
    :loading="isLoading"
    :finished="isFinished"
    @load="handleLoad"
  >
    <div class="px-2">
      <div
        v-for="o in options"
        :key="o.value"
        class="flex items-center px-3 py-3 rounded-lg active:bg-[#E0E3EB]"
        :class="o.disabled ? 'opacity-40 pointer-events-none' : ''"
        @click="handleClick(o.value, o)"
      >
        <div class="flex-grow flex mr-6">
          <div v-if="o.icon" class="flex-shrink-0 mr-2">
            <IconNext :size="16" :value="o.icon" :color="o.iconColor" />
          </div>
          <div class="flex-grow break-all" :style="{ color: o.textColor }">
            {{ o._protoValue[displayLabel] || o.label }}
          </div>
        </div>
        <component :is="multiple ? Checkbox : Radio" :checked="selectedValues.includes(o.value)" />
      </div>
    </div>
  </van-list>
  <div class="px-4 pt-3" v-else>
    <vxeRefTable
      ref="xtable"
      v-model="tableData"
      :tableColumns="props.displayFields"
      :rowSelection="multiple"
      :selectTheEntireRow="true"
      :headerSort="false"
      :rowSelectionRadio="!multiple"
      @radioEvent="radioEvent"
      :radioConfig="radioConfig"
      :checkbox-config="checkConfig"
      @checkboxEvent="checkboxEvent"
      keyField="value"
      :key="props.selectedValues"
    />
  </div>
</template>

<script setup lang="ts">
  import { Option } from '../../types';
  import { Checkbox, Radio } from '/@page-designer/components/common';
  import IconNext from '@mobile/components/icon/index.vue';
  import { computed, onMounted } from 'vue';
  import { vxeRefTable } from '/@page-designer/components/widgets/pad/data/data-table/component/vxeRenderTable';

  const emit = defineEmits(['load', 'change']);
  const props = defineProps<{
    options: Option[];
    selectedValues: string[];
    isLoading: boolean;
    isFinished: boolean;
    multiple?: boolean;
    displayFields?: any;
  }>();
  const radioConfig = computed(() => {
    return {
      checkRowKey: props.selectedValues.toString(), // 回显选中的行
    };
  });
  const checkConfig = computed(() => {
    return {
      checkRowKeys: props.selectedValues, // 回显选中的行
    };
  });
  const displayLabel = computed(() => {
    return props.displayFields && props.displayFields.length === 1
      ? props.displayFields[0]?.props?.field
      : 'label';
  });
  const handleLoad = () => {
    emit('load');
  };
  onMounted(() => {
    handleLoad();
  });
  const tableData = computed(() => {
    return props.options.map((i) => {
      return {
        ...i,
        ...i._protoValue,
      };
    });
  });

  const radioEvent = (option) => {
    emit('change', option.value, option);
  };
  const checkboxEvent = (value, option) => {
    emit('change', option.value, option);
  };
  const handleClick = (value, option) => {
    emit('change', value, option);
  };
</script>
