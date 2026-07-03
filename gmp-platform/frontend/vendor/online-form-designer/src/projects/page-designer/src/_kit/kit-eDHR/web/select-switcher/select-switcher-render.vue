<template>
  <div class="select-switcher-render">
    <a-form-item
      :label="title"
      :required="required"
      :readonly="readonly"
      :name="field"
      :rules="required ? [{ required: true, message: $t('sys.chooseText') }] : undefined"
    >
      <div class="container">
        <span class="text-muted" :title="computedShowLabel">{{ computedShowLabel }}</span>
        <a-dropdown
          v-if="optionList?.length"
          :placement="'bottomRight'"
          :readonly="readonly"
          trigger="click"
        >
          <template #overlay>
            <a-menu>
              <a-menu-item
                v-for="(option, index) in optionList"
                :key="index"
                :value="option.value"
                @click="handleMenuClick(option)"
              >
                {{ option.label }}
              </a-menu-item>
            </a-menu>
          </template>
          <swap-outlined class="text-muted--icon" />
        </a-dropdown>
      </div>
    </a-form-item>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref, nextTick, inject } from 'vue';
  import { ISelectSwitcher } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const props = defineProps<{
    modelValue?: string;
    formData: Object;
    widget: ISelectSwitcher;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const Event = getPageEvent();

  const { title, required, readonly, field, refModel, customdataSource, datasourceConfig } =
    reactive(props.widget.props);

  const labelLayout = inject('labelLayout');
  const { labelFont, contentFont } = useStyle(props.widget);

  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            props.formData,
            datasourceConfig?.extraParams,
          )
      : undefined;

  const fieldValue = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });
  const copyOptions = ref<Record<string, any>[]>([]);
  const computedShowLabel = computed(() => {
    if (!fieldValue.value) {
      return $t('sys.chooseText');
    }
    const currentItem = copyOptions.value.find((item) => item.value === fieldValue.value);
    return currentItem?.label || $t('sys.chooseText');
  });
  const optionList = computed(() => {
    return copyOptions.value.filter((item) => item.value !== fieldValue.value);
  });

  async function handleMenuClick(op) {
    fieldValue.value = op.value;
    // 等待 DOM 更新完成，确保 fieldValue.value 已更新
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, op, props.formData);
  }

  async function queryOptionData(queryParam?) {
    try {
      let res: any = null;
      copyOptions.value = [];
      if (customApi) {
        res = (await customApi(queryParam)) as any;
      } else {
        res = await Event.context.$customBizService.post(
          {
            key: refModel,
            action: 'listAll',
          },
          {
            query: queryParam,
          },
        );
      }
      copyOptions.value = (res.data ?? []).map((item) => {
        return {
          label: item.name_,
          value: item.id_,
          ...item,
        };
      });
      return copyOptions.value;
    } finally {
      console.log('copyOptions.value: at component', copyOptions.value);
      Event.runEventByName(
        'onLoaded',
        props.widget.events,
        fieldValue.value,
        copyOptions.value,
        props.formData,
      );
    }
  }

  onMounted(() => {
    queryOptionData();
  });

  defineExpose({
    reset: () => {
      fieldValue.value = undefined;
      copyOptions.value = [];
    },
    setValue: (value) => {
      fieldValue.value = value;
    },
    getValue: () => {
      return fieldValue.value;
    },
    setOptions: (options) => {
      copyOptions.value = options;
    },
    getOptions: () => {
      return copyOptions.value;
    },
    reload: queryOptionData,
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
  }
  .container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 24px;
    line-height: 24px;

    .text-muted {
      color: v-bind('contentFont.color');
      font-size: v-bind('contentFont.fontSize');
      font-style: v-bind('contentFont.fontStyle');
      font-weight: v-bind('contentFont.fontWeight');
      text-decoration-line: v-bind('contentFont.textDecorationLine');
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &--icon {
        font-size: v-bind('contentFont.fontSize');
        font-weight: v-bind('contentFont.fontWeight');
        background: #ffffff;
        height: 24px;
        width: 24px;
        border-radius: 0.25rem;
        border: 1px solid #e0e3ebff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
