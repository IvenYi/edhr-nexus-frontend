<template>
  <a-form
    :model="formState"
    ref="formRef"
    :layout="widget.props.layout"
    scrollToFirstError
    :key="forEachKey"
  >
    <!-- {{ formState.id_ }}11 -->
    <slot :formState="formState" :children="widget.children" v-if="onload"></slot>
  </a-form>
</template>

<script setup lang="ts" name="gct-rdo-form">
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ref, reactive, watch, provide, toRef, onMounted, nextTick } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { setFormData } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { cloneDeep, merge } from 'lodash-es';
  import { addDataByForm, setDataByForm } from '/@page-designer/components/widgets/hooks/utils';
  import { ITxnDataCollection } from './schema';
  import { ResetRuleType } from '@gct/runtime';
  import { IRdoFormComponentExpose } from '/@/projects/page-designer/src/interface';

  const Event = getPageEvent();
  const onload = ref(false);
  const props = defineProps<{ widget: ITxnDataCollection }>();
  /**表示必然走创建逻辑 */
  const _isCreated = ref(false);
  /**表示版本名称禁用 */
  const _disabledName = ref(false);
  const formState = reactive<{ [key: string]: any }>({
    _DICT: {}, //翻译的字段
    _OPCT: {}, //关联模型
    _NOSUBMIT: {}, //需要不提交字段
    name_: '',
    version_: '',
    default_: false,
  });
  onMounted(async () => {
    setFormData(props.widget.id, formState);
    setTimeout(() => {
      onload.value = true;
    }, 200);
    /**保证form 表单数据优选初始化完成渲染完成组件 */
  });
  const formRef = ref<FormInstance>();
  const forEachKey = ref(props.widget.id);
  const { model, modeldata } = props.widget.props;

  const formReadonly = toRef(() => props.widget.props.readonly);
  watch(formReadonly, () => {
    forEachKey.value = Math.random() + '';
  });
  provide('formReadonly', formReadonly);
  provide('_disabled_rdoname', _disabledName);
  async function submit() {
    if (!model) return;
    await validate();
    const { base_id_, id_ } = formState;
    if (id_ && !_isCreated.value) {
      await uploadForm('rdoUpdateVersionById', id_);
    } else if (base_id_) {
      await saveForm('rdoSaveVersion');
    } else {
      await saveForm('rdoSave');
    }
  }
  async function saveForm(action) {
    const data = getValue();
    let id = await Event.context.$httpBizService(
      {
        key: model!,
        action,
        modelCategory: modeldata?.modelCategory,
      },
      { ...data, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
    );
    return id;
  }
  async function uploadForm(action, id) {
    const data = getValue();
    await Event.context.$httpBizService(
      {
        key: model!,
        action,
        modelCategory: modeldata?.modelCategory,
      },
      { ...data, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
      { id },
    );
  }
  /**
   * 表单重置
   */
  async function reset(type: ResetRuleType = ResetRuleType.WIPE_DATA) {
    if (type === ResetRuleType.REFRESHDATA && formState.id_) {
      const id = formState.id_;
      formState.id_ = undefined;
      await reload(id);
    } else {
      const name_ = _disabledName.value ? formState.name_ : '';
      setValue({ name_, id_: formState.id_ });
      await clearValidate();
      forEachKey.value = Math.random() + '';
    }
  }
  /**
   * 移除表单项的校验结果
   */
  async function clearValidate() {
    await formRef.value?.clearValidate();
  }

  /**
   * 表单校验
   */
  async function validate() {
    try {
      await formRef.value?.validate();
    } catch (error) {
      let errorFields = error?.errorFields?.[0];
      if (errorFields) {
        // let msg = errorFields?.errors?.[0];
        // msg && Message.warning(msg);
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
  /**
   * 删除当前表单数据
   * @param id
   */
  async function deleteData() {
    if (!formState.id_) return;
    await Event.context.$httpBizService(
      {
        key: model!,
        action: 'rdoRemoveVersionById',
        modelCategory: modeldata?.modelCategory,
      },
      { id: formState.id_ },
    );
    await setValue({});
    clearValidate();
  }
  async function reload(formID?: string) {
    const id = formID || formState.id_;
    if (!id) return;
    const { data, dict } = await Event.context.$httpBizService(
      {
        key: model!,
        action: 'rdoGetVersionById',
        modelCategory: modeldata?.modelCategory,
      },
      { id },
    );
    clearValidate();
    const formdata = await setValue(data, dict);
    return formdata;
  }
  function getValue() {
    formState.id_ = formState.id_ || undefined;
    formState.default_ = formState.default_ || false;
    if (formState._NOSUBMIT) {
      Object.values(formState._NOSUBMIT).forEach((key?: string) => {
        key && (formState[key] = undefined);
      });
    }
    return cloneDeep(formState);
  }
  defineExpose<IRdoFormComponentExpose>({
    reload,
    deleteData,
    reset,
    clearValidate,
    validate,
    addValue,
    getValue,
    setValue,
    submit,
    copyData(data = formState) {
      const { name_ } = data;
      setValue!({
        ...data,
        name_: name_ ? `copy_of_${name_}` : null,
        base_id_: null,
        default_: false,
      });
      _isCreated.value = true;
    },
    copyVersion(data = formState) {
      const { version_ } = data;
      setValue!({
        ...data,
        version_: version_ ? `copy_of_${version_}` : null,
        default_: false,
      });
      _isCreated.value = true;
      _disabledName.value = true;
    },
    createVersion(data = formState) {
      const { name_, id_, base_id_ } = data;
      setValue!({ name_, base_id_: base_id_ || id_ });
      _isCreated.value = true;
      _disabledName.value = true;
    },
  });
</script>
<style scoped lang="less"></style>
