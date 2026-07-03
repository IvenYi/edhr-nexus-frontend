<template>
  <a-form-item
    :label="label"
    :name="field"
    :rules="{
      required: widget.props.required,
      message: t('sys.notEmptySth', { sth: label }),
    }"
    :style="wrapperStyle"
  >
    <span v-if="readonly">{{ fieldValue?.toString() }}</span>
    <template v-else>
      <a-select
        v-if="!displayFields?.length || displayFields.length === 1"
        :disabled="disabled"
        v-model:value="fieldValue"
        :mode="selectMode"
        :showSearch="!!showSearch"
        :filter-option="filterOption"
        @change="onChange"
        @clear="onClear"
        @select="onSelect"
        allowClear
      >
        <a-select-option v-for="item in dataSource" :value="item.id_" :item="item">
          {{
            displayFields?.length ? getOptionsName(item, displayFields[0].props.field) : item.name_
          }}
        </a-select-option>
      </a-select>
      <a-popover
        trigger="click"
        placement="bottomLeft"
        v-model:visible="open"
        v-else
        overlayClassName="vxe-table--ignore-clear"
      >
        <template #content>
          <selectTable
            ref="selectTableRef"
            :selectMode="selectMode"
            :getAsyncOptions="getAsyncOptions"
            :modelValue="fieldValue"
            :tableColumns="displayFields"
            @changeSelect="tableChangeSelect"
          />
        </template>
        <a-select
          :disabled="disabled"
          :mode="selectMode"
          :showSearch="!!showSearch"
          v-model:value="fieldValue"
          @click.capture="openModal"
          @change="onChange"
          @search="onSearch"
          @clear="onClear"
          dropdown-class-name="hidden"
          allowClear
        >
          <a-select-option v-for="item in dataSource" :value="item.id_" :item="item">
            {{
              displayFields.length ? getOptionsName(item, displayFields[0].props.field) : item.name_
            }}
          </a-select-option></a-select
        >
      </a-popover>
    </template>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-fixture-select">
  import { computed, ref, toRef, reactive, watch } from 'vue';
  import { IFixtureSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import selectTable from '../../component/web/select-table.vue';

  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);

  const Event = getPageEvent();
  const props = defineProps<{
    modelValue?: string;
    widget: IFixtureSelect;
    formData: Object;
  }>();

  const { wrapperStyle, labelFont, contentFont } = useStyle(props.widget);

  const {
    txnType,
    bizService,
    refForm,
    refSearchField,
    refContainerForm,
    refContainerField,
    displayLabelText,
    initLoad,
    selectMode,
    readonly,
    field,
    displayFields,
    showSearch,
    searchField,
  } = reactive(props.widget?.props);

  const refFormData = toRef(() => {
    const data: any = {};
    if (refForm) {
      (refSearchField ?? []).forEach((field) => {
        data[field] = formMap.value[refForm]?.[field];
      });
    }
    if (refContainerForm) {
      data.txn_subject_id_ = formMap.value[refContainerForm]?.[refContainerField];
    }
    return data;
  });

  const fieldValue = computed({
    get() {
      let value = props.modelValue || undefined;
      if (selectMode === 'multiple') {
        return value?.split(',').filter((i) => i) || [];
      }
      return value;
    },
    set(val) {
      const newVal = selectMode === 'multiple' ? (val as Array<string>).join(',') : val;
      emit('update:modelValue', newVal);
    },
  });

  const label = computed(() => {
    if (!displayLabelText) {
      return '';
    }
    return props.widget.props.label;
  });

  const dataSource = ref<any[]>([]);
  const disabled = ref(false);

  async function queryFixture(queryParam?) {
    try {
      const params = Object.assign(
        {
          ...refFormData.value,
          txn_key_: txnType,
        },
        queryParam,
      );
      const res = await Event.context.$customBizService.post(
        {
          // @ts-ignore
          action: bizService,
          key: txnType,
        },
        {
          query: params,
        },
      );
      dataSource.value = displayFields?.length
        ? transformSourceData(res.data, res.dict) ?? []
        : res ?? [];
      Event.runEventByName('onLoaded', props.widget.events, dataSource.value);
      await setFixtureStatus(params);
    } catch (e) {
      disabled.value = false;
    }
  }

  async function setFixtureStatus(query) {
    if (txnType !== 'em_txn_move') return;

    try {
      const res = await Event.context.$customBizService.post(
        {
          // @ts-ignore
          action: 'biz_get_moved_in_fixtures',
          key: 'em_txn_move',
        },
        {
          query: query,
        },
      );
      disabled.value = res && res?.length;
      if (disabled.value) {
        //如果是出站事务下 默认选中进站选的治具
        fieldValue.value = res?.map((d) => d.id_);
      } else {
        fieldValue.value = [];
      }
    } catch (err) {
      disabled.value = false;
    }
  }

  watch(
    () => refFormData.value,
    (newVal, oldVal) => {
      /** 如果未开启初始化加载则不请求数据 */
      if (!initLoad || !refFormData.value?.workflow_step_id_) return;

      if (!formMap.value[refContainerForm]?.[refContainerField]) return;

      // 关联查询字段是否变动
      let searchFieldChangeStatus: Array<boolean> = [];
      (refSearchField ?? []).forEach((field) => {
        searchFieldChangeStatus.push(newVal[field] !== oldVal[field]);
      });
      const isSearchFieldChanged: boolean = searchFieldChangeStatus.some((status) => status);
      if (!isSearchFieldChanged) return;

      queryFixture();
    },
    {
      deep: true,
    },
  );

  const open = ref(false);
  const selectTableRef = ref();

  const getOptionsName = (row, key) => {
    return row?._DICT?.[key]?.[row[key]]?.[0] ?? row[key];
  };

  const filterOption = (keyword = '', option) => {
    if (searchField?.length) {
      const targetItem = searchField.map((field) => {
        return getOptionsName(option.item, field);
      });
      return targetItem?.some((item) => item?.toLowerCase().includes(keyword.toLowerCase()));
    } else {
      const targetItem = displayFields?.[0]?.props?.field
        ? getOptionsName(option.item, displayFields[0].props.field)
        : 'name_';
      return targetItem?.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
    }
  };
  const getAsyncOptions = (keyword?, queryData?) => {
    const { pageSize, pageNo } = queryData;
    return Promise.resolve({
      res: {
        data: dataSource.value
          .filter((item) => {
            return !keyword || filterOption(keyword, { item });
          })
          .slice((pageNo - 1) * pageSize, pageNo * pageSize),
        totalCount: dataSource.value.length,
      },
    });
  };

  async function tableChangeSelect(node) {
    if (selectMode === 'multiple') {
      const value = node.map((n) => n.id_);
      onChange(value, node);
      onSelect(value, node);
      fieldValue.value = value;
    } else {
      onChange(node?.id_, node);
      onSelect(node?.id_, node);
      fieldValue.value = node?.id_;
      open.value = false;
    }
  }
  async function openModal(e) {
    selectTableRef.value?.initSelected();
    open.value && e.stopPropagation();
  }

  async function onSearch(keyword?) {
    selectTableRef.value?.search(keyword);
    // open.value && e.stopPropagation();
  }

  function onChange(value, option) {
    const { item } = option;
    Event.runEventByName('onChange', props.widget.events, value, item);
  }

  function onSelect(value, option) {
    Event.runEventByName('afterSelect', props.widget.events, value, option);
  }

  function onClear() {
    Event.runEventByName('afterClear', props.widget.events);
  }

  defineExpose({
    getValue() {
      return fieldValue.value;
    },
    setValue(value: string | string[]) {
      fieldValue.value = value;
    },
    async reload(params?) {
      await queryFixture(params);
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    &:has(div.label-wrap) {
      overflow: visible;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.ant-form-item-control) {
    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        text-align: v-bind('contentFont.textAlign');

        .ant-input,
        .ant-select .ant-select-selector,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }
</style>
