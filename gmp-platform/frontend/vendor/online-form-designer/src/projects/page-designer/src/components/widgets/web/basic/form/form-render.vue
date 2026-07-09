<template>
  <a-form
    :class="{ 'overflow-y-auto': !!widget.style.height }"
    :model="formState"
    ref="formRef"
    :layout="widget.props.layout"
    scrollToFirstError
    :key="forEachKey"
  >
    <!-- {{ formState }} -->
    <slot :formState="formState" :children="widget.children" v-if="onload"></slot>
  </a-form>
</template>

<script setup lang="ts" name="gct-form">
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ref, reactive, provide, watch, toRef, onMounted, toRefs, nextTick } from 'vue';
  import { Form } from '/@page-designer/types/web';
  import type { FormInstance } from 'ant-design-vue';
  import { setFormData } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { cloneDeep } from 'lodash-es';
  import { addDataByForm, setDataByForm } from '/@page-designer/components/widgets/hooks/utils';
  import { ResetRuleType } from '@gct/runtime';
  import type { IFormComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const onload = ref(false);
  const Event = getPageEvent();
  /**表示必然走创建逻辑 */
  const _isCreated = ref(false);
  /**validateRule 子表模态框传入 自定义校验*/
  const props = defineProps<{ widget: Form; validateRule?: any[] }>();
  const { modeldata, model, validateRule = [] } = reactive(props.widget.props);
  const { layout, hasLabelWidth, labelType, labelWidth, overLabelDisplay } = toRefs(
    props.widget.props,
  );

  const formState = reactive<{ [key: string]: any }>({
    _DICT: {}, //翻译的字段
    _OPCT: {}, //关联模型字段完全体
    _NOSUBMIT: {}, //需要不提交字段
  });
  const forEachKey = ref(props.widget.id);
  const formRef = ref<FormInstance>();
  const formReadonly = toRef(() => props.widget.props.readonly);
  watch(formReadonly, () => {
    forEachKey.value = Math.random() + '';
  });
  provide('formReadonly', formReadonly);
  provide('validateRules', props.validateRule || validateRule);

  const labelLayout = toRef(() => {
    const width =
      layout?.value == 'horizontal' && !!hasLabelWidth?.value
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

  async function submit(formData = {}) {
    if (!model) return;
    await validate();
    const data = getValue();
    if (_isCreated.value) {
      data.id_ = undefined;
    }
    let res = await Event.context.$httpBizService(
      {
        key: model,
        action: 'submit',
        modelCategory: modeldata?.modelCategory,
      },
      { ...data, ...formData, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
    );
    return res;
  }
  async function reset(type: ResetRuleType = ResetRuleType.WIPE_DATA) {
    if (type === ResetRuleType.REFRESHDATA && formState.id_) {
      const id = formState.id_;
      formState.id_ = undefined;
      await reload(id);
    } else {
      setValue({ id_: formState.id_ });
      await formRef.value?.clearValidate();
      forEachKey.value = Math.random() + '';
    }
  }
  /**
   * 移除表单项的校验结果
   */
  async function clearValidate(nameList?: string | string[]) {
    await formRef.value?.clearValidate(nameList);
  }

  async function validate(nameList?: string[]) {
    try {
      await formRef.value?.validateFields(nameList);
    } catch (error) {
      let errorFields = error?.errorFields?.[0];
      if (errorFields) {
        const errorList = document.querySelectorAll('.ant-form-item-has-error');
        errorList[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return Promise.reject(error);
    }
  }
  function addValue(data, dict?: object) {
    addDataByForm(formState, data, dict);
  }
  async function setValue(data, dict?: object) {
    clearValidate();
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
    clearValidate();
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
    clearValidate();
  }
  function getValue() {
    formState.id_ = formState.id_ || undefined;
    if (formState._NOSUBMIT) {
      Object.values(formState._NOSUBMIT).forEach((key?: string) => {
        if (key && key?.includes(':')) {
          const [subId, id] = key.split(':');
          formState[subId].length &&
            (formState[subId] = formState[subId].map((p) => {
              return {
                ...p,
                [id]: undefined,
              };
            }));
        } else {
          key && (formState[key] = undefined);
        }
      });
    }

    return cloneDeep(formState);
  }
  onMounted(async () => {
    setFormData(props.widget.id, formState);
    /**保证form 表单数据优选初始化完成渲染完成组件 */
    setTimeout(() => {
      onload.value = true;
    }, 200);
  });

  defineExpose<IFormComponentExpose>({
    deleteData,
    reload,
    validate,
    clearValidate,
    addValue,
    getValue,
    setValue,
    submit,
    reset,
    copyData(data = formState) {
      const { name_ } = data;
      setValue!({
        ...data,
        name_: name_ ? `copy_of_${name_}` : null,
      });
      _isCreated.value = true;
    },
  });
</script>
<style scoped lang="less"></style>
