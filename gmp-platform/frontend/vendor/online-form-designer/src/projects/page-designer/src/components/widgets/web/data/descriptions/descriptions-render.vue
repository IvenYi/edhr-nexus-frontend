<template>
  <div style="overflow: auto">
    <a-form :model="formState" ref="formRef" :layout="widget.props.layout" :key="forEachKey">
      <a-row>
        <a-col v-for="(child, index) in widget.children" :key="index" :span="getItemSpan()">
          <slot :formState="formState" :children="[child]"></slot>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="gct-descriptions">
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ref, reactive, computed, onMounted, nextTick, toRef, provide, toRefs } from 'vue';
  import { Descriptions } from '/@page-designer/types/web';
  import type { FormInstance } from 'ant-design-vue';
  import { setFormData } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { cloneDeep } from 'lodash-es';
  import { transformData } from '/@page-designer/components/widgets/hooks/utils';
  import { IDescriptionsComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const Event = getPageEvent();
  const props = defineProps<{ widget: Descriptions }>();
  const { modeldata, model, refSearch } = reactive(props.widget.props);
  const formState = reactive<{ [key: string]: any }>({
    _DICT: {}, //翻译的字段
    _OPCT: {}, //关联模型字段完全体
  });
  setFormData(props.widget.id, formState);
  const forEachKey = ref(props.widget.id);
  const formRef = ref<FormInstance>();

  const column = computed(() => {
    return props.widget.props.column || 1;
  });
  const { layout, hasLabelWidth, labelType, labelWidth, overLabelDisplay } = toRefs(
    props.widget.props,
  );
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
  const getItemSpan = (span?) => {
    // span是单独设置一项所占的列数，后期可兼容单独设置每项所占的列数
    let spanNum: number = 24 / column.value;
    return (span ? (span > column.value ? column.value : span) : 1) * spanNum;
  };

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
      setValue(data.data || {}, data.dict, data.metaDict);
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
    if (typeof data !== 'object') return;
    const formdata = transformData(data, dict);
    for (let k in formdata) {
      formState[k] = formdata[k];
    }
  }
  async function setValue(data, dict?: object, metaDict?: object) {
    if (typeof data !== 'object') return;
    for (let k in formState) {
      //重复赋值会错误清空
      if (k !== '_DICT' && k !== '_OPCT') {
        delete formState[k];
      }
    }
    const formdata = transformData(data, dict, metaDict);
    for (let k in formdata) {
      formState[k] = formdata[k];
    }
    return formdata;
  }
  async function reload(formID?: string) {
    const id = formID || formState.id_;
    if (!id) return;
    const { data, dict, metaDict } = await Event.context.$httpBizService(
      {
        key: model!,
        action: 'getById',
        modelCategory: modeldata?.modelCategory,
      },
      { id },
    );

    const formdata = await setValue(data, dict, metaDict);
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
  defineExpose<IDescriptionsComponentExpose>({
    deleteData,
    reload,
    addValue,
    getValue,
    setValue,
  });
</script>
<style scoped lang="less"></style>
