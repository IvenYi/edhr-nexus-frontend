<template>
  <div class="w100%">
    <RuleSymbol
      v-model:separator="formState.separator"
      v-model:nullSymbol="formState.nullSymbol"
      :disabled="disabled"
    />
    <RuleItem
      v-if="formState.fieldList"
      v-model:list="formState.fieldList"
      class="mt8px"
      :disabled="disabled"
    />
    <a-button type="dashed" @click="handleAdd" v-if="!disabled" class="add-btn my12px">
      <plus-outlined />
      {{ $t('sys.model.addMoreRule') }}
    </a-button>
    <div v-show="formState.fieldList?.length" class="ks-row-middle">
      <div class="preview-title">{{ $t('sys.preview') + '：' }}</div>
      <div class="bg-[#fbfbfc] p8px rounded-[4px] flex-1">
        {{ previewText }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import RuleItem from './rule-item.vue';
  import RuleSymbol from './rule-symbol.vue';
  import { Config_Fields } from './type';
  import { IRuleConfig, handleOldConfig } from '@gct/nocode-base';
  import { cloneDeep } from 'lodash-es';
  import { uuid2 } from '/@/utils/uuid';

  const props = defineProps<{
    modelValue?: any;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', val: string): void;
  }>();

  const defaultConfig = {
    separator: '*',
    nullSymbol: 'NA',
    fieldList: [
      {
        key: Config_Fields.materialCode,
        type: Config_Fields.materialCode,
      },
    ],
  };

  // 使用 ref 存储本地响应式数据
  const formState = ref<IRuleConfig>(cloneDeep(defaultConfig));

  // 监听 props.modelValue 的变化，同步到本地 formState
  watch(
    () => props.modelValue,
    (newVal) => {
      formState.value = newVal ? handleOldConfig(JSON.parse(newVal)) : cloneDeep(defaultConfig);
    },
    { deep: true, immediate: true },
  );

  // 监听 formState 的变化，同步到父组件
  watch(
    () => formState.value,
    (newVal) => {
      if (!newVal || !newVal.fieldList || !newVal.fieldList.length) {
        emit('update:modelValue', '');
      } else {
        emit('update:modelValue', JSON.stringify(newVal));
      }
    },
    { deep: true },
  );

  const handleAdd = () => {
    formState.value.fieldList.push({ type: Config_Fields.other, key: uuid2(32) });
  };

  const previewText = computed(() => {
    const list = formState.value.fieldList;
    if (!list?.length) return '';
    return list.reduce((str, e, idx) => {
      let typeText = $t(`sys.edhr.labelConfigFields.${e.type}`);
      if (e.type === Config_Fields.other && e.alias) {
        typeText = e.alias;
      }
      str += (idx > 0 ? formState.value.separator : '') + '${' + typeText + '}';
      return str;
    }, '');
  });
</script>
<style lang="less" scoped>
  :deep(.ant-btn.add-btn) {
    color: var(--ant-primary-color);
    border-color: var(--ant-primary-color);
  }
</style>
