<template>
  <vantField :props="widget.props" :style="widget.style">
    <template #input>
      <div class="dynamic-form-options">
        <van-tag
          plain
          type="primary"
          v-for="tag in value"
          :key="tag"
          color="#E8EBF0"
          textColor="rgba(0,0,0,.85)"
          :closeable="!showReadonly"
          @close="handleClose(tag)"
        >
          <span class="tag-content">
            {{ tag }}
          </span>
        </van-tag>
        <van-field
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          placeholder="请输入"
          :border="false"
          size="normal"
          input-align="left"
          @blur="handleInputConfirm"
          @keyup.enter="handleInputConfirm"
        />
        <van-tag v-else-if="!showReadonly" plain type="primary" @click="showInput">
          <span class="tag-content">
            <van-icon name="plus" />
            {{ t('sys.add') }}
          </span>
        </van-tag>
      </div>
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-dynamic-form-options">
  import { computed, ref, nextTick, reactive, toRefs } from 'vue';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../../../__components__/vantField.vue';
  import { useReadyonly } from '../../../../../hooks/useReadyonly';
  import { useI18n } from '@mobile/utils/useI18n';

  const { t } = useI18n();

  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();

  const emit = defineEmits(['update:modelValue']);

  const { readonly } = reactive(props.widget.props);

  const inputRef = ref();
  const inputVisible = ref(false);
  const inputValue = ref('');

  const showReadonly = computed(() => useReadyonly(readonly));

  const value = computed<any>({
    get() {
      let value = props.modelValue?.split(',');
      return value || [];
    },
    set(v) {
      emit('update:modelValue', v.join(','));
    },
  });

  const showInput = () => {
    inputVisible.value = true;
    nextTick(() => {
      inputRef.value.focus();
    });
  };

  const handleInputConfirm = () => {
    if (!inputValue.value) {
      inputVisible.value = false;
      return;
    }
    let tags = value.value;
    if (inputVisible.value && tags.indexOf(inputValue.value) === -1) {
      value.value = [...tags, inputValue.value];
    }
    inputVisible.value = false;
    inputValue.value = '';
  };

  const handleClose = (removedTag: string) => {
    const tags = value.value.filter((tag) => tag !== removedTag);
    value.value = tags;
  };

  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style scoped lang="less">
  .dynamic-form-options {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: -8px;

    .van-tag {
      margin-right: 8px;
      margin-bottom: 8px;

      .tag-content {
        display: inline-block;
        max-width: 90px;
        overflow: hidden;
        line-height: 24px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    .van-cell {
      width: 78px;
      margin-bottom: 8px;
      padding: 0;
      padding-left: 6px;
      border: 1px solid #e8ebf0;
      border-radius: 2px;
      line-height: 22px;

      :deep(.van-field__body input) {
        text-align: left;
      }
    }
  }
</style>
