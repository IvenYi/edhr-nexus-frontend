<template>
  <vantField
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :is-link="!fieldText"
    readonly
    clearable
    @update:model-value="changeSelect"
    @click="openView"
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="fieldText">
      <taglabel v-bind="separatorAttr" />
      <van-tag
        v-if="!rdoVersion && checkOption?.children?.length"
        color="#EFF3FA"
        size="medium"
        style="margin-left: 4px; border-radius: 4px; color: var(--van-primary-color)"
      >
        {{ $t('sys.default') }}
      </van-tag>
    </template>
  </vantField>
</template>

<script name="gct-rdo-select" setup lang="ts">
  import { ref, computed, watch, toRaw, toRef, nextTick, toRefs, inject, onBeforeMount } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import { createTreePopup, SelectType, TreeOptions } from '../../__components__/treePopup';
  import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';
  import { IMobRdoSelectComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  const layout: any = inject('form-layout', {});
  const props = defineProps<{ modelValue?: string; widget: Select; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const searchValue = ref();
  const {
    field,
    label,
    fieldName,
    autofillRules,
    enableAutofill,
    modelKey,
    bindModelKey,
    fieldType,
    datafilter,
    exp,
    modeldata,
    rdoVersion,
  } = toRaw(props.widget.props);
  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
  const { formData } = toRefs(props);
  const isDisplayRule = ref(false);
  const queryfilter = useQueryfilter(datafilter);
  // 父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory;
  /** 关联模型字段 状态exp和筛选项 */
  const bindStateQuery = ref();
  const treeData = ref<TreeOptions[]>([]);

  const checkOption = ref();
  const fieldText = toRef(() => {
    const maps = (treeData.value?.map((i) => i.children).flat() || []).concat(treeData.value);
    const data = maps.find((i) => i.value === fieldValue.value);
    checkOption.value = data;
    if (rdoVersion && data?.children?.length) {
      const defaultVersion = data?.children.filter((i) => i.default_)[0];
      console.log('defaultVersion', defaultVersion);

      return (
        defaultVersion &&
        (defaultVersion.__SHOW_LABEL__ ||
          (defaultVersion?.name
            ? defaultVersion?.name + ':' + defaultVersion?.label
            : defaultVersion.label))
      );
    }
    return (
      data &&
      ((isDisplayRule.value && data?._info?.__SHOW_LABEL__) ||
        data.__SHOW_LABEL__ ||
        (data?.name ? data?.name + ':' + data?.label : data.label))
    );
  });

  const options = ref<any[]>([]);
  // const pageNos = ref<any[]>([]);

  onBeforeMount(async () => {
    //   getAsyncOptions();
    await getBindModelstate();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
    isDisplayRule.value =
      fieldInfo?.specificConfig?.displayRule && fieldInfo?.specificConfig?.displayRule?.exp;
  });

  const { openTreePopup } = createTreePopup({
    asyncApi: getAsyncOptions,
    lazy: true,
    showSearch: true,
    options: options,
    showTag: (data) => data.default_ === true,
    customSearch: (opts, val) => {
      const list = opts?.filter((i: any) => i.parentId == 'ROOT');
      return list.filter((i) => i.label?.indexOf(val) !== -1) || [];
    },
    // showBtnArea: (data) => {
    //   return data.checkedId && data.checkedData.parentId !== 'ROOT';
    // },
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: fieldText.value || '',
    };
  });

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = '';
    await nextTick();
  }
  const getBindModelstate = async () => {
    if (bindModelKey) {
      const bindStateInfo = await FieldSchema.getConfigByModel(bindModelKey);
      if (bindStateInfo && bindStateInfo.specificConfig.operatingStateEnabled) {
        bindStateQuery.value = {
          exp: 'operating_state_.eq',
          query: {
            'operating_state_.eq': true,
          },
        };
      }
    }
  };
  async function getAsyncOptions(...args: any[]) {
    // if (pageNos.value.includes(args[0]?.pageNo)) {
    //   return;
    // }
    const res: any =
      (await postModelDataQueryRefData({
        fieldKey: field,
        modelKey,
        keyword: searchValue.value,
        query: { ...args[0]?.queryData, ...queryfilter.query, ...bindStateQuery.value?.query },
        exp: queryfilter.getExp(
          bindStateQuery.value?.exp
            ? exp
              ? `AND(${(exp, bindStateQuery.value?.exp)})`
              : bindStateQuery.value?.exp
            : exp
              ? exp
              : '',
        ),
        pageSize: 999,
        pageNo: args[0]?.pageNo || 1,
      })) || {};
    treeData.value = res.data?.map((i: any) => {
      i.__CHILDREN__ || (i.__CHILDREN__ = []);
      const rdoLabel = i.__LABEL__ || i.name_;
      return {
        parentId: '',
        label: rdoLabel,
        title: rdoLabel,
        value: i.id_,
        __SHOW_LABEL__: i.__SHOW_LABEL__,
        __LABEL__: i.__LABEL__,
        // hasChild: false,
        _info: i.__CHILDREN__.find((k) => k.default_),
        children: i.__CHILDREN__.map((j) => {
          const versionName = j.__LABEL__ || j.version_;
          return {
            parentId: j.base_id_,
            label: versionName,
            versionName: versionName,
            __SHOW_LABEL__: j.__SHOW_LABEL__,
            __LABEL__: j.__LABEL__,
            value: `${j.id_ ? i.id_ + ':' + j.id_ : i.id_}`,
            name: rdoLabel,
            default_: j.default_,
            hasChild: false,
            _info: { ...j },
          };
        }),
      };
    });
    const children = treeData.value?.map((i) => i.children).flat() || [];
    treeData.value.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value)) {
        options.value = [...options.value, ...treeData.value, ...children];
      }
    });
    // await getChildrens(fieldValue.value);
    // pageNos.value.push(res.pageNo);
    return res.pageNo === res.totalPage;
  }

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          return props.modelValue;
        },
        set(v) {
          emit('update:modelValue', v);
        },
      })
    : ref();

  /**
   * 递归查找获取选中树结构中的值
   */
  function findTreeDataById(leafValue: string, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (leafValue === nodes[i].value) {
        return nodes[i];
      }
      if (nodes[i].children) {
        let findResult = findTreeDataById(leafValue, nodes[i].children);
        if (findResult) {
          return findResult;
        }
      }
    }
  }

  async function changeSelect(v, node) {
    Event.runEventByName('onChange', props.widget.events, node);
  }

  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data);
    formData.value._OPCT[field] = undefined;
    formData.value._DICT[field] = undefined;
  }

  async function changeNode(value) {
    await nextTick();
    if (!value) {
      Event.runEventByName('afterClear', props.widget.events);
    }
    const data = toRaw(findTreeDataById(value, treeData.value));
    if (!enableAutofill) return;
    //数据填充
    const info = await Event.context.$httpBizService(
      {
        action: 'rdoGetVersionById',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        id: value,
        includeSubModel: 1,
      },
    );
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = info?.data?.[fromField];
    });
  }
  /**
   * 补全查询
   * @param v
   */
  async function getChildrens(v: any) {
    if (!v) return;
    const id = v?.split(':')[0];
    const add = treeData.value?.find((i) => i.value === id);
    if (add) return Promise.reject();
    await getAsyncOptions();
    const findItem = treeData.value?.find((i) => i.value === id);
    if (findItem) return Promise.reject();
    const { data = [] } = (await Event.context.$httpBizService(
      { action: 'rdoListVersionById', key: bindModelKey },
      {
        id,
      },
    )) as { data: any[] };
    const { base_id_, name_, __LABEL__, __SHOW_LABEL__ } = data[0] || {};
    const rdoLabel = __LABEL__ || name_ || '';
    if (!base_id_) return Promise.reject();
    const children = data.map((i) => {
      const versionName = i.__LABEL__ || i.version_;
      return {
        label: versionName,
        versionName: versionName,
        value: `${i.base_id_}:${i.id_}`,
        name: rdoLabel,
        __LABEL__: i.__LABEL__,
        __SHOW_LABEL__: i.__SHOW_LABEL__,
        _info: { ...i },
      };
    });
    const _info = data.find((k) => k.default_ === 1);
    const row: any = {
      value: base_id_,
      label: name_,
      __LABEL__,
      __SHOW_LABEL__,
      title: rdoLabel,
      children,
      _info,
    };
    treeData.value?.push(row);
  }

  watch(
    fieldValue,
    async (v) => {
      //**监听如果分业内不存在id 就手动查询 */
      if (!v) return;
      try {
        await getChildrens(v);
      } catch (error) {
        console.log(error);
      }
    },
    { immediate: true },
  );

  const getOptionValue = (id) => {
    const maps = treeData.value?.map((i) => i.children).flat() || [];
    const data = maps.find((i: any) => i.value === id);
    return data;
  };

  function openView() {
    openTreePopup({
      // ids: fieldValue.value,
      type: SelectType.SINGLE,
      title: label || fieldName,
      checked: async (id) => {
        await nextTick();
        const data = getOptionValue(id);
        await Event.runEventByName('afterSelect', props.widget.events, id, data, formData.value);
      },
      saved: async (id, data) => {
        fieldValue.value = id;
        await nextTick();
        Event.runEventByName(
          'onChange',
          props.widget.events,
          fieldValue.value,
          data,
          formData.value,
        );
        changeNode(fieldValue.value);
      },
    });
  }

  defineExpose<IMobRdoSelectComponentExpose>({
    getValue() {
      return fieldValue.value;
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-item) {
    .version {
      display: none;
    }
  }

  .ant-select-tree-title {
    .name {
      display: none;
    }
  }
</style>
<style lang="less" scoped>
  .rdo-select-wrap {
    &::after {
      content: ' ';
      position: absolute;
      right: var(--van-padding-md);
      bottom: 0;
      left: var(--van-padding-md);
      box-sizing: border-box;
      transform: scaleY(0.5);
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  :deep(.van-cell__right-icon) {
    padding: v-bind("layout.inputBg?'10px 0':''");
    line-height: inherit;
  }
</style>
