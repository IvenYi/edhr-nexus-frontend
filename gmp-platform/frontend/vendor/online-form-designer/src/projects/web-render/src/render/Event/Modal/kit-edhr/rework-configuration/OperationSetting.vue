<template>
  <div class="operation-config-container">
    <operation-trigger
      :formData="formData"
      :readonlyEnabled="isDetail"
      :computedSnEnabled="false"
      :computedFinalOutputEnabled="false"
      :computedTriggerTxnEnabled="false"
      :currentOperation="currentOperation"
      @update:txn-check="handleTxnCheckChange"
      @update:pre-execute="handlePreExecuteChange"
    />

    <step-menu
      :tabs="computedStepOptions"
      v-model:model-current="currentStep"
      @update:model-current="currentStep = $event"
    />

    <a-form ref="formRef" :model="formData">
      <table-entry
        :type="currentEntryKey"
        :data-source="currentDataSource"
        :disabled="isDetail"
        @delete="handleDeleteRow"
      >
        <template #bodyCell="{ record, column, index, disabled }">
          <component
            v-if="getComponent(column.dataIndex)"
            :is="getComponent(column.dataIndex)"
            :key="currentEntryKey + column.dataIndex"
            v-bind="getComponentProps(record, column, index)"
            v-on="getComponentEvents(record, column)"
            v-model:modelValue="record[column.dataIndex]"
            v-model:checked="record[column.dataIndex]"
          />
          <template v-else-if="column.dataIndex === 'operation_'">
            <table-action-auto
              v-if="record.sysBuiltin !== 1 && !disabled"
              :actions="[
                {
                  label: $t('sys.config'),
                  onClick: () => handleConfig(record),
                  ifShow: currentStep === 0 && ['BASE', 'PROCESS'].includes(record.form_type_),
                },
                {
                  label: $t('sys.delete'),
                  color: 'error',
                  onClick: () => handleDeleteRow(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </table-entry>

      <slot name="extEntries"></slot>

      <div
        v-if="!isDetail"
        class="operation-config-action flex gap-6 text-left mt-4 cursor-pointer"
      >
        <div class="flex operation-config-action--ope" @click="handleAddRow()">
          <span class="operation-config-action--icon">
            <plus-outlined :style="{ fontSize: '10px' }" />
          </span>
          <span class="ml-2">{{ $t('sys.edhr.addRow') }}</span>
        </div>

        <div
          v-if="
            currentEntryKey === 'form_entries_' &&
            currentDataSource.value &&
            currentDataSource.value.length > 1
          "
          class="flex operation-config-action--ope"
          @click.stop="openSequenceAdjustmentModal"
        >
          <i class="iconfont icon-seq-sort"></i>
          <span class="ml-2">{{ $t('sys.edhr.adjustmentOrder') }}</span>
        </div>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { cloneDeep } from 'lodash-es';
  import { computed, createVNode, ref, watch } from 'vue';
  import { Modal, message } from 'ant-design-vue';
  import { IModalData } from '@gct/runtime';
  import { IOperationNodeConfig, EOpeType } from '../types';
  import { EntryKeys } from './config';
  import { useFormEntriesReorder } from '/@page-designer/_kit/kit-eDHR/web/operation-config/composable/useReorder';
  import { openFormPermissionModal } from '/@web-render/render/Event/utils/kitEdhr';
  import { TableActionAuto } from '/@/components/Table';

  import StepMenu from './step-menu/step-menu.vue';
  import TableEntry from './table-entry/table-entry.vue';
  import FormOrderAdjustment from '/@page-designer/_kit/kit-eDHR/web/operation-config/dialog/form-order-adjustment.vue';
  import OperationTrigger from '/@page-designer/_kit/kit-eDHR/web/operation-config/operation-trigger/operation-trigger.vue';

  import {
    useOperationTrigger,
    dynamicTriggerEntryMap,
  } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/operation-config/composable/useOperationTrigger';
  import { useFieldConfig, convertPreOperationEntries } from './composable/useFieldConfig';

  const props = withDefaults(
    defineProps<{
      nodeConfig: IOperationNodeConfig;
      opeType?: EOpeType;
      stepOptions: Array<{
        title: string;
        description: string;
        content: string;
        entryKey: (typeof EntryKeys)[number];
      }>;
      workflowData?: any[];
      isRework?: boolean;
    }>(),
    {
      stepOptions: () =>
        EntryKeys.map((k, i) => {
          return {
            title: 'step' + (i + 1),
            description: $t(`sys.kit.edhr.process.${k}`),
            content: k,
            entryKey: k,
          };
        }),
    },
  );
  const emit = defineEmits<{
    (e: 'update:nodeConfig', nodeConfig: IOperationNodeConfig): void;
  }>();

  const isDetail = computed(() => {
    return props.opeType === EOpeType.DETAIL;
  });

  const formValueTemplate = {
    node_id_: null,
    routing_operation_id_: null,
    operation_before_txn_check_enabled_: false,
    operation_advance_execution_enabled_: false,
    /** 表单配置 */
    form_entries_: [],
    form_entries_dict_: {},
    /** 文档配置 */
    document_entries_: [],
    document_entries_dict_: {},
    /** 事务校验配置 */
    before_txn_check_entries_: [],
    before_txn_check_entries_dict_: {},
    /** 前置工序配置 */
    operation_advance_execution_entries_: [],
    operation_advance_execution_entries_dict_: {},
  } as unknown as IOperationNodeConfig;
  const formRef = ref();
  const formData = ref<IOperationNodeConfig>(formValueTemplate);
  watch(
    () => formData.value,
    (newVal) => {
      console.log('formData:changed ---------------------->', newVal);
      emit('update:nodeConfig', {
        ...newVal,
        operation_advance_execution_entries_: convertPreOperationEntries(
          newVal.operation_advance_execution_entries_ || [],
          true,
        ),
      });
    },
    {
      deep: true,
    },
  );

  const currentOperation = computed(() => {
    return props.workflowData?.find((item) => item.node_id_ === props.nodeConfig?.node_id_);
  });

  const computedStepOptions = computed(() => {
    return props.stepOptions.filter((item) => {
      const triggerFieldKey = dynamicTriggerEntryMap[item.entryKey];
      if (triggerFieldKey && Object.hasOwn(formData.value, triggerFieldKey)) {
        return !!formData.value[triggerFieldKey];
      }
      return true;
    });
  });

  const currentStep = ref(0);
  const currentEntryKey = computed(() => {
    return computedStepOptions.value?.[currentStep.value]?.entryKey;
  });
  const currentDataSource = computed(() => {
    return (formData.value[currentEntryKey.value] || []).filter((item) => !item.deleted_);
  });

  const { getComponent, getComponentProps, getComponentEvents } = useFieldConfig(
    formData,
    currentEntryKey,
    isDetail,
    props,
  );

  const { handleTxnCheckChange, handlePreExecuteChange } = useOperationTrigger(
    formData,
    currentStep,
    computedStepOptions,
  );

  function handleAddRow() {
    if (currentStep.value === 0) {
      formData.value.form_entries_.push({ force_submit_: false, _X_ROW_KEY: Date.now() });
    } else {
      formData.value[currentEntryKey.value].push({ _X_ROW_KEY: Date.now() });
    }
  }

  async function handleDeleteRow(rowData) {
    try {
      await new Promise((resolve, reject) => {
        Modal.confirm({
          title: createVNode('span', { style: 'color:#797a7d;' }, $t('sys.confirmExecution')),
          onOk: () => {
            resolve(true);
          },
          onCancel: () => {
            reject(false);
          },
        });
      });
      if (rowData.id_) {
        rowData.deleted_ = true;
      } else {
        const idx = formData.value[currentEntryKey.value]?.findIndex(
          (item) => item._X_ROW_KEY === rowData._X_ROW_KEY,
        );
        formData.value[currentEntryKey.value]?.splice(idx, 1);
      }
    } catch (error) {
      console.log(error, 'cancel delete');
    }
  }

  function setFormData(data) {
    currentStep.value = 0;
    formData.value = cloneDeep({
      ...data,
      operation_advance_execution_entries_: convertPreOperationEntries(
        data.operation_advance_execution_entries_,
        false,
      ),
    });
  }

  async function fullValidate() {
    await formRef.value.validate();
  }

  // 顺序调整
  async function openSequenceAdjustmentModal() {
    try {
      await fullValidate();
      const sortData = formData.value?.['form_entries_'].map((item) => {
        return {
          id_: item.id_ || item._X_ROW_KEY,
          name_: item.name_ || item._DICT?.['form_tmpl_id_']?.[item.form_tmpl_id_],
          force_submit_: item.force_submit_,
          deleted_: item.deleted_,
        };
      });

      const { reorderFormEntriesInPlace } = useFormEntriesReorder(formData.value, 'form_entries_');

      const res = await gct.openUtil.modal<IModalData>(
        FormOrderAdjustment,
        { sortData: sortData },
        { title: $t('sys.edhr.adjustmentOrder'), width: '600px' },
      );
      if (res.ok && res.params && res.params.data.length) {
        reorderFormEntriesInPlace(res.params.data);
      }
    } catch (error) {
      message.error($t('sys.edhr.adjustmentOrderError'));
    }
  }

  const handleConfig = async (rowData) => {
    const { form_tmpl_id_, permission_config_, operation_ } = rowData;
    const res = await openFormPermissionModal(form_tmpl_id_, {
      permissionConfigs: permission_config_,
      btnConfigs: operation_,
    });
    if (res) {
      const { btnConfigs, permissionConfigs } = res;
      Object.assign(rowData, {
        permission_config_: permissionConfigs,
        operation_: btnConfigs,
      });
    }
  };

  defineExpose({
    getValue() {
      return formData.value;
    },
    setFormData,
    fullValidate,
  });
</script>

<style lang="less" scoped>
  .operation-config {
    &-container {
      margin-top: 16px;
      :deep(.ant-form-item) {
        margin-bottom: 0 !important;
      }
      :deep(.form-tmpl-item .select-text) {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      :deep(.doc-tmpl-item .ant-select-selection-item) {
        width: 100%;
        max-width: 100%;
        & > div {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    &-action {
      color: var(--ant-primary-color);
      &--ope {
        align-items: center;
        justify-content: center;
      }
      &--icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px dashed var(--ant-primary-color);
      }

      .iconfont {
        font-size: 18px;
        line-height: 1;
      }
    }
  }
</style>
