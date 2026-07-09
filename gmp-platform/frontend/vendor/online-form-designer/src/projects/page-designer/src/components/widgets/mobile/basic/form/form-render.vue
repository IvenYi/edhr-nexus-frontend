<template>
  <van-form
    ref="formRef"
    :key="forEachKey"
    :label-align="widget.props?.layout?.label"
    :input-align="widget.props.layout.inputAlign"
    :label-width="labelLayout.width"
    required="auto"
  >
    <slot :formState="formState" :children="children" v-if="onload"></slot>
  </van-form>
</template>

<script setup lang="ts" name="gct-form">
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    ref,
    reactive,
    toRefs,
    onBeforeMount,
    onMounted,
    watchEffect,
    provide,
    toRef,
    nextTick,
  } from 'vue';
  import { Form } from '/@page-designer/types/mobile';
  import type { FormInstance } from 'vant';
  import { setFormData } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { showToast } from 'vant';
  import { cloneDeep, merge } from 'lodash-es';
  import { addDataByForm, setDataByForm } from '/@page-designer/components/widgets/hooks/utils';
  import { ResetRuleType } from '@gct/runtime';
  import { IMobFormComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const onload = ref(false);
  const Event = getPageEvent();
  const props = defineProps<{ widget: Form }>();
  // 表单的输入框背景是否开启需要provide下去
  const { hasLabelWidth, labelType, labelWidth, overLabelDisplay } = toRefs(props.widget.props);
  const layout = toRef(() => props.widget.props.layout || {});
  provide('form-layout', layout);
  const { children } = toRefs(props.widget);
  const { model, modeldata, validateRule } = props.widget.props;
  const forEachKey = ref(props.widget.id);
  const formState = reactive<{ [key: string]: any }>({
    _DICT: {}, //翻译的字段
    _OPCT: {}, //关联模型字段完全体
    _NOSUBMIT: {}, //需要不提交字段
  });
  onMounted(async () => {
    setFormData(props.widget.id, formState);
    /**保证form 表单数据优选初始化完成渲染完成组件 */
    setTimeout(() => {
      onload.value = true;
    }, 200);
  });
  const formRef = ref<FormInstance>();
  const formReadonly = toRef(() => props.widget.props.readonly);

  provide('formReadonly', formReadonly);
  provide('validateRule', validateRule);

  const labelLayout = toRef(() => {
    const width =
      layout?.value.label === 'left' && !!hasLabelWidth?.value
        ? labelWidth?.value + (labelType?.value == 'percent' ? '%' : 'px')
        : '';
    return {
      width,
      layout: layout?.value,
      hasLabelWidth: hasLabelWidth?.value,
      overLabelDisplay: overLabelDisplay?.value,
    };
  });
  provide('labelLayout', labelLayout);
  onBeforeMount(() => {});
  onMounted(() => {});
  watchEffect(() => {});
  async function submit() {
    if (!model) return;
    await validate();
    const data = getValue();
    let res = await Event.context.$httpBizService(
      {
        key: model,
        action: 'submit',
        modelCategory: modeldata?.modelCategory,
      },
      { ...data, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
    );
    // formState.id_ = res;
    return res;
  }
  async function reset(type: ResetRuleType = ResetRuleType.WIPE_DATA) {
    // ! vant的form 表单不支持resetFields，所以需要手动去重置表单
    // ! https://github.com/youzan/vant/issues/6058
    if (type === ResetRuleType.REFRESHDATA && formState.id_) {
      await reload();
    } else {
      setValue({ id_: formState.id_ });
      forEachKey.value = Math.random() + '';
      resetValidation();
    }
  }
  /**4
   * 移除表单项的校验结果
   */
  async function resetValidation() {
    await formRef.value?.resetValidation();
  }
  async function validate() {
    await formRef.value?.validate().catch((err) => {
      const { message, name } = err[0];
      showToast(message);
      formRef.value?.scrollToField(name);
      return Promise.reject(err);
    });
  }

  function addValue(data, dict?: object) {
    addDataByForm(formState, data, dict);
  }
  async function setValue(data, dict?: object) {
    resetValidation();
    setDataByForm(formState, data, dict);
    setFormData(props.widget.id, formState);
    return formState;
  }
  async function reload(formID?: string) {
    const id = formID || formState.id_;
    if (!id) return;
    const { data, dict } = await Event.context.$httpBizService(
      {
        key: model!,
        action: 'getById',
        modelCategory: modeldata?.modelCategory,
      },
      { id },
    );
    resetValidation();
    const formdata = await setValue(data, dict);
    return formdata;
  }
  /**
   * 删除当前表单数据
   * @param id
   */
  async function deleteData() {
    if (!formState.id_) return;
    await Event.context.$httpBizService(
      {
        key: model!,
        action: 'removeById',
        modelCategory: modeldata?.modelCategory,
      },
      { id: formState.id_ },
    );
    await setValue({});
    resetValidation();
  }
  function getValue() {
    formState.id_ = formState.id_ || undefined;
    if (formState._NOSUBMIT) {
      Object.values(formState._NOSUBMIT).forEach((key?: string) => {
        key && (formState[key] = undefined);
      });
    }
    Object.values(formState).forEach((key?: string) => {
      if (Array.isArray(key)) {
        // 实现子表如果隐藏，也将其字段设置为undefined
        key.forEach((item) => {
          if (item._NOSUBMIT) {
            Object.values(item._NOSUBMIT).forEach((p?: string) => {
              p && (item[p] = undefined);
            });
          }
        });
      }
    });
    return cloneDeep(formState);
  }
  defineExpose<IMobFormComponentExpose>({
    reload,
    addValue,
    setValue,
    getValue,
    submit,
    reset,
    validate,
    deleteData,
  });
</script>
<style scoped lang="less">
  :deep(.van-cell) {
    align-items: flex-start;
    padding: 14px 12px;
    border-bottom: v-bind("(layout.label == 'top' && !layout.inputBg)?'1px solid #e8ebf0':''");
    background: inherit;

    & > .van-field__value > .van-field__body > .van-field__button {
      line-height: 1;
    }

    &::after {
      border: 0;
    }
    // van-cell 嵌套时样式处理
    .van-cell {
      border-bottom: 0;

      .van-cell__value {
        min-height: 24px;
      }
    }
  }

  :deep(.van-field__value) {
    overflow: hidden;
  }

  :deep(.van-cell) {
    padding: 12px;
  }
</style>
