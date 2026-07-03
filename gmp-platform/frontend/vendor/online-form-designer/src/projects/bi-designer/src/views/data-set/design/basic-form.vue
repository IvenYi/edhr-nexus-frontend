<template>
  <a-form
    ref="formRef"
    layout="vertical"
    style="height: 100%"
    :model="formState"
    autocomplete="off"
  >
    <!-- <a-form-item :label="t('sys.menu.dataSet') + t('sys.category')" name="categoryId">
      <a-select
        v-model:value="formState.categoryId"
        :options="categoryOptions"
        :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.component.dataConnection.dbType') })"
      />
    </a-form-item> -->

    <a-form-item
      :label="
        t('sys.bi.sthSelect', { sth: t('sys.bi.step1') }) + t('sys.pageDesigner.dataSourcetype')
      "
      name="databaseType"
    >
      <a-select
        v-model:value="formState.databaseType"
        :options="dataSourceTypeOptions"
        :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.pageDesigner.dataSourcetype') })"
        @change="handleDBTypeChange"
      />
    </a-form-item>
    <template v-if="formState.databaseType === DataSourceType.FILE">
      <a-form-item :label="t('sys.bi.step2') + '：' + t('sys.uploadFile')" name="fileList">
        <a-upload-dragger
          name="file"
          v-model:fileList="fileList"
          :customRequest="customRequest"
          :maxCount="1"
          :showUploadList="true"
          :multiple="false"
          :accept="acceptList + ''"
          style="padding-top: 6px; padding-bottom: 6px"
        >
          <div>
            <SvgIcon size="40" name="folder" />
          </div>
          <p class="text-[#212528] mt12px"
            ><span class="primary-txt">点击</span>或将文件拖拽到这里上传</p
          >
          <p class="text-[12px] text-[#8F8F8F]"> 文件只支持.csv、.xlsx、.xls格式 </p>
          <template #itemRender="{ file, actions }">
            <div class="flex items-center justify-between mt-4px">
              <div class="file-info">
                <FileExcelFilled class="icon mr-1" />
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size ml-5px">{{ sizeParser(file.fileSize) }}</span>
              </div>
              <DeleteOutlined class="delete-icon" @click="actions.remove" />
              <!-- <a-button type="text" @click="actions.remove">
                <template #icon><DeleteOutlined /></template>
              </a-button> -->
            </div>
          </template>
        </a-upload-dragger>
      </a-form-item>
      <p class="upload-tip">有合并单元格的，请处理后再上传</p>
      <p class="upload-tip">系统会默认将上传文件的首行作为标题行，第二行开始作为要上传的数据</p>
      <p class="upload-tip"
        >只支持1个Sheet的解析和上传，若需要上传多个Sheet的内容，请拆分为多个Excel文件上传</p
      >
      <p class="upload-tip">建议使用Chrome浏览器上传</p>
    </template>

    <template v-else>
      <a-form-item
        :label="t('sys.bi.sthSelect', { sth: t('sys.bi.step2') }) + t('sys.integration.dataSource')"
        name="databaseId"
      >
        <a-select
          v-model:value="formState.databaseId"
          :options="computedDataSourceOptions"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.integration.dataSource') })"
          @change="handleUpdateDBSource"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.bi.sthSelect', { sth: t('sys.bi.step3') }) + t('sys.bi.datasetType')"
        name="type"
        v-if="formState.databaseType !== DataSourceType.API"
      >
        <a-select
          v-model:value="formState.type"
          :options="datasetTypeOptions"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.bi.datasetType') })"
          @change="() => emit('updateChange', formState.type)"
        />
      </a-form-item>
      <template v-if="formState.type == 'CONF'">
        <DataResourceBI :databaseId="formState.databaseId" />
      </template>
    </template>
  </a-form>
  <upload-modal @register="register" @ok="handleOk" />
</template>

<script setup lang="ts">
  import { reactive, ref, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormInstance, message, Modal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { DataSourceType, DatasetType } from '/@bi-designer/enum/database';
  import { PnDatasetRequest } from '/@/apis/gct-platform/model/index';
  import { getDatabaseList } from '/@/apis/gct-platform/DatabaseController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { SvgIcon } from '/@/components/Icon';
  import { statusEnum } from '/@/components/FieldUpload/src/types';
  import { postFileUploadDataset } from '/@/apis/gct-platform/FileUploadController';
  import { ImportLoading } from '../modal/import-loading/import-loading';
  import UploadModal from '../modal/upload-modal.vue';
  import { IModalData } from '@gct/runtime';
  import { useModal } from '/@/components/Modal';
  import { postBiFileDatasetConfig } from '/@/apis/gct-platform/FileDatasetConfigController';
  import { sizeParser } from '../hooks/hooks';
  import { DataResourceBI } from '@gct/runtime-web';

  const props = defineProps<{
    categoryInfo: any;
    datasetId: string;
    originConfigId?: string;
  }>();

  const { t } = useI18n();
  const usePathQuery = usePathQueryStore();
  const [register, { openModal, closeModal, setModalProps }] = useModal();
  const emit = defineEmits([
    'updateData',
    'updateDBType',
    'updateConfigId',
    'updateChange',
    'updateDBSource',
    'updateApiDatabaseId',
  ]);

  const formRef = ref<FormInstance>();
  const formState = reactive<PnDatasetRequest>({});
  const categoryOptions = ref<any>([]);
  const dataSourceOptions = ref<any>([]);
  const acceptList = ['.csv', '.xlsx', '.xls'];
  const fileList = ref<any>([]);
  const originFiles = ref<any>([]);

  const datasetTypeOptions = Object.keys(DatasetType)
    .filter((i) => ['SQL', 'CONF'].includes(i))
    .map((key) => {
      return {
        label: t(`sys.bi.${DatasetType[key]}`),
        value: key,
      };
    });

  const dataSourceTypeOptions = Object.values(DataSourceType).map((val) => {
    return {
      label: t(`sys.bi.${val.toLowerCase()}Source`),
      value: val,
    };
  });

  const computedDataSourceOptions = computed(() => {
    return dataSourceOptions.value.filter((item) => {
      return item.type === formState.databaseType;
    });
  });

  onMounted(() => {
    onDataReceive(props.categoryInfo);
  });

  const onDataReceive = async (data) => {
    const { categoryList, ...other } = data;
    categoryOptions.value = categoryList.map((item) => {
      return {
        label: item.title,
        value: item.key,
      };
    });
    const dataSourceList = (await getDatabaseList({ appId: usePathQuery.getAid() || '' })) ?? [];
    dataSourceOptions.value = dataSourceList.map((item) => {
      return {
        label: item.aliasName,
        value: item.id,
        type: item.type,
      };
    });
    Object.assign(formState, other);
    if (!formState.databaseType) {
      formState.databaseType = DataSourceType.DATABASE;
      formState.databaseId = computedDataSourceOptions.value?.[0]?.['value'];
      formState.type = 'SQL';
    }
  };

  const handleDBTypeChange = () => {
    formState.databaseId = undefined;
    formState.type = undefined;
    emit('updateDBType', formState.databaseType);
    emit('updateChange');
  };

  const handleUpdateDBSource = () => {
    emit('updateDBSource');
    emit('updateChange');
    if (formState.databaseType == DataSourceType.API) {
      emit('updateApiDatabaseId', formState.databaseId);
    }
  };

  const beforeUploadFun = async (
    file,
    {
      maxSize = 5,
      acceptList = [],
      beforeUpload,
    }: { maxSize: number; acceptList: string[]; beforeUpload?: (file: File) => Promise<unknown> },
  ) => {
    if (file.name.indexOf(',') > -1) {
      return Promise.reject(`文件名不能有逗号`);
    }
    beforeUpload && (await beforeUpload(file));
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > maxSize) {
      return Promise.reject(`【${file.name}】文件大小不能超过 ${maxSize}MB`);
    }
    if (acceptList.length) {
      const filename: string = file.name
        .replaceAll(' ', '')
        .match(/\.([A-Za-z0-9]+)$/)
        .at(-1);
      if (!acceptList.includes(`.${filename.toLocaleLowerCase()}`)) {
        return Promise.reject(`【${file.name}】支持的扩展名为${acceptList.join(' ')}`);
      }
    }
  };

  const uploadByFile = async (file: File) => {
    const formData: any = new FormData();
    formData.append('file', file, file.name);
    const uploadData = await postFileUploadDataset(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
      isTransformResponse: false,
    });
    return uploadData;
  };

  const customRequest = async ({ file }) => {
    try {
      await beforeUploadFun(file, {
        maxSize: 50,
        acceptList: acceptList,
      });
      console.log('props.originConfigId----------', props.originConfigId);
      if (props.originConfigId) {
        fileList.value = [];
        Modal.confirm({
          title: '提示',
          content: '重新上传数据集会导致相关的图表字段配置失效，请谨慎修改',
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          async onOk() {
            await beforeOpenModal(file);
          },
          onCancel() {
            fileList.value = [...originFiles.value];
          },
        });
      } else {
        await beforeOpenModal(file);
      }
    } catch (error) {
      message.warn(error);
      fileList.value = [];
    }
  };

  const beforeOpenModal = async (file) => {
    fileList.value = [
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        path: '',
        percentNum: 0,
        status: statusEnum.ACTIVE,
        dataSource: [],
      },
    ];
    try {
      const res = await gct.openUtil.modal<IModalData>(
        ImportLoading,
        {
          importEvent: () => uploadByFile(file),
        },
        {
          title: t('sys.uploadFile'),
          showFooter: false,
          wrapClassName: 'import-button-state-modal',
          height: 520,
          width: 640,
        },
      );
      if (res?.ok && res?.data) {
        fileList.value[0].path = res.data?.url || '';
        fileList.value[0].dataSource = res.data?.data || [];
        openUploadModal(res?.data);
      }
    } catch (err) {
      console.warn(err);
      fileList.value = [];
    }
  };

  const openUploadModal = (data) => {
    const arr = data.url?.split('/');
    const list = data.header?.map((item, index) => {
      const typeVal = data.type[index];
      const type = typeVal == 'number' ? 'meas' : 'dim';
      const fieldType = `${type}_${typeVal}`;
      return {
        colName: item,
        fieldName: 'col_' + index,
        fieldType,
        type,
      };
    });
    openModal(true, {
      name: arr.at(-1),
      id: arr[arr.length - 2],
      list,
    });
  };

  const handleOk = async (uploadData) => {
    let data: any = {
      config: JSON.stringify(uploadData),
      url: fileList.value[0].path,
    };
    if (props.datasetId) {
      data = { ...data, datasetId: props.datasetId };
    }
    const configId = await postBiFileDatasetConfig(data);
    setModalProps({ confirmLoading: false });
    configId && emit('updateConfigId', configId);
    message.success(t('sys.operationSuccess'));
    const dataSource = fileList.value?.[0]?.dataSource;
    emit('updateData', {
      configData: uploadData,
      dataSource,
      url: fileList.value?.[0].path,
    });
    closeModal();
  };

  const getData = () => {
    try {
      return formState;
    } catch (err) {
      console.warn(err);
    }
  };

  defineExpose({
    getData,
    setFormData(data) {
      Object.assign(formState, data);
    },
    setFileList(list) {
      if (list?.length) {
        fileList.value = list;
        originFiles.value = JSON.parse(JSON.stringify(list));
      }
    },
  });
</script>

<style lang="scss" scoped>
  .primary-txt {
    color: var(--ant-primary-color);
  }
  .icon {
    color: #52c41a;
  }

  .file-size {
    font-size: 12px;
    color: #cfcfcf;
  }

  .delete-icon {
    &:hover {
      color: var(--ant-primary-color);
    }
  }

  .upload-tip {
    position: relative;
    font-size: 12px;
    line-height: 20px;
    color: #8f8f8f;
    margin-bottom: 8px;
    padding-left: 11px;
    &:before {
      position: absolute;
      content: '';
      left: 0;
      top: 8px;
      width: 3px;
      height: 3px;
      border-radius: 2px;
      background: var(--ant-primary-color);
    }
  }
</style>
