<template>
  <a-spin :spinning="spinning" size="large" wrapperClassName="design-view-wrap">
    <div :class="ns.b()">
      <DesignViewHeader
        v-model:titleName="titleName"
        v-model:oldTitleName="oldTitleName"
        :isEdit="isEdit"
        :isDsConfig="isDsConfig"
        :step="store.step"
        :apiStep="apiStep"
        :isApiEdit="isApiEdit"
        :isDisabled="store.nodes.length === 0"
        :databaseType="databaseType"
        @changeStep="onChangeStep"
        @changeApiStep="onChangeApiStep"
        @onNext="onNext"
        @onSave="onSave"
        @onClose="onClose"
        @updateEdit="updateEdit"
      />
      <div :class="ns.b('content')">
        <div :class="ns.be('content', 'left')">
          <basic-form
            ref="formRef"
            :categoryInfo="props.categoryInfo"
            :datasetId="data.id"
            :originConfigId="originConfigId"
            @updateData="handleUpdateData"
            @updateDBType="handleUpdateDBType"
            @updateConfigId="updateConfigId"
            @updateChange="updateChange"
            @updateDBSource="handleClearData"
            @updateApiDatabaseId="updateApiDatabaseId"
          />
        </div>
        <div :class="ns.be('content', 'right')">
          <DesignViewRight
            ref="designViewRightRef"
            v-model:scriptStr="scriptStr"
            :isDsConfig="isDsConfig"
            :step="store.step"
            :databaseType="databaseType"
            :open="open && !isFieldAdd"
            :wrongInfo="wrongInfo"
            :datasetId="data.id"
            :apiStep="apiStep"
            :apiDatabaseId="apiDatabaseId"
            :originDatabaseId="data.databaseId"
            :isApiEdit="isApiEdit"
            :configData="configData"
            :modelConfig="modelConfig"
            @updateData="handleUpdateData"
            @handleRun="
              () => {
                isFieldAdd = false;
                onRun();
              }
            "
            @handleDeploy="handleDeploy"
            @updateChange="updateChange"
          >
            <datav-upload-table
              ref="uplodTableRef"
              v-if="configData?.length"
              :dataSource="dataSource"
              :configData="configData"
              :fileUrl="fileUrl"
              :scrollHeight="scrollHeight"
              :datasetId="props.data.id"
              :databaseType="databaseType"
              :open="open && isFieldAdd"
              :wrongInfo="wrongInfo"
              @updateData="handleUpdateData"
              @delData="handleDelFormulaField"
              @add-formula-field="handleAddFormulaField"
              @edit-formula-field="handleEditFormulaField"
            />
            <a-empty style="margin-top: 50px" v-else />
          </DesignViewRight>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
  import { ref, nextTick, h, onMounted, watch } from 'vue';
  import { useNamespace, IModal, useAntTableScrollHeight, IModalData } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal, message } from 'ant-design-vue';
  import { uuid2 } from '/@/utils/uuid';
  import { DataSourceType } from '/@bi-designer/enum/database';
  import { APIDataSetStep } from '../interface/type';
  import { getFileSize } from '../hooks/hooks';
  import { useDesignView } from '../hooks/useDesignView';
  import { CategoryModuleEnum } from '/@bi-designer/views/components/category/type';
  import { postDataset, putDatasetById } from '/@/apis/gct-platform/PnDatasetController';
  import { putBiFileDatasetConfigById } from '/@/apis/gct-platform/FileDatasetConfigController';
  import { getBiDataSetInfo } from '/@/apis/gct-platform/BiDataSetController';
  import BasicForm from './basic-form.vue';
  import DatavUploadTable from './datav-upload-table.vue';
  import SaveModal from '../modal/save-modal.vue';
  import DesignViewHeader from './components/DesignViewHeader.vue';
  import DesignViewRight from './components/DesignViewRight.vue';

  const props = defineProps<{
    modal: IModal;
    data: any;
    categoryInfo: any;
  }>();

  const uplodTableRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(uplodTableRef);
  const ns = useNamespace('design-view');
  const { t } = useI18n();
  const oldTitleName = ref('');
  const isEdit = ref<boolean>(false);
  const formRef = ref();
  const originScript = ref();
  const spinning = ref(false);
  const designViewRightRef = ref();
  const isDatasetEdit = ref();
  const modelConfig = ref();
  const isApiEdit = ref(false);

  const {
    titleName,
    store,
    isChange,
    originConfigId,
    databaseType,
    configId,
    biConfigId,
    isDsConfig,
    dataSource,
    configData,
    apiStep,
    apiDatabaseId,
    fileUrl,
    scriptStr,
    open,
    wrongInfo,
    dataConfig,
    isFieldAdd,
    saveConfData,
    saveApiData,
    getFullSql,
    getBiFileDatasetConfig,
    onChangeStep,
    onChangeApiStep,
    onRun,
    onInit,
    onNext,
    updateChange,
    updateConfigId,
    updateApiDatabaseId,
    handleDeploy,
    handleClearData,
    handleUpdateData,
    handleUpdateDBType,
    handleAddFormulaField,
    handleDelFormulaField,
    handleEditFormulaField,
  } = useDesignView(props, formRef, designViewRightRef);

  const updateEdit = (flag) => {
    isEdit.value = flag;
  };

  const onClose = () => {
    if (isChange.value) {
      const cfg = Modal.confirm({
        title: t('sys.designView.saveConfirm.title'),
        content: h('div', {}, [
          h('span', {}, t('sys.designView.saveConfirm.content')),
          h('div', { class: ns.b('continue-edit'), style: { left: '34px' } }, [
            h('button', { type: 'button', onClick: () => cfg.destroy() }, '继续编辑'),
          ]),
        ]),
        okText: t('sys.designView.saveConfirm.confirm'),
        cancelText: t('sys.designView.saveConfirm.cancel'),
        onOk: async () => {
          await onSave();
          closeModal();
        },
        onCancel: () => {
          closeModal();
        },
        class: ns.b('confirm'),
        maskStyle: {
          backgroundColor: 'transparent',
        },
      });
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    props.modal.dismiss({ ok: true });
  };

  const onSave = async () => {
    // api数据源 开始时间校验
    if (databaseType.value == DataSourceType.API) {
      const errors = await designViewRightRef.value?.apiFormValid();
      if (errors.length) return;
    }

    let modalData;
    if (!isDatasetEdit.value) {
      const res = await gct.openUtil.modal<IModalData>(
        SaveModal,
        {
          data: {
            name: titleName.value,
            categoryId: props.categoryInfo.categoryId,
            key: uuid2(8, 16),
            description: '',
          },
          module: CategoryModuleEnum.DATASET,
        },
        {
          title: '保存',
          width: '640px',
          height: '400px',
          showFooter: false,
        },
      );
      if (res?.ok) {
        modalData = res.data;
      } else {
        return;
      }
    }
    spinning.value = true;

    try {
      isChange.value = false;
      const data = formRef.value?.getData();
      if (data.databaseType == DataSourceType.FILE) {
        if (!fileUrl.value) {
          spinning.value = false;
          message.warning('请上传本地文件');
          return;
        }
      } else if (data.databaseType == DataSourceType.API) {
      } else {
        if ((!scriptStr.value || !data.databaseId) && data.type !== 'CONF') {
          spinning.value = false;
          message.warning(!data.databaseId ? '请选择数据源' : '请输入SQL语句');
          return;
        }
      }

      // 保存或更新数据集类型为CONF时的数据，以获取biConfigId
      if (data.type == 'CONF') {
        await saveConfData(modalData?.name, oldTitleName.value);
      }

      if (data.databaseType == DataSourceType.API) {
        await saveApiData(modalData?.name, oldTitleName.value);
      }
      // 保存前本地上传类型 再次更新config
      let config: any = {};
      if (data.databaseType == DataSourceType.FILE) {
        config = {
          config: JSON.stringify(configData.value),
          url: fileUrl.value,
          datasetId: props.data?.id,
        };
      } else if (data.databaseType == DataSourceType.API) {
        config = {
          config: JSON.stringify(configData.value),
          datasetId: props.data?.id,
        };
      } else {
        config = { config: JSON.stringify(configData.value) };
      }

      if (configId.value) {
        await putBiFileDatasetConfigById({ id: configId.value }, config);
      }

      const dataJson =
        data.databaseType == DataSourceType.FILE
          ? { fileUrl: fileUrl.value, fullSql: getFullSql() }
          : data.type == 'CONF' || data.databaseType == DataSourceType.API
          ? {
              biConfigId: biConfigId.value,
              config: JSON.stringify(configData.value),
              fullSql: getFullSql(),
            }
          : {
              script: scriptStr.value,
              config: JSON.stringify(configData.value),
              fullSql: getFullSql(),
            };

      if (props.data.id) {
        // 本地上传时configId不同或者API数据源时选择数据源不同 需要调保存接口
        if (
          configId.value == originConfigId.value ||
          (data.databaseType == DataSourceType.API && props.data?.databaseId === data?.databaseId)
        ) {
          await putDatasetById(
            { id: props.data.id },
            { ...data, name: titleName.value, ...dataJson },
          );
        } else {
          await postDataset({
            ...data,
            name: titleName.value,
            ...modalData,
            ...dataJson,
            id: props.data.id,
          });
        }
      } else {
        await postDataset({ ...data, name: titleName.value, ...modalData, ...dataJson });
      }
      spinning.value = false;
      message.success(t('sys.saveSuccess'));
      props.modal.dismiss({ ok: true });
    } catch (err) {
      spinning.value = false;
      console.warn(err);
      return;
    }
  };

  onMounted(async () => {
    const { script, name, id, databaseId, categoryId, databaseType, type } = props.data;
    titleName.value = name ?? '未命名数据集';
    handleUpdateDBType(databaseType);
    if (!id) {
      updateChange();
    }
    formRef.value?.setFormData({ id, databaseId, categoryId, databaseType, type });

    if (props.data?.biConfigId) {
      biConfigId.value = props.data.biConfigId;
      if (type == 'CONF') {
        isDsConfig.value = true;
        store.databaseId = databaseId;
        onInit();
      }
      if (databaseType == DataSourceType.API) {
        apiStep.value = APIDataSetStep.DATASET_CONFIG;
        apiDatabaseId.value = databaseId;
        isApiEdit.value = true;
      }
    }

    isDatasetEdit.value = !!id;
    if (id) {
      const data = (await getBiFileDatasetConfig(id)) || {};
      console.log('getBiFileDatasetConfig----------', data);
      if (databaseType == DataSourceType.FILE) {
        handleUpdateData(
          {
            dataSource: [],
            configData: JSON.parse(data?.config || '[]'),
            url: data?.url,
            hasSort: true,
          },
          true,
        );
        // 历史记录查询
        designViewRightRef.value?.getHistoryLog4File();
        // 回填已上传文件
        const file = {
          path: data?.url,
          name: data?.url?.split('/').at(-1),
          fileSize: (await getFileSize(`/minio/${data?.url}`)) || '',
          dataSource,
        };
        formRef.value?.setFileList([file]);
      } else {
        if (type == 'SQL') {
          designViewRightRef.value?.reloadEditor(script);
          originScript.value = script;
          await nextTick();
          dataConfig.value = JSON.parse(data?.config || '[]');
          configData.value = dataConfig.value?.map((i) => {
            return {
              ...i,
              fieldName: i.fieldName?.replace(/^'|'$/g, ''),
              colName: i.colName?.replace(/^'|'$/g, '')?.split('.')?.at(-1),
            };
          });
          if (dataConfig.value?.length) {
            handleUpdateData(
              {
                dataSource: [],
                configData: dataConfig.value,
                url: data?.url,
                hasSort: true,
              },
              true,
            );
          } else {
            onRun(dataConfig.value?.length ? true : false);
          }
        } else {
          if (databaseType == DataSourceType.API) {
            scriptStr.value = script;
            const apiData = (await getBiDataSetInfo({ id: biConfigId.value })) || {};
            modelConfig.value = apiData.modelConfig;
          }
          dataConfig.value = JSON.parse(data?.config || '[]');
          configData.value = dataConfig.value?.map((i) => {
            return {
              ...i,
              fieldName: i.fieldName?.replace(/^'|'$/g, ''),
              colName: i.colName?.replace(/^'|'$/g, '')?.split('.')?.at(-1),
            };
          });
          if (dataConfig.value?.length) {
            handleUpdateData(
              {
                dataSource: [],
                configData: dataConfig.value,
                hasSort: true,
              },
              true,
            );
          }
        }
        // 历史记录查询
        designViewRightRef.value?.getHistoryLog();
      }
    }
  });

  watch(
    () => scriptStr.value,
    (val) => {
      const data = formRef.value?.getData();
      if (data.type == 'SQL' && originScript.value !== val) {
        updateChange();
      }
    },
    {
      deep: true,
    },
  );
</script>

<style lang="scss">
  @import './design-view.scss';
  .design-view-wrap.ant-spin-nested-loading > div > .ant-spin {
    max-height: 100% !important;
  }
</style>
