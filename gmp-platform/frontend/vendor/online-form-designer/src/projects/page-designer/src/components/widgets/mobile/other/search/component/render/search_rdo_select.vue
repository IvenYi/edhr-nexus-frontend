<template>
  <van-field
    v-bind="formAttr"
    v-model="fieldValue"
    style="padding: 0; background-color: transparent"
    :class="useMore && 'is-disabled'"
    @click="openView"
  >
    <template #input v-if="showValue || fieldlabel">
      <div>{{ showValue }}</div>
    </template>
    <template #button v-if="!showIcon">
      <van-icon v-if="showValue" name="clear" size="20" color="#c8c9cc" @click.stop="onClear" />
    </template>
  </van-field>
</template>

<script setup lang="ts">
  import { computed, reactive, toRefs, ref, onBeforeMount, toRaw, nextTick } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchSelect } from '/@page-designer/types/web';
  import type { FieldProps } from 'vant';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  // import moreOption from '../more_option.vue';
  import { EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
  import {
    getQueryDateByKeyWord,
    useQueryfilter,
    getIKeywordFieldKeys,
    getIExp,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import { createTreePopup, SelectType, TreeOptions } from '../../../../__components__/treePopup';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    modelCategory: string;
    showIcon: boolean;
    formData: object;
  }>();

  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const state = reactive(props.widget.props);
  const {
    label,
    field,
    fieldType,
    placeholder,
    moreOptions,
    ignoreOptions,
    selectType,
    bindModelKey,
    modelKey,
    searchField,
    refModelType,
    showSearch,
    datasourceConfig,
    customdataSource,
    datafilter,
    exp,
    readonly,
  } = state;

  const queryfilter = useQueryfilter(datafilter);
  const { ope, useMore } = toRefs(state);
  // const getAsyncOptions =
  //   customdataSource && datasourceConfig?.name
  //     ? (queryData) =>
  //         Event.runExportByName(
  //           datasourceConfig?.name,
  //           queryData,
  //           props.formData,
  //           datasourceConfig?.extraParams,
  //         )
  //     : getAsyncOptionsByRdo;

  const options = ref([]);
  const treeData = ref([]);
  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder: useMore?.value
        ? $t(`sys.model.${useMore?.value}`)
        : placeholder || $t('sys.pleaseSelectSth'),
      inputAlign: 'right',
      readonly,
      clickable: false,
      border: false,
    } as FieldProps;
  });

  const fieldlabel = ref();

  const showValue = computed(
    () => fieldlabel.value || (props.widget.props.readonly ? emptyDisplayValue.value : undefined),
  );

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  /**兼容老版本 */
  function getExpByData(exp, data) {
    const fileds = Object.keys(data);
    if (fileds.length && !exp) {
      return `OR(${fileds.join(',')})`;
    }
  }

  async function handleAsyncRdoData(keyword: string) {
    let queryData = {};
    let newExp = getIExp(exp, ignoreOptions);
    if (keyword) {
      treeData.value = [];
      const keywordFieldKeys = getIKeywordFieldKeys(searchField, ignoreOptions);
      queryData = keyword ? getQueryDateByKeyWord({ searchField: keywordFieldKeys, keyword }) : {};
      newExp = getExpByData(newExp, queryData) || newExp;
    }
    let res: any;
    if (customdataSource && datasourceConfig?.name) {
      res = await Event.runExportByName(
        datasourceConfig?.name,
        queryData,
        props.formData,
        datasourceConfig?.extraParams,
      );
    } else {
      res =
        (await postModelDataQueryRefData({
          fieldKey: field,
          modelKey,
          keyword: '',
          query: { ...queryData, ...queryfilter.query },
          exp: queryfilter.getExp(newExp),
          pageSize: 999,
          pageNo: 1,
          rmIfNoDefaultVersion: 0,
        })) || {};
    }
    const arr = res.data?.map((i: any) => {
      i.__CHILDREN__ || (i.__CHILDREN__ = []);
      const rdoLabel = i.__LABEL__ || i.name_;
      return {
        parentId: 'ROOT',
        label: rdoLabel,
        title: rdoLabel,
        value: i.id_,
        __LABEL__: i.__LABEL__,
        __SHOW_LABEL__: i.__SHOW_LABEL__,
        // hasChild: false,
        _info: i.__CHILDREN__.find((k) => k.default_ === 1),
        children: i.__CHILDREN__.map((j) => {
          const versionName = j.__LABEL__ || j.version_;
          return {
            parentId: j.base_id_,
            label: versionName,
            versionName: versionName,
            value: `${j.id_ ? i.id_ + ':' + j.id_ : i.id_}`,
            name: rdoLabel,
            default_: j.default_,
            hasChild: false,
            __LABEL__: j.__LABEL__,
            __SHOW_LABEL__: j.__SHOW_LABEL__,
            _info: { ...j },
          };
        }),
      };
    });
    return arr;
  }

  async function getAsyncOptionsByRdo(...args: any[]) {
    const { keyword } = args[0];
    treeData.value = await handleAsyncRdoData(keyword);
    const children = treeData.value?.map((i) => i.children).flat() || [];
    treeData.value?.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value!)) {
        options.value = [...options.value, ...treeData.value, ...children];
      }
    });
  }

  const fieldValue = computed<any>({
    get() {
      return props.modelValue?.[0];
    },
    set(value: string[]) {
      emit('update:modelValue', value ? [value] : null);
    },
  });

  const { openTreePopup } = createTreePopup({
    asyncApi: getAsyncOptionsByRdo,
    lazy: true,
    showSearch,
    options: options,
    ignoreCase: ignoreCase.value,
    showTag: (data) => data.default_ === true,
    customSearch: async (opts, val) => {
      if (searchField) {
        // const rdolist = await handleAsyncRdoData(val);
        // let list: any[] = [];
        // rdolist.forEach((item) => {
        //   list = [...list, ...item.children];
        // });
        // return rdolist || [];
        await getAsyncOptionsByRdo({ keyword: val });
        return treeData.value;
      } else {
        const list = opts?.filter((i: any) => i.parentId == 'ROOT');
        if (ignoreCase.value) {
          return list.filter((i) => i.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1) || [];
        } else {
          return list.filter((i) => i.label.indexOf(val) !== -1) || [];
        }
      }
    },
  });

  function openView() {
    if (useMore?.value || props.showIcon) return;

    openTreePopup({
      // ids: fieldValue.value,
      type: 'single',
      title: label,
      saved: async (id, data) => {
        if (data?.children?.length) {
          const defaultItem = data.children.find((i: any) => i.default_);
          fieldlabel.value =
            defaultItem.__SHOW_LABEL__ || `${defaultItem.name}:${defaultItem.label}`;
          fieldValue.value = defaultItem.value;
        } else {
          fieldlabel.value = data.__SHOW_LABEL__ || `${data.name}:${data.label}`;
          fieldValue.value = id;
        }
      },
    });
  }

  const onClear = () => {
    emit('update:modelValue', undefined);
    fieldlabel.value = null;
  };

  defineExpose({});
</script>
<style scoped lang="less">
  .is-disabled {
    :deep(.van-field__control) {
      opacity: 0.5;
    }
  }
</style>
