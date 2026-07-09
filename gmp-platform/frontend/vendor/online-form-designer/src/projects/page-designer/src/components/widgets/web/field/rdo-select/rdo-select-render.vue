<template>
  <div v-if="readonly">
    <FieldReadonly
      :label="
        tagValue || selectedOption?.full_name || selectedOption?.title || selectedOption?.label
      "
      :type="fieldType"
      :tagWidgetStyle="widget.style"
      :isDesign="false"
      :modelValue="value"
    />
  </div>

  <a-tree-select
    v-else-if="!displayFields?.length || displayFields.length === 1"
    v-model:value="value"
    v-model:searchValue="searchValue"
    style="width: 100%"
    :tree-data="treeData"
    show-search
    :placeholder="placeholder"
    :allowClear="clearable"
    :getPopupContainer="PopupContainer"
    @change="changeNode"
    @select="changeSelect"
    :disabled="disabled"
    :virtual="false"
    @dropdownVisibleChange="dropdownVisibleChange"
    @clear="clearValue"
    @search="search"
    :filterTreeNode="() => true"
    dropdown-class-name="gct-custom-select-dropdown vxe-table--ignore-clear"
    :dropdownMatchSelectWidth="180"
  >
    <template #title="item">
      <div v-if="item.label && !Object.prototype.hasOwnProperty.call(item, 'selected')">
        {{
          select_label_map[item.value] ||
          (isDisplayRule ? item._info.__SHOW_LABEL__ : '') ||
          item.full_name ||
          item.title ||
          item.label
        }}
        <span class="gct-custom-tag ml8px" v-if="item.children && item.children.length">{{
          t('sys.default')
        }}</span>
      </div>
      <div v-else-if="item.label">
        {{ item.versionName || item.label }}
        <span v-if="item.default_" class="version gct-custom-tag ml8px">
          {{ t('sys.default') }}
        </span>
      </div>

      <div v-else-if="item.title">
        <component v-if="item.title" :is="item.title" />
      </div>
      <div v-else>
        {{
          select_label_map[value] ||
          (isDisplayRule ? selectedOption._info.__SHOW_LABEL__ : '') ||
          selectedOption?.full_name ||
          selectedOption?.title ||
          selectedOption?.label ||
          value
        }}
        <span class="gct-custom-tag ml8px" v-if="value && !value.includes(':')">{{
          t('sys.default')
        }}</span>
      </div>
    </template>
  </a-tree-select>
  <a-select
    v-else
    v-model:value="value"
    :open="open"
    ref="cusSelectRef"
    style="width: 100%"
    :options="selectOptions"
    :placeholder="placeholder"
    option-label-prop="title"
    :disabled="disabled"
    :dropdownClassName="`gct-project-select-dropdown `"
    :dropdownMatchSelectWidth="false"
    :dropdownStyle="{
      minWidth: '600px',
    }"
    maxTagCount="responsive"
    allowClear
    :show-search="showSearch"
    @search="searchTable"
    :searchValue="searchValue"
    @click.capture="openModal"
    @clear="clearValue"
    showArrow
    @dropdownVisibleChange="visibleChange"
  >
    <template #dropdownRender>
      <div class="relative" @click.stop>
        <selectTable
          ref="selectTableRef"
          selectMode="single"
          :rowConfig="{ isCurrent: false }"
          :radioConfig="{ trigger: 'row' }"
          :getRdoAsyncOptions="getRdoTableData"
          :modelValue="value"
          :tableColumns="displayFields"
          @changeSelect="tableChangeSelect"
          :rdoVersion="rdoVersion"
          :searchValue="searchValue"
        />
      </div>
    </template>
  </a-select>
  <!-- <a-popover
    trigger="click"
    placement="bottomLeft"
    v-model:visible="open"
    @visibleChange="visibleChange"
    v-else
    overlayClassName="vxe-table--ignore-clear gct-custom-popover"
  >
    <template #content>
      <selectTable
        ref="selectTableRef"
        selectMode="single"
        :rowConfig="{ isCurrent: false }"
        :radioConfig="{ trigger: 'row' }"
        :getRdoAsyncOptions="getRdoTableData"
        :modelValue="value"
        :tableColumns="displayFields"
        @changeSelect="tableChangeSelect"
        :rdoVersion="rdoVersion"
        :searchValue="searchValue"
      />
    </template>

    <a-tree-select
      v-model:value="value"
      style="width: 100%"
      :tree-data="treeData"
      :placeholder="placeholder"
      :allowClear="clearable"
      :disabled="disabled"
      @clear="clearValue"
      dropdown-class-name="hidden"
      show-search
      @search="searchTable"
      @click.capture="openModal"
      :searchValue="searchValue"
    >
      <template #title="item">
        <div v-if="item.label && !Object.prototype.hasOwnProperty.call(item, 'selected')">
          {{
            select_label_map[item.value] ||
            item._info.__SHOW_LABEL__ ||
            item.full_name ||
            item.title ||
            item.label
          }}

          <span class="gct-custom-tag ml8px" v-if="item.children && item.children.length">{{
            t('sys.default')
          }}</span>
        </div>
        <div v-else-if="item.label">
          {{ item.versionName || item.label }}
          <span v-if="item.default_" class="version gct-custom-tag ml8px">
            {{ t('sys.default') }}
          </span>
        </div>
        <div v-else-if="item.title">
          <component v-if="item.title" :is="item.title" />
        </div>
        <div v-else>
          {{ selectedOption?.full_name || selectedOption?.label || value }}
          <span
            class="gct-custom-tag ml8px"
            v-if="selectedOption?.children && selectedOption?.children.length"
            >{{ t('sys.default') }}</span
          >
        </div>
      </template>
    </a-tree-select>
  </a-popover> -->
</template>

<script name="gct-rdo-select" setup lang="ts">
  import { computed, watch, toRaw, toRef, nextTick, toRefs, onMounted, ref, h } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/web';
  import FieldReadonly from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import { useAsyncOptions } from './hook';
  import {
    useQueryfilter,
    getParentPopupContainer,
    getQueryDateByKeyWord,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { message, Form } from 'ant-design-vue';
  import { cloneDeep, debounce } from 'lodash-es';
  import { watchDebounced, onClickOutside } from '@vueuse/core';
  import { IRdoSelectComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import selectTable from './select-table.vue';
  import { useRefCardData } from '/@page-designer/components/widgets/hooks/refCardList';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useI18n } from '/@/hooks/web/useI18n';

  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const props = withDefaults(
    defineProps<{
      disabled?: boolean;
      modelValue?: string;
      widget: Select;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      //getPopupContainer: (triggerNode) => document.body,
    },
  );
  useRefCardData(props);
  const selectTableRef = ref();
  const isDisplayRule = ref(false);
  const Event = getPageEvent();
  const selectOptions = ref([]);
  const cusSelectRef = ref();
  const PopupContainer = getParentPopupContainer(props);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const {
    placeholder,
    fieldType,
    field,
    autofillRules,
    enableAutofill,
    modelKey,
    clearable,
    bindModelKey,
    rdoVersion,
    datasourceConfig,
    customdataSource,
    ruleConfig,
    modeldata,
    exp,
    searchField,
    showSearch,
    datafilter,
    displayFields,
  } = toRaw(props.widget.props);
  /**关联的rdo 标识 */
  const rdoUniqueFieldKey = props.widget.props.rdoUniqueFieldKey || 'name_';
  const { readonly } = toRefs(props.widget.props);
  const queryfilter = useQueryfilter(datafilter);
  // 父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory;
  const open = ref(false);
  /** 关联模型状态字段信息 */
  const bindStateInfo = ref();
  /** 关联模型字段 状态exp和筛选项 */
  const bindStateQuery = ref();
  /** 已选中的但不在下拉框的数据 */
  const selectedOption = ref();
  /** 只读态回显选项 */
  const fieldObj = ref<any>({});
  /** 搜索关键字 */
  const searchValue = ref();
  /**记录选中项翻译map */
  const select_label_map = ref({});
  const operatingStateEnabled = ref(false);
  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            formData.value,
            datasourceConfig?.extraParams,
          )
      : undefined;
  const { getChildrens, getSelectOption, getAsyncOptions, treeData, getRdoAsyncOptions } =
    useAsyncOptions({
      fieldKey: field,
      modelKey,
      bindModelKey,
      customApi,
      modelCategory: EntityModelCategoryEnum.ENTITY,
      rdoUniqueFieldKey,
    });
  // 是否为数据连接模式
  const isLinkageMode = computed<boolean>(() => {
    if (
      ruleConfig &&
      ruleConfig.strongDependence === false &&
      !props.formData[ruleConfig.fieldKey]
    ) {
      return false;
    }
    if (ruleConfig) {
      return true;
    }
    return false;
  });

  // 数据连接模式下，监控连接项的值。在值变更时清空自身
  if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
    const key = ruleConfig.fieldKey;
    // eslint-disable-next-line vue/no-setup-props-destructure

    watch(
      () => props.formData[key],
      (val, oldVal) => {
        if (oldVal !== undefined && val !== oldVal) {
          value.value = null;
          treeData.value = [];
        }
      },
    );
  }

  async function dropdownVisibleChange(v) {
    if (!v) return;
    /**自定义数据源 打开时需要刷新 */

    if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false) || customApi) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldKey];
        if (isLinkageMode.value && !val) {
          message.error(`请先选择：${ruleConfig.fieldLabel}`);
          return;
        }
      }
      await getOptionsByQuery();
      // await getChildrens(value.value);
    }
  }

  const { formData } = toRefs(props);

  const value = computed<any>({
    get() {
      return props.modelValue || undefined;
    },
    set(v) {
      console.log(v, 3333);
      emit('update:modelValue', v || null);
    },
  });

  onMounted(async () => {
    await getBindModelstate();
    await getOptionsByQuery();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
    isDisplayRule.value =
      fieldInfo?.specificConfig?.displayRule && fieldInfo?.specificConfig?.displayRule?.exp;
    const option = await getSelectOption({ id_: props.modelValue });
    if (!option || !option?.value) return;
    if (option?.value === value.value) {
      // 如果等于父直接赋值给已选中但不在下拉框的数据
      selectedOption.value = option;
    } else {
      // 否则找子
      selectedOption.value = option.children.filter((i) => i.value === value.value)[0];
    }
    selectOptions.value = [
      {
        value: value.value,
        title: () =>
          selectedOption.value.children?.length
            ? h('div', [
                h(
                  'span',
                  `${
                    tagValue.value ||
                    selectedOption.value?.full_name ||
                    selectedOption.value?.title ||
                    selectedOption.value?.label
                  }`,
                ),
                h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
              ])
            : h('div', [
                h(
                  'span',
                  `${
                    tagValue.value ||
                    selectedOption.value?.full_name ||
                    selectedOption.value?.title ||
                    selectedOption.value?.label
                  }`,
                ),
              ]),
        label:
          tagValue.value ||
          selectedOption.value?.full_name ||
          selectedOption.value?.title ||
          selectedOption.value?.label,
      },
    ];
  });
  watchDebounced(
    value,
    async (v) => {
      //**监听如果分业内不存在id 就手动查询 */
      try {
        await getChildrens(value.value);
      } catch (error) {
        console.log(error);
      }
    },
    { debounce: 200 },
  );
  const search = debounce(async (keyword) => {
    await getOptionsByQuery(keyword, { pageNo: 1 });
    if (!keyword) {
      /**選中後初始化选项 */
      if (!operatingStateEnabled.value) {
        await getChildrens(value.value);
      }
    }
  }, 200);
  const searchTable = debounce((keyword) => {
    searchValue.value = keyword;
    selectTableRef.value.search(keyword, {
      pageNo: 1,
    });
  }, 200);

  const getBindModelstate = async () => {
    bindStateInfo.value = await FieldSchema.getConfigByModel(bindModelKey);

    operatingStateEnabled.value =
      bindStateInfo.value && bindStateInfo.value.specificConfig.operatingStateEnabled;
    if (bindStateInfo.value && bindStateInfo.value.specificConfig.operatingStateEnabled) {
      bindStateQuery.value = {
        exp: 'operating_state_.eq',
        query: {
          'operating_state_.eq': true,
        },
      };
    }
  };
  function getQueryByField(keyword) {
    const queryData = showSearch && keyword ? getQueryDateByKeyWord({ searchField, keyword }) : {};
    const queryExp = queryfilter.getExp(
      bindStateQuery.value?.exp
        ? showSearch && keyword
          ? `AND(${exp}, ${bindStateQuery.value?.exp})`
          : bindStateQuery.value?.exp
        : showSearch && keyword
          ? exp
          : '',
    );
    return { queryExp, query: { ...queryfilter.query, ...queryData } };
  }
  async function getOptionsByQuery(keyword?, opts: IData = {}): Promise<void> {
    const { queryExp, query } = getQueryByField(keyword);
    await getAsyncOptions({
      modelCategory,
      isLinkage: isLinkageMode.value,
      data: props.formData,
      ruleConfig,
      pageSize: 30,
      exp: queryExp,
      ...opts,
      queryData: { ...opts.queryData, ...query, ...bindStateQuery.value?.query },
      keyword: showSearch ? '' : keyword,
    });
  }

  async function getRdoTableData(keyword, opts) {
    const { queryExp, query } = getQueryByField(keyword);
    return getRdoAsyncOptions({
      modelCategory,
      isLinkage: isLinkageMode.value,
      data: props.formData,
      ruleConfig,
      exp: queryExp,
      ...opts,
      fieldKey: field,
      queryData: { ...query, ...bindStateQuery.value?.query },
      keyword: showSearch ? '' : keyword,
    });
  }

  const tagValue = toRef<string>(() => {
    const rdo = toRaw(findTreeDataById(value.value, treeData.value));
    fieldObj.value = rdo;
    if (rdo?._info?.__SHOW_LABEL__ && isDisplayRule.value) {
      return rdo?._info?.__SHOW_LABEL__;
    } else if (rdo?.versionName) {
      return rdo ? rdo.full_name : '';
    } else if (rdo?.title) {
      return rdo.title;
    } else if (rdo?.label) {
      return rdo.label;
    } else {
      return '';
    }
  });

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

  async function tableChangeSelect(node) {
    const { id_, base_id_, children, __DEFAULT__, __VALUE__, __LABEL__ } = node;
    const rdoValue = __VALUE__ || id_;
    const selectValue = {
      value: rdoValue,
      children,
      _info: !base_id_ ? __DEFAULT__ : node,
      __LABEL__,
    };
    value.value = rdoValue;

    if (rdoVersion !== false && node.children?.length) {
      const key = `${selectValue.value}:${selectValue._info.id_}`;
      value.value = key;
      const filter = node.children.filter((i) => i.default_)[0];
      const { id_, name_, version_, __SHOW_LABEL__ } = filter;
      const rdoLabel = __SHOW_LABEL__ || name_ + `:${version_}`;

      selectOptions.value = [
        {
          value: key,
          title: () => h('div', [h('span', `${rdoLabel}`)]),
          label: rdoLabel,
        },
      ];
    } else {
      const { id_, name_, version_, __SHOW_LABEL__ } = node;
      const rdoLabel =
        (isDisplayRule.value && node.__DEFAULT__?.__SHOW_LABEL__) ||
        __SHOW_LABEL__ ||
        name_ + (node.children?.length ? '' : `:${version_}`);
      selectOptions.value = [
        {
          value: rdoValue,
          title: () =>
            node.children?.length
              ? h('div', [
                  h('span', `${rdoLabel}`),
                  h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
                ])
              : h('div', [h('span', `${rdoLabel}`)]),
          label: rdoLabel,
          children: node.children,
        },
      ];
    }
    changeSelect(rdoValue, selectValue);
    changeNode(rdoValue);
    open.value = false;
    emit('saveTableRow');
  }
  watch(
    () => props.modelValue,
    async (val) => {
      if (val && (!selectOptions.value.length || selectOptions.value[0].value !== val)) {
        const option = await getSelectOption({ id_: props.modelValue });
        if (!option || !option?.value) return;
        if (option?.value === val) {
          // 如果等于父直接赋值给已选中但不在下拉框的数据
          selectedOption.value = option;
        } else {
          // 否则找子
          selectedOption.value = option.children.filter((i) => i.value === value.value)[0];
        }
        selectOptions.value = [
          {
            value: val,
            title: () =>
              selectedOption.value.children?.length
                ? h('div', [
                    h(
                      'span',
                      `${
                        tagValue.value ||
                        selectedOption.value?.full_name ||
                        selectedOption.value?.title ||
                        selectedOption.value?.label
                      }`,
                    ),
                    h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
                  ])
                : h('div', [
                    h(
                      'span',
                      `${
                        tagValue.value ||
                        selectedOption.value?.full_name ||
                        selectedOption.value?.title ||
                        selectedOption.value?.label
                      }`,
                    ),
                  ]),
            label:
              tagValue.value ||
              selectedOption.value?.full_name ||
              selectedOption.value?.title ||
              selectedOption.value?.label,
          },
        ];
      }
    },
  );
  async function changeSelect(v, node) {
    if (rdoVersion && node.children?.length) {
      const key = `${node.value}:${node._info.id_}`;
      value.value = key;
      // const id = node._info.id_;
      !!formData.value._DICT || (formData.value._DICT = {});
      formData.value._DICT[field] = {
        [key]: `${node.__LABEL__}:${node._info.__LABEL__ || node._info.version_}`,
      };
      const child = node.children.find((i) => i.value === key);
      child?.value && (select_label_map.value[child.value] = child?.full_name);
    } else {
      select_label_map.value[node.value] =
        (isDisplayRule.value && node._info.__SHOW_LABEL__) ||
        node.full_name ||
        node.title ||
        node.label;
    }
    formItemContext.onFieldChange();
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, value.value, node, formData.value);
  }
  async function changeNode(id) {
    await nextTick();
    emit('saveTableRow');
    const data = toRaw(findTreeDataById(id, treeData.value));
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [value.value]: tagValue.value };
    }
    if (!enableAutofill) return;
    //数据填充
    const info = await Event.context.$httpBizService(
      {
        action: 'rdoGetVersionById',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        id: id,
        includeSubModel: 1,
      },
    );
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = info?.data?.[fromField];
    });
  }
  function clearValue() {
    formData.value._DICT && (formData.value._DICT[field] = null);
    Event.runEventByName('afterClear', props.widget.events, formData.value);
  }
  function openModal(e) {
    if (open.value) {
      return;
    }
    open.value = true;
    selectTableRef.value?.search('', { pageNo: 1 });
  }
  const visibleChange = async (v) => {
    if (!v) return;

    if (props.disabled) {
      open.value = false;
      return;
    }
    if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false) || customApi) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldKey];
        if (isLinkageMode.value && !val) {
          message.error(`请先选择：${ruleConfig.fieldLabel}`);
          open.value = false;
          return;
        }
        selectTableRef.value?.search();
      }
    }
  };

  onClickOutside(
    selectTableRef,
    () => {
      open.value = false;
    },
    {
      ignore: [cusSelectRef],
    },
  );

  defineExpose<IRdoSelectComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        const data = cloneDeep(findTreeDataById(value.value, treeData.value));
        return data();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
      const data = cloneDeep(findTreeDataById(v, treeData.value));
      changeSelect(v, data);
      changeNode(v);
    },
    setOptions(data) {
      treeData.value = data;
    },
    async getOptions() {
      await getOptionsByQuery();
      return cloneDeep(treeData.value);
    },
    async reload() {
      if (!displayFields?.length || displayFields.length === 1) {
        await getOptionsByQuery();
        return;
      }
      selectTableRef.value?.search();
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-item) {
    user-select: text !important;
  }
</style>
