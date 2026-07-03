<template>
  <template v-for="tag in value" :key="tag">
    <a-tooltip v-if="tag.length > 20" :title="tag">
      <a-tag closable @close="handleClose(tag)">
        {{ `${tag.slice(0, 20)}...` }}
      </a-tag>
    </a-tooltip>
    <a-tag v-else closable @close="handleClose(tag)">
      {{ tag }}
    </a-tag>
  </template>
  <template v-if="inputVisible">
    <component
      :is="config[type.compType]"
      ref="inputRef"
      v-model:value="inputValue"
      size="small"
      :style="{ width: '78px !important', marginRight: '4px !important' }"
      @blur="handleInputConfirm"
      @keyup.enter="handleInputConfirm"
    />
  </template>

  <a-tag style="background: #fff; border-style: dashed" @click="showInput">
    <plus-outlined />
    {{ t('sys.add') }}
  </a-tag>
</template>

<script setup lang="ts">
  import { Input as AntInput, InputNumber as AntInputNumber } from 'ant-design-vue';
  import { computed, nextTick, ref } from 'vue';
  import { DYN_F_TYPE } from '/@web-render/views/edhr-application/enums';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    type: DYN_F_TYPE;
  }>();
  const emit = defineEmits(['update:modelValue']);
  const inputRef = ref();
  const inputVisible = ref(false);
  const inputValue = ref('');

  const config = {
    INPUT: AntInput,
    INPUT_NUMBER: AntInputNumber,
  };

  const type = computed(() => {
    if (props.type === DYN_F_TYPE.String) {
      return {
        compType: 'INPUT',
      };
    }
    if (props.type === DYN_F_TYPE.Integer || props.type === DYN_F_TYPE.Decimal) {
      return {
        compType: 'INPUT_NUMBER',
      };
    }
  });

  const handleInputConfirm = () => {
    let tags = value.value;
    if (inputVisible.value && inputValue.value !== '' && tags.indexOf(inputValue.value) === -1) {
      value.value = [...tags, inputValue.value];
    }
    inputValue.value = '';
    inputVisible.value = false;
  };

  const showInput = () => {
    inputVisible.value = true;
    nextTick(() => {
      inputRef.value?.focus();
    });
  };

  const handleClose = (removedTag: string) => {
    const tags = value.value.filter((tag) => tag !== removedTag);
    console.log(tags);
    value.value = tags;
    inputValue.value = '';
  };

  const value = computed<any>({
    get() {
      let value = props.modelValue?.split(',');
      return value || [];
    },
    set(v) {
      emit('update:modelValue', v.join(','));
    },
  });

  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
