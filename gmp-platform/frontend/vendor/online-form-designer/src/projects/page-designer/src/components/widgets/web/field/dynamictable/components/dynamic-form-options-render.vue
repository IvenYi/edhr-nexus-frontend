<template>
  <template v-for="tag in value" :key="tag">
    <a-tooltip v-if="tag.length > 20" :title="tag">
      <a-tag :closable="!widget.props.readonly" @close="handleClose(tag)">
        {{ `${tag.slice(0, 20)}...` }}
      </a-tag>
    </a-tooltip>
    <a-tag v-else :closable="!widget.props.readonly" @close="handleClose(tag)">
      {{ tag }}
    </a-tag>
  </template>
  <ant-input
    v-if="inputVisible"
    ref="inputRef"
    v-model:value="inputValue"
    type="text"
    size="small"
    :style="{ width: '78px' }"
    @blur="handleInputConfirm"
    @keyup.enter="handleInputConfirm"
  />
  <a-tag
    v-else-if="!widget.props.readonly"
    style="border-style: dashed; background: #fff"
    @click="showInput"
  >
    <plus-outlined />
    {{ t('sys.add') }}
  </a-tag>
</template>

<script name="gct-dynamic-form-options" setup lang="ts">
  import { Input as antInput } from 'ant-design-vue';
  import { computed, nextTick, ref } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import BigNumber from 'bignumber.js';

  const { t } = useI18n();

  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const inputRef = ref();
  const inputVisible = ref(false);
  const inputValue = ref('');
  const handleInputConfirm = () => {
    let tags = value.value;
    console.log(props.formData.type_);
    if (props.formData.type_ === 'integer') {
      if (inputValue.value && !/[^0-9.]/g.test(inputValue.value)) {
        inputValue.value = parseInt(inputValue.value);
      } else {
        inputValue.value = '';
      }
    }
    if (props.formData.type_ === 'decimal') {
      if (!/[^0-9.]/g.test(inputValue.value)) {
        var arr = inputValue.value.split('.');
        var fixed = arr[1];
        var firstNum = arr[0];
        inputValue.value = fixed ? firstNum + '.' + fixed : firstNum;
      } else {
        inputValue.value = '';
      }
    }
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
