<template>
  <div class="txn-data-collection">
    <file-list
      ref="fileListRef"
      :is-design="false"
      :file-data="collectionOpts"
      :file-loading="fileLoading"
      @fileCheck="fileSelect"
    />
    <Drawer
      ref="dcDrawerRef"
      :collection-item="collectionItem"
      :widgetsMap="widgetsMap"
      :widget="widget"
      @handleLoad="afterClosed"
    />
  </div>
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref, computed, toRefs, nextTick } from 'vue';
  import { EDataStatus, CollectionTypeEnum, CollectionData, StatusEnum } from './types';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { showToast } from 'vant';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  import type { ITxnDataCollection } from './schema';

  import { GctPopup } from '@mobile/utils/popup';
  import { MobileSingleFormFillModal } from '@gct/nocode-mobile-render';
  import { postOnlineFormInstanceDataCollectionUpdateStatus } from '/@/apis/gct-apaas/MedProFormInstanceController';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

  import Drawer from './components/drawer.vue';
  import FileList from './components/file-list.vue';

  const { businessSetting } = useBusinessSetting();

  const Event = getPageEvent();
  const { mitt } = useMitt();

  const props = defineProps<{ widget: ITxnDataCollection }>();
  const { widgetsMap, readonly } = toRefs(props.widget?.props);

  const dcDrawerRef = ref();
  const collectionData = ref<any[]>([]);
  const collectionItem = ref<CollectionData>();
  const dataStatus = ref<EDataStatus>(EDataStatus.INIT);
  const fileLoading = ref<boolean>(false);

  const txnTypeKey = ref<string>();
  const txnType = computed(() => {
    return txnTypeKey.value;
  });

  const collectionOpts = computed(() => {
    const getDict = (item, field) => item?._DICT[field]?.[item[field]]?.join('');
    return (collectionData.value ?? []).map((item) => {
      const id = item.id_!;
      return {
        ...item,
        id,
        online_form_inst_id_: item.online_form_inst_id_!,
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
      };
    });
  });

  async function validate() {
    const isSubmit = collectionData.value.every((i) => i.status_! === StatusEnum.SUBMITTED);
    if (!isSubmit) {
      throw showToast('请先提交完成所有的数据采集');
    }
  }

  const getDataSource = async (queryParam = {}) => {
    fileLoading.value = true;
    const param = Object.assign(
      {
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
        param,
      );
      Event.runEventByName('onLoaded', props.widget.events, res, !!res?.data?.length);
      dataStatus.value = res?.status;
      if (res?.status === EDataStatus.TEMPORARY) {
        if (typeof res.data === 'string') {
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
    await nextTick();
    if (collectionItem.value?.type == CollectionTypeEnum.ONLINEFORM) {
      GctPopup.open(MobileSingleFormFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          selfId: data.online_form_inst_id_,
          isViewPage: false,
          needAutoSave: false,
          paramExtraProps: {
            _gct_nocode_business_id_: data.id,
          },
          dataCollectionInfo: data,
          supportEdit: !readonly?.value,
          showRightBtns: [
            'Save',
            'Cancel',
            'Approve',
            businessSetting.enableShareOnlineForm == 1 ? 'PartialSubmit' : 'Submit',
          ],
        },
        onOk: async (payload: { instId: string }, done: Function) => {
          await postOnlineFormInstanceDataCollectionUpdateStatus({
            taskId: data.id,
          });
          Event.runEventByName('afterClosed', props.widget.events);
        },
      });
    } else {
      dcDrawerRef.value?.onOpen();
    }
  };

  const afterClosed = async () => {
    // Event.runEventByName('afterClosed', props.widget.events);
    // if (props.widget.props.noNeedAutoQuery) return;
    // collectionData.value = await getDataSource();
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
      txnTypeKey.value = queryParam?.txn_key_;
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
