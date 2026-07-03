<template>
  <div class="model-ext-field-container-render" v-if="fieldWidgets.length">
    <a-collapse v-model:activeKey="activeNames" ghost class="gct-vant-item">
      <template #expandIcon>
        <down-outlined class="collapse-icon-down" />
      </template>
      <a-collapse-panel
        key="1"
        :collapsible="isSupportFold === '0' ? 'disabled' : ''"
        :showArrow="isSupportFold === '1'"
        forceRender
      >
        <template #header>
          <a-row class="w100%" type="flex" align="middle">
            <a-col
              :style="{
                padding: '8px 0',
              }"
            >
              <span class="gct-text-overflow w100% collapse-title">
                <span :style="{}" class="collapse-txt">{{ $t('sys.pageDesigner.otherInfo') }}</span>
              </span>
            </a-col>
          </a-row>
        </template>

        <form-render
          ref="modelExtFormRef"
          :widget="formWidget"
          v-slot="{ formState }"
          :style="widgetStyle"
        >
          <div
            class="grid"
            :style="{
              'grid-template-columns': `repeat(${rowLength ?? 2}, 1fr)`,
              gap: '0 8px',
            }"
          >
            <Widget
              :key="props.widget.id + Date.now()"
              :widgetlist="fieldWidgets"
              :formData="formState"
            />
          </div>
        </form-render>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts" setup>
  import { debounce } from 'lodash-es';
  import { computed, nextTick, onBeforeMount, reactive, ref, toRef, watch } from 'vue';
  import { IModelExtFieldContainer } from './schema';
  import { formMap } from '/@/projects/web-render/src/render/Event/utils/runGlobalByPage';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import Widget from '/@web-render/render/widget/index.vue';
  import FormRender from '/@page-designer/components/widgets/web/basic/form/form-render.vue';
  import {
    sortedArrayByFieldKey,
    useModelConfig,
  } from '/@/projects/web-render/src/views/edhr-application/render/model-config/useModelConfig';

  const props = defineProps<{
    widget: IModelExtFieldContainer;
  }>();

  const { rowLength, isSupportFold, defaultFold } = reactive(props.widget.props);
  const { labelFont, contentFont, wrapperStyle, wStyle } = useStyle(props.widget);
  console.log('props.widget: style!!!', wrapperStyle, wStyle);

  const { getModelFieldMeta, fieldSource } = useModelConfig();

  const modelExtFormRef = ref();

  const widgetStyle = computed(() => {
    return {
      backgroundColor: wStyle.value.backgroundColor,
      paddingTop: wStyle.value.paddingTop,
      paddingBottom: wStyle.value.paddingBottom,
      paddingLeft: wStyle.value.paddingLeft,
      paddingRight: wStyle.value.paddingRight,
    };
  });

  const actualActiveKeys = ref<string[]>(['1']);
  const activeNames = computed({
    get() {
      if (isSupportFold === '1' && defaultFold) {
        return [];
      }
      return actualActiveKeys.value;
    },
    set(val) {
      actualActiveKeys.value = val;
    },
  });

  const formWidget = computed(() => {
    const widget = props.widget.children[0];
    return widget;
  });

  const fieldWidgets = computed(() => {
    if (fieldSource.value?.length) {
      const widgets = props.widget.children[1]
        ?.filter((w) => {
          return fieldSource.value.find((f) => f.key === w.props.field);
        })
        ?.map((f) => {
          // 字段组件的相关属性需要去同步模型上字段的更新
          const dynamicFieldProps = fieldSource.value.find((i) => i.key === f.props.field);
          return {
            ...f,
            alias: dynamicFieldProps!.name,
            props: {
              ...f.props,
              fieldName: dynamicFieldProps!.name,
              label: dynamicFieldProps!.name,
              required: !formWidget.value?.props?.readonly && !!dynamicFieldProps!.required,
            },
          };
        });
      return sortedArrayByFieldKey(widgets, 'props.field');
    }

    return [];
  });

  const refFormData = toRef(() => {
    return formMap.value?.[props.widget.props.refForm] ?? {};
  });

  watch(
    refFormData,
    async () => {
      await nextTick();
      /**
       * 模型字段值同步
       * !addValue而不使用setValue能避免当前组件使用的表单值会与关联的refForm的数据造成混乱
       */
      debounce(() => {
        const formValue = {};
        for (let it of fieldSource.value) {
          const { key } = it;
          if (!key) return;

          formValue[key] = refFormData.value[key];
        }
        addValue(formValue, refFormData.value?._DICT);
      }, 200)();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  function addValue(data, dict?) {
    modelExtFormRef.value?.addValue(data, dict);
  }

  function setValue(data, dict?) {
    modelExtFormRef.value?.setValue(data, dict);
  }

  function getValue() {
    if (!fieldWidgets.value?.length) return {};

    const formData = modelExtFormRef.value?.getValue();
    const { _DICT, _OPCT, _NOSUBMIT } = formData ?? {};
    // 只返回设定的字段值和翻译相关信息
    const valueObj = {};
    fieldSource.value.forEach(({ key }: any) => {
      valueObj[key] = formData[key];
    });
    Object.assign(valueObj, {
      _DICT, //翻译的字段
      _OPCT, //关联模型字段完全体
      _NOSUBMIT, //需要不提交字段
    });

    return valueObj;
  }

  onBeforeMount(async () => {
    await getModelFieldMeta(props.widget.props.refModel);
  });

  defineExpose({
    addValue,
    setValue,
    getValue,
    validate: async () => {
      await modelExtFormRef.value?.validate();
    },
    clearValidate: async () => {
      await modelExtFormRef.value?.clearValidate();
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label > label) {
    color: v-bind('labelFont.color');
    font-size: v-bind('labelFont.fontSize');
  }
  :deep(.ant-form-item-control .ant-form-item-control-input-content) {
    font-size: v-bind('contentFont.fontSize');
    font-weight: v-bind('contentFont.fontWeight');
  }

  :deep(.ant-collapse-header) {
    padding: 0 !important;
    .collapse-title {
      display: flex;
      position: relative;
      align-items: center;
      padding-left: 6px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 3px;
        height: 16px;
        transform: translate(0, -50%);
        background: var(--ant-primary-color);
      }

      .collapse-txt {
        flex: 1;
        margin-left: 4px;
      }
    }
  }

  :deep(.ant-collapse-item-disabled > .ant-collapse-header) {
    color: #000000d9;
    cursor: auto !important;
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0 !important;
  }

  .collapse-icon-down {
    position: absolute;
    right: 0;
    bottom: 4px;
    transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
    font-size: 16px !important;
  }

  .ant-collapse-item-active {
    .collapse-icon-down {
      transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
    }
  }
</style>
