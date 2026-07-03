<template>
  <div class="data-collection">
    <label v-if="widget.props?.displayLabelText">{{ widget.props?.label }}</label>
    <div class="data-collection__type my-2 flex items-center gap-2">
      <a-select
        style="width: 33%"
        v-model:value="collectionType"
        :options="collectionOptions"
        placeholder="请选择数据采集类型"
        @change="handleCollectionChange"
      />
      <div v-if="!widget.props.readonly" class="data-collection__operation flex gap-2">
        <a-button
          type="primary"
          @click="handelTemporary"
          :loading="temporaryLoading"
          :disabled="!tableData?.length"
          >暂存</a-button
        >
        <a-popconfirm
          title="数据将会被重置修改，是否确认重置?"
          ok-text="是"
          cancel-text="否"
          @confirm="handelReset"
        >
          <a-button>重置</a-button>
        </a-popconfirm>
      </div>
    </div>
    <a-form :model="dcData" ref="formRef">
      <a-table :data-source="dcData" :columns="rightCols">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'type_'">
            {{ t(`sys.pageDesigner.dynamicFormType.${record.type_}`) }}
          </template>
          <template v-if="column.key === 'value_'">
            <dynamic-value
              v-model="record.value_"
              :readonly="widget.props.readonly"
              :formData="record"
              :index="record.index"
              :key="record.randomKey"
            />
          </template>
          <template v-if="column.key === 'tip_text_'">
            {{ record.tip_text_ }}
          </template>
        </template>
      </a-table>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { cloneDeep } from 'lodash-es';
  import { ref, toRef, toRefs, watch, computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DynamicValue from './dynamic-value.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { FormInstance, message } from 'ant-design-vue';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';

  enum EDataStatus {
    INIT = 'init',
    TEMPORARY = 'temporary',
  }

  const rightCols = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '名称',
      dataIndex: 'name_',
      key: 'name_',
    },
    {
      title: '类型',
      dataIndex: 'type_',
      key: 'type_',
    },
    {
      title: '值',
      dataIndex: 'value_',
      key: 'value_',
    },
    {
      title: '参考值',
      dataIndex: 'tip_text_',
      key: 'tip_text_',
    },
  ];

  const { t } = useI18n();
  const Event = getPageEvent();
  const formRef = ref<FormInstance>();
  const props = defineProps(widgetProps);
  const { deviceRefForm, batchRefForm, refFormField, refSearchField, collation } = toRefs(
    props.widget?.props,
  );
  const refFormData = toRef(() => {
    const data: any = {};
    refFormField.value?.forEach((i) => {
      if (i) {
        data[i] = formMap.value[deviceRefForm?.value]?.[i];
      }
    });
    refSearchField.value.forEach((i) => {
      data[i] = formMap.value[batchRefForm?.value]?.[i];
    });
    data.txn_subject_id_ = formMap.value?.[batchRefForm?.value]?.id_;
    data.workflow_step_id_ = formMap.value?.[deviceRefForm?.value]?.workflow_step_id_ ?? undefined;
    return data;
  });

  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });

  const tableData = ref<any[]>([]);
  const dcData = ref<any[]>([]);
  const rowIndex = ref(-1);
  const dataStatus = ref<EDataStatus>(EDataStatus.INIT);
  const temporaryLoading = ref<boolean>(false);
  const temporaryData = ref<any[]>([]);

  const txnTypeKey = ref<string>();
  const txnType = computed(() => {
    if (props.widget.props.noNeedAutoQuery) {
      return txnTypeKey.value;
    }
    return props.widget?.props?.txnType;
  });

  const collectionType = ref<string>();
  const collectionOptions = computed(() => {
    const getDict = (item, field) => item?._DICT[field]?.[item[field]]?.join('');
    return (tableData.value ?? []).map((item) => {
      return {
        ...item,
        value: item.data_collection_id_,
        label: getDict(item, 'data_collection_id_'),
      };
    });
  });
  const stashKey = computed(() => {
    const formData =
      {
        ...refFormData?.value,
        txn_key_: txnType?.value,
      } ?? {};
    const refFormValue = Object.values(formData);
    return refFormValue?.join('--');
  });

  const getDataSource = async (queryParam = {}) => {
    const param = Object.assign(
      {
        ...refFormData.value,
        txn_key_: txnType?.value,
        stash_id_: stashKey.value,
      },
      queryParam,
    );
    const res = await Event.context.$customBizService.post(
      {
        action: 'biz_get_data_collection_usage_rule',
        key: 'em_data_collection',
      },
      {
        query: { ...param },
        sorts: [...querySort],
      },
    );
    Event.runEventByName('onLoaded', props.widget.events, res, !!res?.data?.length);
    dataStatus.value = res?.status;
    if (res?.status === EDataStatus.TEMPORARY) {
      if (typeof res.data === 'string') {
        console.log(JSON.parse(res.data), 'json data');
        return JSON.parse(res.data);
      }
      return res.data;
    }
    return (
      transformSourceData(res.data, res.dict).map((d, index) => {
        return {
          index,
          ...d,
        };
      }) || []
    );
  };
  watch(
    () => refFormData.value,
    async () => {
      if (props.widget.props.noNeedAutoQuery) return;

      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[batchRefForm?.value]?.[i]) {
          needQueryFlag = false;
        }
      });
      if (needQueryFlag) {
        tableData.value = await getDataSource();
        formateLoadedTableData();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  function handleCollectionChange(val, opt) {
    // 切换后恢复到暂存数据
    tableData.value = temporaryData.value;
    const index = tableData.value.findIndex((it) => it.data_collection_id_ === val);
    if (index < 0) return;
    rowIndex.value = index;
    tableData.value[index].entries_.forEach((d, idx) => {
      d.randomKey = Math.random();
      d.index = idx;
    });
    dcData.value = tableData.value[index].entries_;
  }

  /** 暂存数据采集数据到暂存表 */
  async function handelTemporary() {
    try {
      temporaryLoading.value = true;
      const temporaryCollectionEntries = tableData.value.map((item) => {
        return {
          data_collection_id_: item.data_collection_id_,
          data_collection_usage_rule_id_: item.id_,
        };
      });
      await Event.context.$customBizService.post(
        {
          action: 'submit',
          key: 'em_data_temporary',
        },
        {
          stash_id_: stashKey.value,
          value_: JSON.stringify(tableData.value),
          txn_key_: txnType?.value,
          type_: 'dataCollection',
          data_collection_entries_: temporaryCollectionEntries,
        },
      );
      message.success(t('暂存成功'));
    } catch (e) {}
    temporaryLoading.value = false;
  }

  /** 重置回暂存/初始数据状态 */
  async function handelReset() {
    tableData.value = await getDataSource();
    formateLoadedTableData();
  }

  async function validate() {
    try {
      await formRef.value?.validate();
    } catch {
      throw message.warning('当前数据采集未通过校验');
    }
  }

  /** 格式化接口响应结果(组件双向绑定的tableData和dcData) */
  function formateLoadedTableData() {
    if (tableData.value.length) {
      rowIndex.value = 0;
      tableData.value[0].entries_.forEach((d, idx) => {
        d.randomKey = Math.random();
        d.index = idx;
      });
      dcData.value = tableData.value[0].entries_;
      collectionType.value = tableData.value[0].data_collection_id_;
    } else {
      rowIndex.value = -1;
      dcData.value = [];
      collectionType.value = '';
    }
    temporaryData.value = cloneDeep(tableData.value);
  }

  defineExpose({
    setTxnKey(value: string) {
      txnTypeKey.value = value;
    },
    getValue() {
      return tableData.value;
    },
    getStashKey() {
      return stashKey.value;
    },
    validate,
    setValue(data, index?) {
      if (index) {
        tableData.value[index].forEach((d, i) => {
          d.value_ = data[i];
        });
      } else {
        tableData.value.forEach((group, k) => {
          group.entries_.forEach((d, i) => {
            d.value_ = data[k][i];
          });
        });
      }
    },
    reset() {
      rowIndex.value = -1;
      dcData.value = [];
      tableData.value = [];
      collectionType.value = '';
      temporaryData.value = cloneDeep(tableData.value);
    },
    async reload(queryParam) {
      txnTypeKey.value = queryParam?.txn_key_ ?? props.widget?.props?.txnType;
      tableData.value = await getDataSource(queryParam);
      formateLoadedTableData();
    },
    setDataSource(res) {
      tableData.value =
        transformSourceData(res.data, res.dict).map((d, index) => {
          return {
            index,
            ...d,
          };
        }) || [];
      formateLoadedTableData();
    },
  });
</script>

<style lang="less" scoped></style>
