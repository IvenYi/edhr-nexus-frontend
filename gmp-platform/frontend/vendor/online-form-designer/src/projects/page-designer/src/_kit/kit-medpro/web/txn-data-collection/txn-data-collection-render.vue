<template>
  <div class="data-collection">
    <label v-if="widget.props?.displayLabelText">{{ widget.props?.label }}</label>
    <FileList
      :isDesign="false"
      :showType="showType"
      :fileData="collectionOpts"
      :fileLoading="fileLoading"
      @update:showType="updateType"
      @fileCheck="fileSelect"
    />
  </div>
  <data-collection-drawer
    v-if="collectionItem?.type == CollectionTypeEnum.DATACOLLECTION"
    ref="dcDrawerRef"
    :widget="props.widget"
    :collectionItem="collectionItem"
    @handleLoad="afterClosed"
  />
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref, toRefs, toRef, watch, computed, nextTick } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import FileList from './components/file-list.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import DataCollectionDrawer from './components/drawer.vue';
  import { EDataStatus, CollectionTypeEnum, CollectionData, TypeNames, StatusEnum } from './types';
  import { message } from 'ant-design-vue';
  import { onlineFormModal } from '/@web-render/render/Event/utils/builtInMethods';
  import { postOnlineFormInstanceDataCollectionUpdateStatus } from '/@/apis/gct-apaas/MedProFormInstanceController';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
  import { FileModeEnum, PrintModeEnum } from '@gct/nocode-web-render';

  const { businessSetting } = useBusinessSetting();
  const Event = getPageEvent();
  const props = defineProps(widgetProps);
  const { deviceRefForm, batchRefForm, refFormField, refSearchField, collation, readonly } = toRefs(
    props.widget?.props,
  );
  const showType = ref<'Card' | 'List'>('List');
  const collectionData = ref<any[]>([]);
  const collectionItem = ref<CollectionData>();
  const dcDrawerRef = ref();
  const dataStatus = ref<EDataStatus>(EDataStatus.INIT);
  const fileLoading = ref<boolean>(false);

  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });

  const txnTypeKey = ref<string>();
  const txnType = computed(() => {
    if (props.widget.props.noNeedAutoQuery) {
      return txnTypeKey.value;
    }
    return props.widget?.props?.txnType;
  });

  const collectionOpts = computed(() => {
    const getDict = (item, field) => item?._DICT[field]?.[item[field]]?.join('');
    return (collectionData.value ?? []).map((item) => {
      const id = item.id_!;
      return {
        id,
        status: item.status_!,
        type: item.collection_method_! || CollectionTypeEnum.DATACOLLECTION,
        name:
          (getDict(item, 'data_collection_usage_rule_id_') ||
            (item.collection_method_! === CollectionTypeEnum.ONLINEFORM
              ? getDict(item, 'online_form_tmpl_id_')
              : getDict(item, 'data_collection_id_'))) ??
          item?.name_,
        typeName: getDict(item, 'collection_method_'),
        snContainerName: item.snContainerName,
        online_form_inst_id_: item.online_form_inst_id_,
      };
    });
  });

  async function validate() {
    const isSubmit = collectionData.value.every((i) => i.status_! === StatusEnum.SUBMITTED);
    if (!isSubmit) {
      throw message.warning('请先提交完成所有的数据采集');
    }
  }

  const afterClosed = async () => {
    Event.runEventByName('afterClosed', props.widget.events);
    if (props.widget.props.noNeedAutoQuery) return;
    collectionData.value = await getDataSource();
  };

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

  const getDataSource = async (queryParam = {}) => {
    fileLoading.value = true;
    const param = Object.assign(
      {
        ...refFormData.value,
        txn_key_: txnType?.value,
      },
      queryParam,
    );
    try {
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
      fileLoading.value = false;
      return (
        transformSourceData(res.data, res.dict).map((d, index) => {
          return {
            index,
            ...d,
          };
        }) || []
      );
    } catch (err) {
      fileLoading.value = false;
      return [];
    }
  };

  const fileSelect = async (data) => {
    collectionItem.value = data;
    // await nextTick();
    await Event.context.$customBizService.post(
      {
        action: 'biz_validate_shared_specs_in_workflow',
        key: 'em_data_collection_task',
      },
      {
        task_id_: data.id,
      },
    );
    if (collectionItem.value?.type == CollectionTypeEnum.ONLINEFORM) {
      onlineFormModal({
        modelType: 'drawer',
        title: TypeNames[CollectionTypeEnum.ONLINEFORM] || '',
        selfId: data.online_form_inst_id_,
        keep: false,
        modeType: 'form-mode',
        params: {
          _gct_nocode_business_id_: data.id,
        },
        readonlyInstance: !!readonly?.value,
        dataCollectionInfo: data,
        showRightBtns: [
          'Save',
          'Cancel',
          'Approve',
          businessSetting.enableShareOnlineForm == 1 ? 'PartialSubmit' : 'Submit',
        ],
        callback: async (options) => {
          console.log('options', options);
          if (options.type === 'Submit') {
            await postOnlineFormInstanceDataCollectionUpdateStatus({
              taskId: data.id,
            });
          }
          afterClosed();
        },
      });
    } else {
      dcDrawerRef.value?.onOpen();
    }
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
      // 如果关联表单批次为空或数据采集id和工艺步骤同时为空时 则不用查询
      if (
        !refFormData?.value?.txn_subject_id_ ||
        (!refFormData.value?.data_collection_id_ && !refFormData.value?.workflow_step_id_)
      ) {
        needQueryFlag = false;
      }
      if (needQueryFlag) {
        collectionData.value = await getDataSource();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const updateType = (value) => {
    showType.value = value;
  };

  defineExpose({
    setTxnKey(value: string) {
      txnTypeKey.value = value;
    },
    getValue() {
      return collectionData.value.map((item) => {
        return item.id_!;
      });
    },
    validate,
    setValue(data) {
      console.log(data);
    },
    reset() {
      collectionData.value = [];
      collectionItem.value = undefined;
    },
    async reload(queryParam) {
      txnTypeKey.value = queryParam?.txn_key_ ?? props.widget?.props?.txnType;
      collectionData.value = await getDataSource(queryParam);
    },
    setDataSource(res) {
      collectionData.value =
        transformSourceData(res.data, res.dict).map((d, index) => {
          return {
            index,
            ...d,
          };
        }) || [];
    },
  });
</script>

<style lang="less" scoped></style>
