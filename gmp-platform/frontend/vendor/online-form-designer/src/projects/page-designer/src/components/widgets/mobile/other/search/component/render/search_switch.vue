<template>
  <van-field
    v-bind="formAttr"
    style="padding: 0; background-color: transparent"
    class="search-switch"
    :class="useMore && 'is-disabled'"
    @click="showPopup"
  >
    <template #input>
      <FieldSelect v-bind="separatorAttr" v-model:value="value" v-model:showPop="showPop" />
    </template>
    <template #button v-if="!showIcon">
      <van-icon
        v-if="value === 1 || value === 0"
        name="clear"
        size="20"
        :class="moreOptions.length ? 'mr-8px' : ''"
        color="#c8c9cc"
        @click.stop="onClear"
      />
      <moreOption
        @clear="$emit('update:modelValue', null)"
        v-model:useMore="useMore"
        v-model:ope="ope"
        :moreOptions="moreOptions"
        :fieldType="fieldType"
      />
    </template>
  </van-field>
</template>

<script name="gct-radio" setup lang="ts">
  import { computed, reactive, toRefs, ref } from 'vue';
  import { SearchSwitch } from '/@page-designer/types/web';
  import moreOption from '../more_option.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import type { FieldProps } from 'vant';

  const props = defineProps<{ modelValue?: boolean; widget: SearchSwitch; showIcon: boolean }>();

  const emit = defineEmits(['update:modelValue']);

  const state = reactive(props.widget.props);
  const {
    field,
    fieldType,
    placeholder,
    checkedChildren,
    unCheckedChildren,
    moreOptions,
    defaultValue,
    modelKey,
    disabled,
  } = state;
  const { ope, useMore } = toRefs(state);
  const options = ref();

  const showPop = ref<boolean>(false);

  const getOptions = async () => {
    const info = await FieldSchema.getConfigByField(modelKey!, field);

    const option = info?.specificConfig;

    options.value = option
      ? Object.entries(option).map(([value, label]) => {
          return {
            label,
            value: value === true || value === 'true' ? 1 : 0,
          };
        })
      : [];
  };
  getOptions();

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder: placeholder,
      inputAlign: 'right',
      disabled,
      readonly,
      clickable: false,
      border: false,
    } as FieldProps;
  });

  const separatorAttr = computed(() => {
    return {
      fieldType,
      checkedChildren,
      unCheckedChildren,
      tagStyle: {},
      options: options.value,
      multiple: false,
      readonly: true,
      placeholder: placeholder,
    };
  });

  const value = computed({
    get() {
      let value = props.modelValue;
      if (value === true) {
        return 1;
      }
      if (value === false) {
        return 0;
      }
      return value;
    },
    set(value) {
      console.log('value', value);

      if (props.modelValue !== value) {
        const val = value == null || value === '' ? undefined : !!value;
        emit('update:modelValue', val);
      }
    },
  });
  value.value = defaultValue;

  const showPopup = () => {
    if (useMore?.value || props.showIcon) return;
    showPop.value = true;
  };

  const onClear = () => {
    emit('update:modelValue', undefined);
  };

  defineExpose({});
</script>

<style scoped lang="less">
  .search-switch {
    :deep(.van-cell__value) {
      color: #333;
    }
  }

  .is-disabled {
    :deep(.van-field__control) {
      opacity: 0.5;
    }
  }
</style>
