<template>
  <!-- {{ formState }} -->
  <div style="overflow: auto">
    <van-form
      ref="formRef"
      :key="forEachKey"
      :label-align="widget.props?.layout?.label"
      :input-align="widget.props?.layout?.inputAlign"
      :label-width="labelLayout.width"
    >
      <slot :formState="formState" :children="children"></slot>
    </van-form>
  </div>
</template>

<script setup lang="ts" name="gct-descriptions">
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ref, reactive, toRefs, provide, onMounted, toRef } from 'vue';
  import { Descriptions } from '/@page-designer/types/mobile';
  import type { FormInstance } from 'vant';
  import { setFormData } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { cloneDeep } from 'lodash-es';
  import { addDataByForm, setDataByForm } from '/@page-designer/components/widgets/hooks/utils';
  import { IMobDescriptionsComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const Event = getPageEvent();
  const props = defineProps<{ widget: Descriptions }>();
  // 表单的输入框背景是否开启需要provide下去
  const layout = toRef(() => props.widget.props.layout || {});
  const labelLayout = toRef(() => {
    const width =
      layout?.value.label === 'left' && !!props.widget.props.hasLabelWidth
        ? props.widget.props.labelWidth + (props.widget.props.labelType == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: layout?.value,
      hasLabelWidth: props.widget.props.hasLabelWidth,
      overLabelDisplay: props.widget.props.overLabelDisplay,
    };
  });

  provide('labelLayout', labelLayout);
  provide('form-layout', layout);
  const { children } = toRefs(props.widget);
  const { model, modeldata, refSearch } = reactive(props.widget.props);
  const forEachKey = ref(props.widget.id);
  const formState = reactive<{ [key: string]: any }>({
    _DICT: {}, //翻译的字段
    _OPCT: {}, //关联模型字段完全体
  });
  setFormData(props.widget.id, formState);
  const formRef = ref<FormInstance>();

  onMounted(async () => {
    getSearchParams(refSearch);
  });

  async function getDataSource(queryData?) {
    let { query } = Object.assign({}, queryData);
    try {
      let data = (await Event.context.$httpBizService(
        {
          action: 'getOne',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        {
          query: { ...query },
        },
      )) as any;
      setValue(data.data || {}, data.dict);
    } catch (error) {
      console.log(error);
    }
  }

  async function search(queryData) {
    /**查询 */
    await getDataSource(queryData);
  }

  const getSearchParams = async (key) => {
    if (key) Event.initSearchs(key, search, props.widget.id);
  };

  function addValue(data, dict?: object) {
    addDataByForm(formState, data, dict);
  }
  async function setValue(data, dict?: object) {
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
    const _DICT = Object.keys(data).reduce((total, curr) => {
      let map = dict[curr],
        value = data[curr];
      if (map && value) {
        value = value.split(',').map((k) => map[k]);
      }
      total[curr] = value;
      return total;
    }, {});
    await setValue({});
    const formdata = { ...data, _DICT, _OPCT: {} };
    await setValue(formdata);
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
  }
  function getValue() {
    formState.id_ = formState.id_ || undefined;
    if (formState._NOSUBMIT) {
      Object.values(formState._NOSUBMIT).forEach((key?: string) => {
        key && (formState[key] = undefined);
      });
    }

    return cloneDeep(formState);
  }
  defineExpose<IMobDescriptionsComponentExpose>({
    addValue,
    setValue,
    getValue,
    deleteData,
    reload,
  });
</script>
<style scoped lang="less">
  :deep(.van-cell) {
    align-items: center;
    padding: 14px 12px;
    background: inherit;
  }
</style>
