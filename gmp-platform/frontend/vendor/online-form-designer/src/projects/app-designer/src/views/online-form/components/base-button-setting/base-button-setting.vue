<template>
  <div class="online-form-base-button-setting">
    <div class="online-form-base-button-setting-header">
      <a-button @click="handleAddCustomButton" type="primary" size="small">{{
        t('sys.new') + t('sys.appDesigner.approval.customButton')
      }}</a-button>
    </div>
    <div class="online-form-base-button-setting-container">
      <a-table :columns="tableColumns" :data-source="dataSource" bordered :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'type'">
            {{ record.title }}
          </template>
          <template v-if="column.dataIndex === 'buttonType'">
            {{
              record.buttonType === 'builtin'
                ? t('sys.appDesigner.approval.builtinButton')
                : record.buttonType === 'custom'
                  ? t('sys.appDesigner.approval.customButton')
                  : ''
            }}
          </template>
          <template v-if="column.dataIndex === 'signatureType'">
            {{
              t(
                `sys.appDesigner.approval.signatureType.${
                  record.signatureType ?? SignatureTypeEnum.None
                }`,
              )
            }}
          </template>
          <template v-if="column.dataIndex === 'opinionMode'">
            {{
              t(
                `sys.appDesigner.approval.opinionMode.${
                  record.opinionMode ?? ButtonOpinionMode.Closed
                }`,
              )
            }}
          </template>
          <template v-else-if="column.dataIndex === 'enable'">
            <a-switch
              v-model:checked="record.enable"
              :checkedValue="1"
              :unCheckedValue="0"
              size="small"
              @change="handleChangeData"
            />
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: handleRowEdit.bind(null, record),
                },
                {
                  label: t('sys.config'),
                  onClick: handleRowConfig.bind(null, record),
                },
                {
                  label: t('sys.delete'),
                  ifShow: record.buttonType !== 'builtin',
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDeleteSth', { sth: $t('sys.button') }),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="BaseButtonSetting">
  import { watch, ref, toRaw, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import { handleBaseButtonConfig } from '../../constants/index';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';

  import { ButtonOpinionMode, SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import EditButtonInfo from '../../modal/edit-button-info.vue';
  import { cloneDeep } from 'lodash-es';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { openButtonStyleModal } from '/@online-form/approval';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { ButtonTypeEnum } from '@gct/nocode-base';

  const appInfoStore = useAppInfoStore();

  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const { t } = useI18n();
  const { initMasterModel } = useModelFields();

  const props = defineProps<{
    templateInfo: OnlineFormTmplResponse;
    isChanged: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:isChanged', isChanged: boolean): void;
  }>();

  const tableColumns = [
    {
      title: t('sys.appDesigner.approval.buttonTitle'),
      dataIndex: 'type',
    },
    {
      title: t('sys.appDesigner.approval.buttonAlias'),
      dataIndex: 'alias',
    },
    {
      title: t('sys.pageDesigner.buttonType'),
      dataIndex: 'buttonType',
    },
    {
      title: t('sys.appDesigner.approval.signType'),
      dataIndex: 'signatureType',
    },
    {
      title: t('sys.appDesigner.approval.enableOpinionTip'),
      dataIndex: 'opinionMode',
    },
    {
      title: t('sys.status'),
      dataIndex: 'enable',
    },
    {
      key: 'action',
      dataIndex: 'action',
      title: t('sys.operation'),
      width: 120,
      align: 'center',
      fixed: 'right',
    },
  ];

  const dataSource = ref<any>([]);

  watch(
    () => props.templateInfo.modelKey,
    async (val) => {
      if (val) {
        initMasterModel({
          key: props.templateInfo.modelKey,
          name: props.templateInfo.modelName,
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => props.templateInfo.operation,
    async () => {
      const operations = props.templateInfo.operation
        ? JSON.parse(props.templateInfo.operation)
        : [];

      dataSource.value = handleBaseButtonConfig(operations, appInfoStore.appInfo.suiteKey!);
    },
    { immediate: true, deep: true },
  );

  const handleRowEdit = async (record) => {
    const result = await gct.openUtil.modal(
      EditButtonInfo,
      { context: { ...toRaw(record) }, params: {} },
      {
        title: t('sys.pageDesigner.editButton'),
        width: 640,
        showFooter: true,
      },
    );
    console.log('result', result);
    if (result.ok) {
      Object.keys(result!.data).forEach((key) => {
        record[key] = result!.data[key];
      });
    }
  };

  const handleRowConfig = async (record) => {
    const style = await openButtonStyleModal(record);
    if (style) {
      Object.assign(record, { style });
    }
  };

  /**  新建自定义按钮 */
  const handleAddCustomButton = async () => {
    const result = await gct.openUtil.modal(
      EditButtonInfo,
      { context: { buttonType: 'custom', enable: 1 }, params: {} },
      {
        title: t('sys.new') + t('sys.appDesigner.approval.customButton'),
        width: 640,
        showFooter: true,
      },
    );
    console.log('result', result);
    if (result.ok) {
      const record: IData = {};
      Object.keys(result!.data!).forEach((key) => {
        record[key] = result!.data![key];
      });
      dataSource.value.push(record);
    }
  };

  const handleRowDelete = async (record) => {
    dataSource.value = dataSource.value.filter((item) => item.type !== record.type);
  };

  const handleChangeData = () => {
    emit('update:isChanged', true);
  };

  const getSaveData = () => {
    return JSON.stringify(toRaw(dataSource.value));
  };

  defineExpose({ getSaveData });
</script>
<style lang="less" scoped>
  .online-form-base-button-setting {
    &-header {
      width: 100%;
      display: flex;
      padding: 16px 24px;
      align-items: center;
      justify-content: flex-end;

      .title {
        font-weight: 500;
        font-size: 18px;
        color: #000000;
      }
    }
    &-container {
      width: calc(100% - 400px);
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
  }
</style>
