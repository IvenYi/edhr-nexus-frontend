<template>
  <a-form-item
    :label="label"
    :name="field"
    :rules="{
      required: widget.props.required,
      message: t('sys.notEmptySth', { sth: label }),
    }"
    :style="wrapperStyle"
  >
    <span v-if="readonly">{{ fieldValue?.toString() }}</span>
    <a-select
      v-else
      v-model:value="fieldValue"
      :mode="selectMode"
      :filter-option="filterOption"
      @change="onChange"
      @clear="onClear"
      @select="onSelect"
    >
      <a-select-option v-for="item in dataSource" :value="item.id_" :item="item">
        {{ item.name_ }}
      </a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-device-select">
  import { computed, reactive, ref, toRef, onMounted } from 'vue';
  import { ICusSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);

  const Event = getPageEvent();
  const props = defineProps<{
    modelValue?: string;
    widget: ICusSelect;
    formData: Object;
  }>();

  const {
    refForm,
    displayLabelText,
    initLoad,
    selectMode,
    readonly,
    field,
    customdataSource,
    datasourceConfig,
  } = reactive(props.widget?.props);

  const { wrapperStyle, labelFont, contentFont } = useStyle(props.widget);

  const refFormData = toRef(() => {
    const data: any = {};
    if (refForm) {
      return formMap.value[refForm];
    }
    return data;
  });

  const fieldValue = computed({
    get() {
      let value = props.modelValue || undefined;
      if (selectMode === 'multiple') {
        return value?.split(',').filter((i) => i) || [];
      }
      return value;
    },
    set(val) {
      const newVal = selectMode === 'multiple' ? (val as Array<string>).join(',') : val;
      emit('update:modelValue', newVal);
    },
  });

  const label = computed(() => {
    if (!displayLabelText) {
      return '';
    }
    return props.widget.props.label;
  });

  const dataSource = ref<any[]>([]);
  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            refFormData.value,
            datasourceConfig?.extraParams,
          )
      : undefined;
  async function queryOptionData(queryParam?) {
    try {
      if (initLoad && customApi) {
        const res = await customApi(queryParam);
        dataSource.value = res ?? [];
      }
      Event.runEventByName('onLoaded', props.widget.events, dataSource.value);
    } catch (err) {}
  }
  const filterOption = (inputValue, option) => {
    return option.item.name_.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  };

  function onChange(value, option) {
    const { item } = option;
    Event.runEventByName('onChange', props.widget.events, value, item);
  }

  function onSelect(value, option) {
    Event.runEventByName('afterSelect', props.widget.events, value, option);
  }

  function onClear() {
    Event.runEventByName('afterClear', props.widget.events);
  }

  onMounted(() => {
    queryOptionData();
  });

  defineExpose({
    setValue(value: string | string[]) {
      fieldValue.value = value;
    },
    getValue() {
      return fieldValue.value;
    },
    async reload(params?) {
      await queryOptionData(params);
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    &:has(div.label-wrap) {
      overflow: visible;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.ant-form-item-control) {
    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        text-align: v-bind('contentFont.textAlign');

        .ant-input,
        .ant-select .ant-select-selector,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }
</style>
