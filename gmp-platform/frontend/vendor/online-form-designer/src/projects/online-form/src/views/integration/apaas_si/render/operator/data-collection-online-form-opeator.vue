<template>
  <div>
    <div
      class="overflow-hidden ks-column"
      :style="{
        width: '240px',
        transition: 'width 0.3s',
      }"
      v-if="dataCollectionInfo"
    >
      <InstanceArea
        :docInstanceList="docInstanceList"
        :selectedId="selectSelfInfo?.id"
        :supportEdit="true"
        @update:selected="onSelectInstanceItem"
        @search="onSearchInstance"
      >
        <template #create-instance>
          <a-tooltip>
            <template #title>{{ $t('sys.edhr.createFormInst') }}</template>
            <i
              class="create-instance-btn iconfont icon-pad_icon_add_blue cursor-pointer"
              @click.stop="onCreateNewSelf"
            ></i>
          </a-tooltip>
        </template>
      </InstanceArea>
    </div>
    <OnlineFormOperator
      v-if="computedSelfId"
      ref="operatorRef"
      class="paas-si-form-builder-container flex-1"
      :selfId="computedSelfId"
      :materialNo="materialNo"
      :dataCollectionInfo="dataCollectionInfo"
      :showRightBtns="showRightBtns"
      :isViewPage="isViewPage"
      :keep="keep"
      :paramExtraProps="paramExtraProps"
      @btn-click-callback="handleAction"
    />
  </div>
</template>

<script setup lang="ts" name="PaasSiFormBuilderModal">
  import { ref, onMounted, computed } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import type { ModalProps } from 'ant-design-vue';
  import OnlineFormOperator from './online-form-operator.vue';
  import { useAutoSaveFactory } from '../../hooks/useAutoSaveFactory';
  import InstanceArea from '../components/instance-area.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import CreateNewSelfModal from '../components/create-new-self-modal.vue';
  import {
    getOnlineFormInstanceDataCollectionListAll,
    postOnlineFormInstanceDataCollectionCreate,
  } from '/@/apis/gct-apaas/MedProFormInstanceController';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { IActionButtonItem } from '../types/index.d';

  const props = defineProps<{
    /** 在线表单实例id */
    selfId: string;
    /** 批次号 */
    materialNo?: string;
    /** 是否是查看页面 */
    isViewPage?: boolean;
    /** 是否开启自动保存功能 */
    needAutoSave?: boolean;
    /** 传入的参数（接口使用） */
    paramExtraProps?: Record<string, any>;
    /** 点击按钮后是否直接关闭弹框 */
    keep: boolean;
    options?: ModalProps;
    callback?: any;
    /** 显示的底部右侧按钮  */
    showRightBtns?: string[];
    /** 是否是数据采集 */
    isDataCollect?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'btn-click-callback', btn: IActionButtonItem): void;
  }>();

  const { t } = useI18n();

  const operatorRef = ref();

  const selectSelfInfo = ref<any>({});
  const docInstanceList = ref<any[]>([]);
  const allInstanceList = ref<any[]>([]);

  const dataCollectionInfo = ref<any>();

  const computedSelfId = computed(() => {
    return props.isDataCollect ? selectSelfInfo?.value?.id : props.selfId;
  });

  const { judgeFormDataHasChange, clearLooperData } = useAutoSaveFactory(
    props.needAutoSave,
    handleAutoSave,
  );

  function onSearchInstance(val) {
    if (val) {
      docInstanceList.value = allInstanceList.value.filter((i) => {
        return i.ext2?.includes(val) ?? i.tmplName.includes(val);
      });
    } else {
      docInstanceList.value = cloneDeep(allInstanceList.value);
    }
  }

  async function onCreateNewSelf() {
    const res = await gct.openUtil.modal(
      CreateNewSelfModal,
      {
        selectDocData: dataCollectionInfo.value,
      },
      {
        title: $t('sys.edhr.createForm'),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (res.ok) {
      const { instanceAlias } = res.params;
      await postOnlineFormInstanceDataCollectionCreate({
        dataCollectionTaskId: dataCollectionInfo.value.id_!, // 大纲模板id
        instanceAlias,
      });
      message.success(t('sys.createSuccess'));
      await getDocInstanceList();
    }
  }

  async function onSelectInstanceItem(data) {
    selectSelfInfo.value = data;
  }

  async function handleAutoSave(isAutoSave = true) {
    if (operatorRef.value?.quickSaveData && typeof operatorRef.value.quickSaveData === 'function') {
      await operatorRef.value.quickSaveData(isAutoSave);
    }
  }

  const handleAction = (btn) => {
    clearLooperData();
    doButtonAction(btn);
  };

  const doButtonAction = (btn) => {
    doCallback(btn);
  };

  /** 调用回调方法 */
  const doCallback = (btn) => {
    if (props.callback && typeof props.callback === 'function') {
      props.callback(btn);
    }
    emit('btn-click-callback', btn);
  };

  const getDocInstanceList = async () => {
    const dataCollectionTaskId = dataCollectionInfo.value?.id_;
    if (!dataCollectionTaskId) return;
    const res = await getOnlineFormInstanceDataCollectionListAll({
      dataCollectionTaskId,
    });
    allInstanceList.value = cloneDeep(res) ?? [];
    docInstanceList.value = cloneDeep(res) ?? [];
  };

  onMounted(async () => {
    console.log('selfId===============', props.selfId);
    const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_data_collection_task',
        bsKey: 'getById',
      },
      {
        id: props.selfId,
      },
    );
    if (res?.data) {
      const name =
        res.dict['data_collection_usage_rule_id_'][res.data.data_collection_usage_rule_id_];
      dataCollectionInfo.value = { ...res?.data, name };
      await getDocInstanceList();
      selectSelfInfo.value = docInstanceList?.value?.[0];
    }
  });
</script>

<style lang="less" scoped>
  .paas-si-form-builder-modal-full-screen {
    position: absolute;
    top: 0;
    right: 48px;
    padding: 16px 8px;
    color: #212528;
    font-size: 16px;
    line-height: 1;
    line-height: 22px;
    cursor: pointer;
  }
</style>

<style lang="less">
  .ant-modal {
    .ant-modal-content {
      .ant-modal-body {
        min-height: 1px;
      }
    }
  }
  .paas-si-form-builder-container {
    .create-instance-btn {
      font-size: 14px;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      border-radius: 4px;
      border: 1px solid #e0e3eb;
      line-height: 1;
      background: #fff;
      color: #1a1d23;
      margin-left: 12px;
    }
  }
</style>
