<template>
  <vantField
    :clearable="clearable"
    :props="widget.props"
    :style="widget.style"
    :clickable="!showReadonly"
    @click="showPopup"
  >
    <template #input>
      <FieldSelect v-bind="separatorAttr" v-model:value="value" />
    </template>
  </vantField>
  <van-popup v-model:show="show" position="bottom" teleport="body">
    <div class="flex flex-col h-full">
      <div class="text-center text-18px font-bold p12px leading-8 title">类型选择</div>
      <div class="overflow-y-scroll flex-1 mb-4px option-container">
        <van-cell
          @click="setVal(i)"
          :class="{
            'is-active': value === i.value,
          }"
          v-for="i in options"
          :key="i.value"
        >
          <template #title>
            <span>{{ i.label }}</span>
          </template>
          <template #right-icon>
            <div class="ks-row-middle">
              <van-icon name="success" class="text-18px primary-color" v-if="value === i.value" />
            </div>
          </template>
        </van-cell>
      </div>
    </div>
  </van-popup>
</template>

<script name="gct-dynamic-form-type" setup lang="ts">
  import { computed, toRefs, toRaw, nextTick, watch, ref, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import { has } from 'lodash-es';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useReadyonly } from '../../../hooks/useReadyonly';

  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const { field, readonly, clearable, placeholder, bindFieldKey } = toRaw(props.widget.props);

  const show = ref(false);

  const options = ref([
    {
      label: '布尔值',
      value: 'boolean',
    },
    {
      label: '精度小数',
      value: 'decimal',
    },
    {
      label: '整数',
      value: 'integer',
    },
    {
      label: '字符串',
      value: 'string',
    },
    // 暂时注释
    // {
    //   label: '模型对象',
    //   value: 'object',
    // },
    {
      label: '人员',
      value: 'user',
    },
    {
      label: '部门',
      value: 'org',
    },
    {
      label: '自定义下拉',
      value: 'select',
    },
    {
      label: '日期',
      value: 'date',
    },
    {
      label: '日期时间',
      value: 'date_time',
    },
  ]);

  const showReadonly = computed(() => useReadyonly(readonly, bindFieldKey));

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return value;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const separatorAttr = computed(() => {
    return {
      placeholder,
      readonly: showReadonly.value,
      disabled: false,
      fieldType: FIELD_TYPE.REF,
      type: props.widget.type,
      tagStyle: props.widget.style,
      options: options.value,
      multiple: false,
      supportTree: false,
    };
  });

  watch(
    [value, () => options.value],
    ([newValue, newOptions]) => {
      if (Array.isArray(newOptions) && newOptions.length !== 0 && newValue) {
        formData.value._OPCT || (formData.value._OPCT = {});
        formData.value._OPCT[field] = getOptionValue(newValue)?._item || {};
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = options.value.find((i) => i.value === v);
    return toRaw(data);
  }
  async function changeSelect(v) {
    await nextTick();
    let data = getOptionValue(v);
    console.log('data', data);
    Event.runEventByName('onChange', props.widget.events, value.value, data);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = data.label;
    }
  }

  const showPopup = () => {
    show.value = true;
  };

  const setVal = (data) => {
    emit('update:modelValue', data.value);
    changeSelect(data.value);
    show.value = false;
  };

  defineExpose({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less">
  .title {
    position: relative;
    z-index: 1;
    top: 0;
    width: 100%;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  .shadow-top {
    box-shadow: 0 -1px 4px 0 rgb(0 0 0 / 12%);
  }

  .option-container {
    min-height: 200px;
  }

  .is-active {
    color: var(--van-primary-color);
  }

  .border-r {
    border-right: 1px solid var(--van-cell-border-color);
  }

  .border-b {
    position: relative;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  :deep(.van-cell) {
    &::after {
      right: 0;
      left: 0;
    }
  }

  :deep(.van-search) {
    padding: 14px 16px;

    &.border-all {
      .van-search__content {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }

    .van-search__content {
      &:focus {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }
  }
</style>
