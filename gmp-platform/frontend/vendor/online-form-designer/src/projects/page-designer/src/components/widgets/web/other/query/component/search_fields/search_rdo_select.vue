<template>
  <div v-if="readonly">{{ tagValue || emptyDisplayValue }}</div>
  <div class="ks-row-middle" v-else>
    <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
      <a-tree-select
        v-if="!displayFields?.length || displayFields.length === 1"
        style="width: 100%"
        v-model:value="value"
        v-bind="separatorAttr"
        :tree-data="treeData"
        :showCheckedStrategy="rdoVersion === false ? TreeSelect.SHOW_ALL : TreeSelect.SHOW_CHILD"
        :virtual="false"
        treeNodeLabelProp="label"
        treeDefaultExpandAll
        v-model:treeExpandedKeys="expandKeys"
        :show-search="showSearch"
        @select="changeSelect"
        @search="handleSearch"
        @change="emit('tableSearch')"
        :disabled="disabled || !!useMore"
        :dropdownClassName="dropdownRefKey"
        @dropdownVisibleChange="dropdownVisibleChange"
        :multiple="multiple"
        v-model:searchValue="pagination.keyword"
        :dropdownMatchSelectWidth="180"
        showArrow
        :filterTreeNode="() => true"
      >
        <template #tagRender="data">
          <tag style="margin: 2px 5px 2px 0">
            <span>{{
              select_label_map[data.value] ||
              (isDisplayRule && data.option._info.__SHOW_LABEL__) ||
              data.option.full_name ||
              data.option.title ||
              data.option.label
            }}</span>
            <span v-if="data.value.includes(':') && rdoVersion === false" class="version ml8px">{{
              t('sys.default')
            }}</span>
            <IconNext
              v-if="data.closable"
              :size="15"
              :value="'icon-park:close-small'"
              :style="{
                verticalAlign: 'text-bottom',
                '--color': 'rgba(0,0,0,.45)',
                lineHeight: '1',
                marginLeft: '2px',
              }"
              @click.prevent.stop="data.onClose"
            />
          </tag>
          <!-- <selectTag
          :key="value"
          :label="title"
          :title="option?.label"
          closable
          :tagWidgetStyle="{
            tagStyleOpen: false,
          }"
          :isDesign="false"
          style="margin-right: 3px"
          @on-close="onClose"
        /> -->
        </template>
        <template #title="item">
          <div v-if="item.label && !Object.prototype.hasOwnProperty.call(item, 'selected')">
            {{
              select_label_map[item.value] ||
              (isDisplayRule && item._info.__SHOW_LABEL__) ||
              item.full_name ||
              item.title ||
              item.label
            }}
            <span class="gct-custom-tag ml8px" v-if="item.value.includes(':')">{{
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
        </template>
      </a-tree-select>
      <!-- 多字段展示 -->

      <a-select
        v-else
        v-model:value="value"
        :open="open"
        :mode="multiple ? 'multiple' : ''"
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
        allowClear
        :show-search="showSearch"
        @search="searchTable"
        :searchValue="searchValue"
        @click.capture="openModal"
        @clear="clearValue"
        showArrow
      >
        <template #tagRender="data">
          <tag style="margin: 2px 5px 2px 0">
            <span>{{ select_label_map[data.value] || data.label }}</span>
            <span v-if="data.value.includes(':') && rdoVersion === false" class="version ml8px">{{
              t('sys.default')
            }}</span>
            <IconNext
              :size="15"
              :value="'icon-park:close-small'"
              :style="{
                verticalAlign: 'text-bottom',
                '--color': 'rgba(0,0,0,.45)',
                lineHeight: '1',
                marginLeft: '2px',
              }"
              @click.prevent.stop="data.onClose"
            />
          </tag>
        </template>
        <template #dropdownRender>
          <div class="relative" @click.stop>
            <selectTable
              ref="selectTableRef"
              :rowConfig="{ isCurrent: false }"
              :radioConfig="!multiple && { trigger: 'row' }"
              :checkbox-config="multiple && { trigger: 'row', checkStrictly: true }"
              :getRdoAsyncOptions="getRdoTableData"
              :modelValue="value"
              :tableColumns="displayFields"
              @changeSelect="tableChangeSelect"
              :selectMode="!multiple ? 'single' : 'multiple'"
              :searchValue="searchValue"
              :isSearch="true"
            />
          </div>
        </template>
      </a-select>
    </div>
    <moreOption
      :disabled="disabled"
      @clear="$emit('update:modelValue', null)"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :label="label || fieldName"
      @change="emit('tableSearch')"
    />
  </div>
</template>

<script name="gct-rdo-select" setup lang="ts">
  import { ref, computed, h, watch, toRef, nextTick, toRefs, onMounted, reactive } from 'vue';
  import type { SearchSelect } from '/@page-designer/types/web';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import moreOption from '../more_option.vue';
  import { debounce } from 'lodash-es';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    getQueryDateByKeyWord,
    useQueryfilter,
    getIKeywordFieldKeys,
    getIExp,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { selectTag } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import selectTable from '../../../../field/rdo-select/select-table.vue';
  import { onClickOutside } from '@vueuse/core';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import tag from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/tag.vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { TreeSelect, message as Message } from 'ant-design-vue';
  import { isMultipleOperator } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    modelCategory: string;
    formData: object;
  }>();
  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const Event = getPageEvent();
  const treeData = ref([]);
  /**记录选中项翻译map */
  const select_label_map = ref({});
  const {
    placeholder,
    moreOptions,
    ignoreOptions,
    label,
    field: fieldKey,
    fieldName,
    modelKey,
    datasourceConfig,
    customdataSource,
    datafilter,
    showSearch,
    searchField,
    displayFields,
    rdoVersion,
  } = props.widget.props;
  const rdoUniqueFieldKey = props.widget.props.rdoUniqueFieldKey || 'name_';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();
  const selectOptions = ref([]);
  const searchValue = ref();
  const isDisplayRule = ref(false);
  const queryfilter = useQueryfilter(datafilter);
  const { ope, useMore, disabled, readonly } = toRefs(props.widget.props);
  const multiple = isMultipleOperator(ope.value);
  const rdoApis =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            props.formData,
            datasourceConfig?.extraParams,
          )
      : postModelDataQueryRefData;
  const pagination = reactive({
    pageNo: 1,
    pageSize: 30,
    keyword: '',
  });
  const loadMore = ref<boolean>(false);
  const expandKeys = ref<string[]>([]);
  const dropdownRefKey = computed(() => {
    return `search-rdo-select_${randomUUID([], { length: 16 })}`;
  });

  const exp = getIExp(props.widget.props.exp, ignoreOptions);

  onMounted(async () => {
    await getAsyncOptions();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
    isDisplayRule.value =
      fieldInfo?.specificConfig?.displayRule && fieldInfo?.specificConfig?.displayRule?.exp;
  });

  function getQueryByField() {
    const keyword = pagination.keyword;
    const keywordFieldKeys = getIKeywordFieldKeys(searchField, ignoreOptions);
    const queryData =
      showSearch && keyword
        ? getQueryDateByKeyWord({ searchField: keywordFieldKeys, keyword })
        : {};
    const queryExp = queryfilter.getExp(showSearch && keyword ? exp : '');
    const query = { ...queryfilter.query, ...queryData };
    //没有开启快速 搜索 开启了过滤条件
    if (keyword && Object.keys(queryfilter.query).length && !showSearch) {
      query[`${rdoUniqueFieldKey}.like`] = keyword;
    }
    return { queryExp, query };
  }

  async function getAsyncOptions() {
    const { queryExp, query } = getQueryByField();
    const {
      data = [],
      totalPage,
      pageNo,
    } = (await rdoApis({
      fieldKey,
      modelKey,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      keyword: showSearch ? '' : pagination.keyword,
      exp: queryExp,
      query: { ...query },
      rmIfNoDefaultVersion: 0, //不存在默认版本的时候也要可以查到
    })) || {};
    loadMore.value = !!(totalPage > pageNo);
    (data ?? []).forEach((i) => {
      const rdoLabel = i.__LABEL__ || i.name_;
      const defaultVersion = i.__CHILDREN__?.filter((p) => p.default_)[0];
      treeData.value.push({
        name: rdoLabel,
        label: rdoLabel,
        title: i.__SHOW_LABEL__ || rdoLabel,
        value: i.id_ + ':' + defaultVersion.id_,
        isParent: true,
        // title: rdoLabel,
        _info: i.__CHILDREN__?.find((k) => k.default_),
        children: i.__CHILDREN__?.map((j) => {
          const versionName = j.__LABEL__ || j.version_;
          return {
            label: rdoLabel + ':' + versionName,
            versionName: versionName,
            value: j.id_,
            title: () =>
              h('div', [
                h('span', { class: 'version' }, versionName),
                j.default_
                  ? h('span', { class: 'version gct-custom-tag ml8px' }, t('sys.default'))
                  : null,
              ]),
            name: versionName,
            default_: j.default_,
            _info: { ...j },
            full_name: j.__SHOW_LABEL__ ? j.__SHOW_LABEL__ : `${rdoLabel}:${versionName}`,
            full_path: () => h('div', [h('span', `${rdoLabel}:${versionName}`)]),
          };
        }),
      });
    });
    await nextTick();
    expandKeys.value = treeData.value.map((i) => i.value);
  }

  async function dropdownVisibleChange(v) {
    if (v) {
      treeData.value = [];
      pagination.pageNo = 1;
      await getAsyncOptions();
      await nextTick();
      const dropdown = document.querySelector(
        `.${dropdownRefKey.value} .ant-select-tree-list-holder`,
      );

      if (dropdown) {
        dropdown.addEventListener('scroll', onPopupScroll);
      }
    } else {
      const dropdown = document.querySelector(
        `.${dropdownRefKey.value} .ant-select-tree-list-holder`,
      );
      if (dropdown) {
        dropdown.removeEventListener('scroll', onPopupScroll);
      }
    }
  }

  const onPopupScroll = debounce(async (e) => {
    const { target } = e;
    console.log(
      'target.scrollTop + target.offsetHeight + 30',
      target.scrollTop + target.offsetHeight + 30,
      target.scrollHeight,
    );

    if (target.scrollTop + target.offsetHeight + 30 >= target.scrollHeight) {
      if (!loadMore.value) return;
      try {
        pagination.pageNo += 1;
        await getAsyncOptions();
        await nextTick();
      } catch (error) {}
    }
  }, 300);

  const separatorAttr = toRef(() => {
    let attr: TreeSelectProps = {
      placeholder: t(placeholder),
      allowClear: true,
    };
    return attr;
  });
  const value = computed<any>({
    get() {
      return props.modelValue || undefined;
    },
    set(v) {
      emit('update:modelValue', v || null);
    },
  });
  async function changeSelect(v, node) {
    if (multiple) {
      const cachemap = value.value?.map((i) => i) || [];
      const id = node._info.id_;
      await nextTick();
      if (rdoVersion !== false && node.children) {
        value.value = !cachemap.includes(id) ? [...cachemap, id] : [...cachemap];
        select_label_map.value[node.value] = node.children.find((i) => i.value === id)?.full_name;
      } else {
        select_label_map.value[node.value] =
          (isDisplayRule.value && node._info.__SHOW_LABEL__) ||
          node.full_name ||
          node.title ||
          node.label;
      }

      /**选中后需要清空查询关键字 */
      pagination.keyword = '';
    }
  }
  const tagValue = toRef<string>(() => {
    return value.value?.join(',');
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
  function handleSearch(keyword: string = '') {
    pagination.keyword = keyword;
    debounceSearch();
  }
  const debounceSearch = debounce(async () => {
    treeData.value = [];
    pagination.pageNo = 1;
    await getAsyncOptions();
    loadMore.value = true;
  }, 200);

  const open = ref(false);
  const selectTableRef = ref();
  const cusSelectRef = ref();

  const searchTable = debounce((keyword) => {
    searchValue.value = keyword || '';
    if (keyword) {
      selectTableRef.value?.search(keyword, {
        pageNo: 1,
      });
    } else {
      selectTableRef.value.search('', { pageNo: 1 });
    }
  }, 200);

  async function openModal(e) {
    if (open.value) {
      return;
    }
    open.value = true;
    selectTableRef.value?.search('', { pageNo: 1 });
  }

  async function getRdoTableData(keyword, opts) {
    pagination.keyword = keyword;
    const { pageNo, pageSize } = opts;
    const { queryExp, query } = getQueryByField();
    const res = await rdoApis({
      fieldKey,
      modelKey,
      pageNo,
      pageSize,
      keyword: showSearch ? '' : pagination.keyword,
      exp: queryExp,
      query: { ...query },
      rmIfNoDefaultVersion: 0, //不存在默认版本的时候也要可以查到
    });

    return { res };
  }

  const selectedRows = ref<any[]>([]);

  const getOption = (value) => {
    return selectOptions.value.filter((option) => option.id_ === value)[0];
  };

  async function tableChangeSelect(rows, row) {
    searchValue.value = '';
    if (multiple) {
      const tableEl = selectTableRef.value.getTableEl();
      const tableData = tableEl.getTableData()?.tableData;
      const defaultRow = row.__DEFAULT__ && tableData?.find((i) => i.id_ === row.__DEFAULT__.id_);
      selectOptions.value.push(row);
      // 如果存在 __DEFAULT__，则使用默认行数据
      let targetRow = row;
      let id = row.id_;
      let label =
        (isDisplayRule.value && defaultRow?.__SHOW_LABEL__) ||
        row.__SHOW_LABEL__ ||
        row.name_ +
          (row.__CHILDREN__?.length
            ? ''
            : ':' + (row.__SHOW_LABEL__ || row.__LABEL__ || row.version_));

      if (row?.__DEFAULT__ && rdoVersion !== false) {
        const tableData = tableEl.getTableData()?.tableData;
        const defaultRow = tableData?.find((i) => i.id_ === row.__DEFAULT__.id_);
        if (defaultRow) {
          tableEl.setCheckboxRow([row], false);
          targetRow = defaultRow;
          id = defaultRow.id_;
          label =
            defaultRow.__SHOW_LABEL__ ||
            defaultRow.name_ + ':' + (defaultRow.__SHOW_LABEL__ || defaultRow.version_);
        }
      }

      // 切换选中状态：如果已存在则移除，否则添加
      let cachemap = [...(value.value || [])];
      console.log('cachemap', cachemap);
      const index = cachemap.indexOf(id);
      // 先清除所有勾选
      tableEl.setCheckboxRow(selectedRows.value, false);
      if (index > -1) {
        // 如果已存在，则移除
        cachemap.splice(index, 1);
        // 从 selectedRows 中移除
        const selectedIndex = selectedRows.value.findIndex((item) => item.id_ === id);
        if (selectedIndex > -1) {
          selectedRows.value.splice(selectedIndex, 1);
        }
      } else {
        // 如果不存在，则添加
        cachemap.push(id);
        selectedRows.value.push(targetRow);
        select_label_map.value[id] = label;
        console.log(select_label_map.value);
      }

      // 设置当前选中的行
      tableEl.setCheckboxRow(selectedRows.value, true);

      // 更新 value
      value.value = cachemap.length > 0 ? cachemap : null;
    } else {
      open.value = false;
      if (rdoVersion !== false && rows.children) {
        const filter = rows.children.filter((i) => i.default_)[0];

        const { id_, name_, version_, __DEFAULT__, __VALUE__, __SHOW_LABEL__ } = filter;
        const rdoLabel = __SHOW_LABEL__ || name_ + `:${version_}`;

        selectOptions.value = [
          {
            value: id_,
            title: () => h('div', [h('span', `${rdoLabel}`)]),
            label: rdoLabel,
          },
        ];
        value.value = id_;
      } else {
        const { id_, name_, version_, __DEFAULT__, __VALUE__, __SHOW_LABEL__ } = rows;
        const rdoLabel =
          (isDisplayRule.value && __DEFAULT__?.__SHOW_LABEL__) ||
          __SHOW_LABEL__ ||
          name_ + (rows.children?.length ? '' : `:${version_}`);
        selectOptions.value = [
          {
            value: id_,
            title: () =>
              rows.children?.length
                ? h('div', [
                    h('span', `${rdoLabel}`),
                    h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
                  ])
                : h('div', [h('span', `${rdoLabel}`)]),
            label: rdoLabel,
            children: rows.children,
          },
        ];
        value.value = id_;
      }
    }
  }

  async function clearValue() {
    open.value = false;
    selectedRows.value = [];
    value.value = [];
  }

  const handleClose = (callback, val) => {
    open.value = false;
    const selectedIndex = selectedRows.value.findIndex((item) => item.id_ === val);
    if (selectedIndex > -1) {
      selectedRows.value.splice(selectedIndex, 1);
    }
    selectTableRef.value.initSelected();
    callback();
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
</script>
<style lang="less" scoped>
  .version {
    color: var(--ant-primary-color);
  }
</style>
<style lang="less" scoped>
  .search-select-box {
    flex: 1;
    &.use-more {
      width: calc(100% - 26px);
    }
  }
</style>
