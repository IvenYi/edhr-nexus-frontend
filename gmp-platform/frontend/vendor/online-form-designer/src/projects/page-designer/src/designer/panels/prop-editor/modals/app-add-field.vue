<template>
  <a-modal v-model:visible="visible" title="新增字段" @ok="handleOk" width="640px">
    <div>{{ t('sys.pageDesigner.soModelTitle') + '：' + modelLabel }}</div>
    <div class="pt-20px">
      <a-transfer
        :data-source="transferData"
        show-search
        :list-style="{ width: '275px', height: '440px' }"
        :filter-option="filterOption"
        :target-keys="targetKeys"
        :selected-keys="selectedKeys"
        :render="(item) => item.title"
        @change="handleChange"
        @selectChange="handleSelectChange"
        @search="handleSearch"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { message } from 'ant-design-vue';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface TransferData {
    key: string;
    title: string;
    disabled: boolean;
  }

  const { t } = useI18n();
  const resolveCallback = ref();
  const options = ref<FieldMetaDTO[]>([]);
  const transferData = ref<TransferData[]>([]);
  const visible = ref(false);
  const maxField = ref();
  const modelLabel = ref();
  const targetKeys = ref<any>([]);
  const selectedKeys = ref<any>([]);

  const handleOk = async () => {
    visible.value = false;
    const values = toRaw(options.value).filter((i) => targetKeys.value.includes(i.id));
    resolveCallback.value(values);
  };

  const handleSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    selectedKeys.value = [...sourceSelectedKeys, ...targetSelectedKeys];
    // console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    // console.log('targetSelectedKeys: ', targetSelectedKeys);
    if (sourceSelectedKeys.length || targetSelectedKeys.length) {
      // const arr = targetKeys.value.filter((i) => !targetSelectedKeys.includes(i));
      // const will1RightKeys = [...sourceSelectedKeys, ...arr];
      const willRightKeys = [...sourceSelectedKeys, ...targetKeys.value];
      if (targetKeys.value.length >= maxField.value) {
        for (const item of transferData.value) {
          if (!targetKeys.value.includes(item.key)) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        }
      } else if (willRightKeys.length >= maxField.value) {
        for (const item of transferData.value) {
          if (!willRightKeys.includes(item.key)) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        }
      } else {
        transferData.value.forEach((item) => (item.disabled = false));
      }
    }
  };

  const filterOption = (inputValue: string, options: any) => {
    return options.description.indexOf(inputValue) > -1;
  };

  const handleChange = (keys: string[], direction: string, moveKeys: string[]) => {
    // console.log(keys, moveKeys, 'moveKeys');
    targetKeys.value = keys;
    // console.log(transferData.value, 'transferData====');
    if (targetKeys.value.length >= maxField.value) {
      for (const item of transferData.value) {
        if (!targetKeys.value.includes(item.key)) item.disabled = true;
      }
    } else {
      transferData.value.forEach((item) => (item.disabled = false));
    }
  };

  const handleSearch = (dir: string, value: string) => {
    console.log('search:', dir, value);
  };

  const open = async ({
    modelKey,
    disabledIds,
    maxlength,
    defaultKeys,
    modelName,
  }: {
    maxlength?: number;
    modelKey?: string;
    disabledIds?: string[];
    defaultKeys?: string[];
    modelName?: string;
  }): Promise<FieldMetaDTO[]> => {
    // await formRef.value?.resetFields();
    if (!modelKey) {
      message.warn('请选择业务模型');
      return Promise.reject();
    }
    maxField.value = maxlength;
    modelLabel.value = modelName;
    let list = (await getFieldMetaList({ modelKey })) || [];
    options.value = list.filter(
      (i) =>
        disabledIds &&
        disabledIds.indexOf(i.id!) === -1 &&
        i.key !== 'tenant_id_' &&
        i.type !== FIELD_TYPE.MASTERSLAVE,
    );
    transferData.value = options.value?.map((item: any) => ({
      key: item.id,
      title: item.name,
      disabled: false,
    }));
    targetKeys.value = defaultKeys;
    if (targetKeys.value.length >= maxField.value) {
      transferData.value.forEach((item) => {
        if (!targetKeys.value.includes(item.key)) {
          item.disabled = true;
        }
      });
    }
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };

  defineExpose({ open });
</script>
<style scoped lang="less">
  :deep(.ant-transfer .ant-transfer-operation .ant-btn) {
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }

  :deep(.ant-transfer .ant-transfer-list) {
    border-radius: 4px;
  }
</style>
