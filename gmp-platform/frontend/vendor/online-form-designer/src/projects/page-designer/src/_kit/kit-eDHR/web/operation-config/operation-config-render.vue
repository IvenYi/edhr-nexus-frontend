<template>
  <WorkflowNodesRender
    v-if="props.widget.props.refRoutingOperationField"
    ref="workflowNodesRef"
    v-model:modelValue="workflowModelValue"
    :widget="workflowSchema"
    :form-data="{ id_: computedWorkflowId }"
    @selected="handleSelectedEvent"
    @graphMounted="handleGraphMountedEvent"
  />

  <a-form v-if="currentOperation" :key="currentOperation.node_id_" :model="formData" ref="formRef">
    <div class="operation-config-container">
      <div class="operation-config-title font-bold">
        {{ currentOperation?.name_ + $t('sys.edhr.operationConfig') }}
      </div>

      <operation-triggers
        :formData="formData"
        :readonlyEnabled="!!readonlyEnabled"
        :currentOperation="currentOperation"
        :computedSnEnabled="!!computedSnEnabled"
        :snCheckVisible="snCheckVisible"
        :splitSnNode="splitSnNode"
        :computedFinalOutputEnabled="!!computedFinalOutputEnabled"
        :computedTriggerTxnEnabled="true"
        :finalOutputCheckVisible="finalOutputCheckVisible"
        :finalOutputNode="finalOutputNode"
        @update:split-sn="handleSnSplitChange"
        @update:trigger-txn="handleTxnTriggerChange"
        @update:final-output="handleFinalOutputChange"
        @update:txn-check="handleTxnCheckChange"
        @update:pre-execute="handlePreExecuteChange"
      />

      <step-menu
        :tabs="stepOptions"
        v-model:model-current="currentStep"
        @update:model-current="currentStep = $event"
      />

      <vxeRefTable
        v-if="tableWidget"
        :key="tableWidget.id + entriesKey"
        v-model="tableData"
        :tableFieldId="entriesKey"
        :tableColumns="tableColumns"
        :operateColumn="operateColumn"
        :serialNumber="true"
        :validateRule="validateRule"
        :customValidateRules="customValidateRules"
        :subTableShowPagination="false"
        :headerSort="false"
        :loading="tableLoading"
        ref="vxeTable"
      >
        <template #field="{ widget, row, rowIndex }">
          <cell-field
            v-if="
              [
                'em_trigger_txn_entry$value_',
                'em_operation_advance_execution_entry$before_operation_id_',
              ].includes(widget.props.fieldId)
            "
            :widget="widget"
            :readonlyEnabled="!!readonlyEnabled"
            :rowData="row"
            :rowIndex="rowIndex"
            :entriesKey="entriesKey"
            :rules="customValidateRules({ field: widget.props.field })"
            :txnOptions="txnOptions"
            :filterOption="filterOption"
            :workflowData="workflowData"
            :currentOperation="currentOperation"
            :dict="tableDict"
          />
        </template>
        <template v-if="operateColumn?.length" #operate="{ row, rowIndex, operateColumn }">
          <RenderTableColunmButtons
            :tableForm="row"
            :rowIndex="rowIndex"
            :buttons="operateColumn.children"
            :visibleButtons="operateColumn.props.visibleButtons"
            isRow
          />
        </template>
      </vxeRefTable>

      <div
        v-if="!readonlyEnabled"
        class="operation-config-action flex text-left mt-4 cursor-pointer"
      >
        <div
          class="flex operation-config-action--ope"
          @click="handleAddRow(formData?.[entriesKey])"
        >
          <span class="operation-config-action--icon">
            <plus-outlined :style="{ fontSize: '10px' }" />
          </span>
          <span class="ml-2">{{ $t('sys.edhr.addRow') }}</span>
        </div>
        <div
          v-if="currentStep === 0 && tableData && tableData.length > 1"
          class="flex operation-config-action--ope ml-24px"
          @click.stop="openSequenceAdjustmentModal"
        >
          <i class="iconfont icon-seq-sort"></i>
          <span class="ml-2">{{ $t('sys.edhr.adjustmentOrder') }}</span>
        </div>
      </div>
    </div>
  </a-form>
</template>

<script setup lang="ts">
  import { cloneDeep, debounce, isEmpty } from 'lodash-es';
  import { computed, ref, reactive, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { IModalData } from '@gct/runtime';
  import { IOperationConfig } from './schema';
  import { WorkflowNodeTypeEnum } from '/@page-designer/components/widgets/web/data/workflow-nodes/component/types';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    vxeRefTable,
    RenderTableColunmButtons,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWorkflowNodes } from './composable/useWorkflowNodes';
  import { useTableEntry } from './composable/useTableEntry';
  import { useFormEntriesReorder } from './composable/useReorder';
  import { useOperationTrigger, dynamicTriggerEntryMap } from './composable/useOperationTrigger';
  import { convertPreOperationEntries } from '/@/projects/web-render/src/render/Event/Modal/kit-edhr/rework-configuration/composable/useFieldConfig';

  import WorkflowNodesRender from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  import StepMenu from './step-menu/step-menu.vue';
  import FormOrderAdjustment from './dialog/form-order-adjustment.vue';
  import OperationTriggers from './operation-trigger/operation-trigger.vue';
  import CellField from './field/cell-field.vue';

  interface INodeConfigData {
    id_?: string;
    name_?: string;
    type_?: WorkflowNodeTypeEnum;
    node_id_: string | null;
    routing_operation_id_: string | null;
    /** 开启拆分SN */
    split_sn_enabled_: boolean;
    /** 事务触发 */
    trigger_txn_enabled_: boolean;
    /** 工序中产出 */
    final_output_bool_: boolean;
    /** 事务执行校验 */
    operation_before_txn_check_enabled_: boolean;
    /** 工序提前执行 */
    operation_advance_execution_enabled_: boolean;
    /** 是否以sn状态流转 */
    isSnStatus?: boolean;
  }

  interface IFormData extends INodeConfigData {
    /** 表单配置 */
    form_entries_: Array<any>;
    /** SOP配置 */
    document_entries_: Array<any>;
    /** 事务触发配置 */
    trigger_txn_entries_: Array<any>;
    /** 事务校验配置 */
    before_txn_check_entries_: Array<any>;
    /** 前置工序配置 */
    operation_advance_execution_entries_: Array<any>;
  }

  const props = defineProps<{
    widget: IOperationConfig;
  }>();

  const Event = getPageEvent();
  const { t } = useI18n();

  const { stepSettings, snSplitEnabled, finalOutputEnabled, readonlyEnabled } = reactive(
    props.widget.props,
  );

  const stepOptions = computed(() => {
    const _stepSettings = stepSettings.filter((k) => {
      const requiredSwitch = dynamicTriggerEntryMap[k];
      if (!requiredSwitch) return true;

      return !!formData.value?.[requiredSwitch];
    });

    return _stepSettings.map((k, i) => {
      return {
        title: t('sys.edhr.step') + (i + 1),
        description: t(`sys.kit.edhr.process.${k}`),
        content: k,
        entryKey: k,
        status: 'process',
      };
    });
  });
  const currentStep = ref(0);
  const currentStepEntity = computed(() => {
    return stepOptions.value[currentStep.value] ?? stepOptions.value[0];
  });
  const entriesKey = computed(() => {
    return currentStepEntity.value?.entryKey ?? 'form_entries_';
  });
  const currentOperation = ref<INodeConfigData | null>(null);

  const formTempData: IFormData = {
    node_id_: null,
    routing_operation_id_: null,
    trigger_txn_enabled_: false,
    operation_before_txn_check_enabled_: false,
    operation_advance_execution_enabled_: false,
    split_sn_enabled_: false,
    final_output_bool_: false,
    form_entries_: [],
    document_entries_: [],
    trigger_txn_entries_: [],
    before_txn_check_entries_: [],
    operation_advance_execution_entries_: [],
  } as any;

  /** 所有节点配置表单数据 */
  const nodeConfigFormsData = reactive({} as Record<string, IFormData>);

  const formRef = ref();
  const formData = ref<IFormData>({
    ...formTempData,
  });

  const updateNodeConfig = debounce((newVal: IFormData) => {
    if (newVal && newVal.node_id_) {
      nodeConfigFormsData[newVal.node_id_] = cloneDeep(newVal);

      Event.runEventByName(
        'onChange',
        props.widget.events,
        currentOperation.value,
        cloneDeep(newVal),
      );
    }
  }, 200);
  watch(
    () => formData.value,
    (newVal) => {
      updateNodeConfig(newVal);
    },
    {
      deep: true,
    },
  );

  // ========================================工艺路线节点配置==================================================================
  const {
    // 需要用来绑定组件，不能删除
    workflowNodesRef,
    workflowModelValue,
    computedWorkflowId,
    workflowSchema,
    workflowData,
    getNodeSnStatus,
    isMainNode,
    handleSelectedEvent,
    handleGraphMountedEvent,
    setWorkflowReadonly,
  } = useWorkflowNodes({
    props,
    setOperation,
    initNodesConfigFormData,
  });

  // =========================================子表配置====================================================================
  const tableDict = computed(() => {
    if (currentOperation.value?.node_id_) {
      const currentNodeData = nodeConfigFormsData[currentOperation.value?.node_id_];
      const DICT_KEY = entriesKey.value + 'dict_';
      return currentNodeData?.[DICT_KEY];
    }
    return {};
  });
  const tableData = computed(() => {
    const tableValue = formData.value?.[entriesKey.value]?.filter((d) => !d.deleted_) || [];
    if (readonlyEnabled) {
      return transformSourceData(tableValue, tableDict.value);
    }
    return tableValue;
  });

  const {
    tableLoading,
    tableWidget,
    tableColumns,
    operateColumn,
    validateRule,
    customValidateRules,
    refTxnFormData,
    handleAddRow,
    editedFields,
    initEditTracking,
    txnOptions,
    filterOption,
  } = useTableEntry(props, {
    formData,
    entriesKey,
  });

  // ==================================== 拆分SN ====================================================================
  // 用于拆分SN的节点
  const splitSnNode = ref<any>(null);
  const snCheckVisible = computed(() => {
    // 配置项应该只出现在主路径工序上
    const _isMain = isMainNode(currentOperation.value);
    return (
      !readonlyEnabled &&
      _isMain &&
      (!splitSnNode.value ||
        splitSnNode.value?.routing_operation_id_ === currentOperation.value?.routing_operation_id_)
    );
  });
  const _snSplitEnabled = ref(false);
  const computedSnEnabled = computed(() => {
    return snSplitEnabled && _snSplitEnabled.value;
  });

  // =================================== 产出工序 ====================================================================
  const finalOutputNode = ref<any>(null);
  const finalOutputCheckVisible = computed(() => {
    return (
      !readonlyEnabled &&
      (!finalOutputNode.value ||
        finalOutputNode.value?.routing_operation_id_ ===
          currentOperation.value?.routing_operation_id_)
    );
  });
  const _finalOutputEnabled = ref(false);
  const computedFinalOutputEnabled = computed(() => {
    return finalOutputEnabled && _finalOutputEnabled.value;
  });

  /**根据索引校验 */
  async function validateByIndex(rowIndex) {
    const nameList = tableColumns.value
      .filter((i) => i.props.field)
      .map((i) => {
        return [entriesKey.value, rowIndex, i.props.field];
      });
    await formRef.value.validateFields(nameList);
  }

  async function fullValidate() {
    await formRef.value.validate();
  }

  // #region Checkbox Trigger Change Area
  const { handleTxnTriggerChange, handleTxnCheckChange, handlePreExecuteChange } =
    useOperationTrigger(formData, currentStep, stepOptions);

  function handleSnSplitChange(checked: boolean) {
    formData.value.split_sn_enabled_ = checked;
    if (checked) {
      splitSnNode.value = currentOperation.value;
      formData.value.trigger_txn_enabled_ = true;
      formData.value.isSnStatus = true;
      if (currentOperation.value) {
        currentOperation.value.isSnStatus = true;
      }
    } else {
      splitSnNode.value = null;
      formData.value.isSnStatus = false;
      if (currentOperation.value) {
        currentOperation.value.isSnStatus = false;
      }
    }
  }

  function handleFinalOutputChange(checked: boolean) {
    formData.value.final_output_bool_ = checked;
    if (checked) {
      finalOutputNode.value = currentOperation.value;
    } else {
      finalOutputNode.value = null;
    }
  }
  // #endregion

  /**
   * @description 工艺节点点击后触发
   * @param val 工艺路线节点信息
   */
  async function setOperation(val) {
    console.log(
      '==================》setOperation《=====================',
      val,
      nodeConfigFormsData,
      Date.now(),
      '*********************************',
      workflowData.value,
    );
    if (val) {
      const hasNodeConfig = val.node_id_ && nodeConfigFormsData?.[val.node_id_];
      if (hasNodeConfig) {
        const currentNodeData = nodeConfigFormsData[val.node_id_];
        formData.value = cloneDeep(currentNodeData);
      } else {
        const nodeData = cloneDeep({
          ...formTempData,
          node_id_: val.node_id_,
          routing_operation_id_: val.id_,
        });
        formData.value = nodeData;
      }
      const isSnStatus = await getNodeSnStatus(splitSnNode.value, val);

      currentOperation.value = {
        ...val,
        isSnStatus,
      };

      Object.assign(formData.value, {
        routing_operation_id_: val.id_,
        node_id_: val.node_id_,
        isSnStatus: isSnStatus,
      });
    } else {
      formData.value = cloneDeep(formTempData);
      splitSnNode.value = null;
      finalOutputNode.value = null;
      currentOperation.value = null;
    }
    currentStep.value = 0;
    Event.runEventByName('onSelected', props.widget.events, currentOperation.value, formData.value);
  }
  /**
   * @requires 调用时机: 工艺路线加载完成后
   * @param configs 多节点配置数据
   */
  function initNodesConfigFormData(configs?: any[]) {
    if (!configs || !configs?.length) {
      for (let k in nodeConfigFormsData) {
        nodeConfigFormsData[k] && delete nodeConfigFormsData[k];
      }
      return;
    }

    if (!workflowData.value?.length) return;

    const nodes = workflowData.value?.filter((d) => d.type_ === WorkflowNodeTypeEnum.NODE_SPEC);
    console.log(nodes, 'nodes=================');
    if (nodes.length) {
      nodes.forEach((node) => {
        if (configs?.length) {
          const config = configs.find((d) => d.routing_operation_id_ === node.id_);
          if (config) {
            nodeConfigFormsData[node.node_id_] = cloneDeep(
              Object.assign(config, {
                node_id_: node.node_id_,
                form_entries_: config.form_entries_ ?? [],
                document_entries_: config.document_entries_ ?? [],
                trigger_txn_entries_: config.trigger_txn_entries_ ?? [],
                before_txn_check_entries_: config.before_txn_check_entries_ ?? [],
                operation_advance_execution_entries_: convertPreOperationEntries(
                  config.operation_advance_execution_entries_,
                  readonlyEnabled || false,
                ),
              }),
            );
          }
        } else {
          // 节点配置不存在，给定默认格式数据
          const nodeData = cloneDeep({
            ...formTempData,
            node_id_: node.node_id_,
            routing_operation_id_: node.id_,
          });
          nodeConfigFormsData[node.node_id_] = nodeData;
        }
      });
    }
    console.log(nodeConfigFormsData, 'nodeConfigFormsData=================');
    if (!isEmpty(nodeConfigFormsData)) {
      getInitNode();
    }
  }

  // 获取【SN拆分节点】、【最终产出节点】
  function getInitNode() {
    const _splitNode = Object.values(nodeConfigFormsData).find((it) => !!it.split_sn_enabled_);
    const _finalOutputNode = Object.values(nodeConfigFormsData).find(
      (it) => !!it.final_output_bool_,
    );

    if (_splitNode) {
      const nodeName = workflowData.value?.find(
        (n) => n.id_ === _splitNode.routing_operation_id_,
      )?.name_;
      splitSnNode.value = Object.assign(_splitNode, { name_: nodeName });
    }
    if (_finalOutputNode) {
      const nodeName = workflowData.value?.find(
        (n) => n.id_ === _finalOutputNode.routing_operation_id_,
      )?.name_;
      finalOutputNode.value = Object.assign(_finalOutputNode, { name_: nodeName });
    }
  }

  // 顺序调整
  async function openSequenceAdjustmentModal() {
    try {
      await fullValidate();

      const sortData = formData.value?.[entriesKey.value].map((item) => {
        return {
          id_: item.id_ || item._X_ROW_KEY,
          name_: item.name_,
          force_submit_: item.force_submit_,
          deleted_: item.deleted_,
        };
      });

      const { reorderFormEntriesInPlace } = useFormEntriesReorder(formData.value, entriesKey.value);

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

  defineExpose({
    getWorkflowData: () => workflowData.value,
    setWorkflowReadonly,
    getValue() {
      for (let k in formData.value) {
        if (Array.isArray(formData.value[k]) && formData.value[k].length) {
          const d = formData.value[k];
          formData.value[k] = d.map((item) => {
            return {
              ...item,
              ...refTxnFormData.value,
            };
          });
        }
      }
      return formData.value;
    },
    setValue(val) {
      formData.value = val;
    },
    getAllConfigs() {
      let configData = {};
      for (let k in nodeConfigFormsData) {
        const set = nodeConfigFormsData[k];
        configData[k] = {
          ...set,
          form_entries_: set.form_entries_.filter(
            (item) => !!item.doc_outline_id_ || item.deleted_,
          ),
          document_entries_: set.document_entries_.filter(
            (item) => !!item.document_id_ || item.deleted_,
          ),
          trigger_txn_entries_: set.trigger_txn_entries_.filter(
            (item) => !!item.event_ || item.deleted_,
          ),
          before_txn_check_entries_: set.before_txn_check_entries_.filter(
            (item) => !!item.txn_definition_id_ || item.deleted_,
          ),
          operation_advance_execution_entries_: convertPreOperationEntries(
            set.operation_advance_execution_entries_,
            true,
          )?.filter((item) => !!item.before_operation_id_ || item.deleted_),
        };
      }
      return configData;
    },
    setOperation,
    getOperation() {
      return currentOperation.value;
    },
    initConfigsData: initNodesConfigFormData,

    validateByIndex,
    fullValidate,

    isEdited: () => editedFields.value?.size > 0,
    initEditTracking,
    openSn(enabled) {
      _snSplitEnabled.value = !!enabled;
    },
    openFinalOutput(enabled) {
      _finalOutputEnabled.value = !!enabled;
    },
  });
</script>

<style lang="less" scoped>
  .operation-config {
    &-title {
      position: relative;
      padding-left: 8px;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: var(--ant-primary-color);
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
