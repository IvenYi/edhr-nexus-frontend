import { Ref, ComputedRef, computed } from 'vue';
import { cloneDeep } from 'lodash-es';
import { IOperationNodeConfig } from '/@/projects/web-render/src/render/Event/Modal/kit-edhr/types';
import { setAllAsDeleted } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/operation-config/composable/useTableEntry';

export const dynamicTriggerEntryMap: Record<string, string> = {
  trigger_txn_entries_: 'trigger_txn_enabled_',
  before_txn_check_entries_: 'operation_before_txn_check_enabled_',
  operation_advance_execution_entries_: 'operation_advance_execution_enabled_',
};

export function useOperationTrigger(
  formData: Ref<IOperationNodeConfig>,
  currentStep: Ref<number>,
  stepOptions: ComputedRef<any[]>,
) {
  const currentStepEntity = computed(() => {
    return stepOptions.value[currentStep.value] ?? stepOptions.value[0];
  });

  function handleTxnTriggerChange(checked: boolean) {
    handleDynamicTriggerChange('trigger_txn_enabled_', checked);
  }

  function handleTxnCheckChange(checked: boolean) {
    handleDynamicTriggerChange('operation_before_txn_check_enabled_', checked);
  }

  function handlePreExecuteChange(checked: boolean) {
    handleDynamicTriggerChange('operation_advance_execution_enabled_', checked);
  }

  function handleDynamicTriggerChange(
    triggerType:
      | 'trigger_txn_enabled_'
      | 'operation_before_txn_check_enabled_'
      | 'operation_advance_execution_enabled_',
    checked: boolean,
  ) {
    type FormDataKeys = keyof typeof formData.value;
    const safeKey = triggerType as FormDataKeys;

    if (safeKey) {
      (formData.value as any)[triggerType] = checked;
    }

    if (!checked) {
      const entryKey = Object.keys(dynamicTriggerEntryMap).find(
        (key) => dynamicTriggerEntryMap[key] === triggerType,
      ) as FormDataKeys;
      const currentEntries = cloneDeep(formData.value?.[entryKey]);
      (formData.value as any)[entryKey] = setAllAsDeleted(currentEntries);
      currentStep.value =
        stepOptions.value.findIndex((i) => i.entryKey === currentStepEntity.value?.entryKey) ?? 0;
    }
  }

  return {
    dynamicTriggerEntryMap,
    handleTxnTriggerChange,
    handleTxnCheckChange,
    handlePreExecuteChange,
  };
}
