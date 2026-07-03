<template>
  <a-input
    v-model:value="value"
    v-bind="separatorAttr"
    @pressEnter="onpressEnter"
    @blur="emit('tableSearch')"
  />
</template>

<script name="gct-input" setup lang="ts">
  import { ref, computed, reactive } from 'vue';
  import type { InputProps } from 'ant-design-vue';
  import { isNil, isEmpty, debounce } from 'lodash-es';
  import { SearchInput } from '/@page-designer/types/web';
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('search_input');

  const props = defineProps<{ modelValue?: string; widget: SearchInput }>();
  const { modelKey, key: field } = reactive(props.widget);

  const separatorAttr = computed(() => {
    let attr: InputProps = {
      placeholder: '请输入',
      allowClear: true,
    };
    return attr;
  });

  const emit = defineEmits(['update:modelValue', 'gctsearch', 'tableSearch']);

  const value = computed({
    get() {
      return typeof props.modelValue === 'string' ? props.modelValue : '';
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  function onpressEnter() {
    emit('gctsearch');
    emit('tableSearch');
  }

  const options = ref<IData[]>([]);

  const onSelect = (val: string) => {
    value.value = val;
  };

  defineExpose({});
</script>

<style lang="scss">
  .#{bem(search_input-auto-complete-popup)} {
    .#{bem(search_input-tip, content)} {
      .#{bem(search_input-auto-complete, option)} {
        color: var(--ant-primary-color);
      }
    }
  }

  .ant-tooltip {
    .#{bem(search_input-tip, title)} {
      .#{bem(search_input-auto-complete, option)} {
        color: #709aff;
      }
    }
  }
</style>
