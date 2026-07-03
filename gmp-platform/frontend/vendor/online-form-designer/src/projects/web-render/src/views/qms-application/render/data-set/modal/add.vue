<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.menu.dataSet') + t('sys.category')" name="categoryId">
        <a-select
          v-model:value="formState.categoryId"
          :options="categoryOptions"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.component.dataConnection.dbType') })"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.nameOfSth', { sth: t('sys.menu.dataSet') })"
        name="name"
        :rules="[{ required: true, whitespace: true }]"
      >
        <a-input
          v-model:value="formState.name"
          :placeholder="
            t('sys.pleaseInputSth', { sth: t('sys.nameOfSth', { sth: t('sys.menu.dataSet') }) })
          "
        />
      </a-form-item>

      <a-form-item :label="t('sys.pageDesigner.dataSourcetype')" name="databaseType">
        <a-select
          v-model:value="formState.databaseType"
          :disabled="isEdit"
          :options="dataSourceTypeOptions"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.pageDesigner.dataSourcetype') })"
        />
      </a-form-item>

      <a-form-item :label="t('sys.integration.dataSource')" name="databaseId">
        <a-select
          v-model:value="formState.databaseId"
          :disabled="isEdit"
          :options="computedDataSourceOptions"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.integration.dataSource') })"
        />
      </a-form-item>

      <a-form-item :label="t('sys.bi.datasetType')" name="type">
        {{ categoryId }}
        <a-select
          v-model:value="formState.type"
          :disabled="isEdit"
          :options="datasetTypeOptions"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.bi.datasetType') })"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, inject } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormInstance } from 'ant-design-vue';
  import { DataSourceType, DatasetType } from '/@bi-designer/enum/database';
  import { postDataset } from '/@/apis/gct-platform/PnDatasetController';
  import { PnDatasetRequest } from '/@/apis/gct-platform/model/index';
  import { getDatabaseGetAllDatabase } from '/@/apis/gct-platform/DatabaseController';

  const { t } = useI18n();

  const emit = defineEmits(['ok']);

  const formRef = ref<FormInstance>();

  const categoryId = inject('categoryId');

  const formState = reactive<PnDatasetRequest>({});

  const categoryOptions = ref<any>([]);

  const dataSourceOptions = ref<any>([]);

  const datasetTypeOptions = Object.keys(DatasetType).map((key) => {
    return {
      label: t(`sys.bi.${DatasetType[key]}`),
      value: key,
    };
  });

  const dataSourceTypeOptions = Object.keys(DataSourceType).map((key) => {
    return {
      label: t(`sys.bi.${key.toLowerCase()}Source`),
      value: DataSourceType[key],
    };
  });

  //打开弹框传参
  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    const dataSourceList =
      (await getDatabaseGetAllDatabase({}, { isTransformResponse: false }))?.payload.filter(
        (n) => !n.deleted,
      ) || [];
    dataSourceOptions.value = dataSourceList.map((item) => {
      return {
        label: item.aliasName,
        value: item.id,
        type: item.type,
      };
    });
    data && onDataReceive(data);
  });

  const computedDataSourceOptions = computed(() => {
    return dataSourceOptions.value.filter((item) => {
      return item.type === formState.databaseType;
    });
  });

  const onDataReceive = async (data) => {
    const { categoryList, ...other } = data;
    categoryOptions.value = categoryList.map((item) => {
      return {
        label: item.title,
        value: item.key,
      };
    });
    Object.assign(formState, other);
  };

  const isEdit = computed(() => {
    return !!formState.id;
  });

  const title = computed(() => {
    return (isEdit.value ? t('sys.edit') : t('sys.setUp')) + t('sys.menu.dataSet');
  });

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      try {
        await postDataset({ ...formState, script: '', id: '' });
        emit('ok');
        handleCancel();
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleClose = () => {
    Object.assign(formState, {});
    formRef.value?.resetFields();
  };
</script>

<style lang="less" scoped></style>
