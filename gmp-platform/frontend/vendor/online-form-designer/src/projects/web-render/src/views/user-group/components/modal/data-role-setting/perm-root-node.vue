<template>
  <div class="perm-root-node">
    <div>
      <a-form-item-rest>
        <a-radio-group v-model:value="operatorType" :disabled="readonly">
          <a-radio-button
            v-for="operator in OperatorOptions"
            :key="operator.value"
            :value="operator.value"
            >{{ operator.label }}</a-radio-button
          >
        </a-radio-group>
      </a-form-item-rest>
    </div>
    <!-- <a-button v-if="!readonly" type="primary" class="ml-24px" ghost @click="handleAddGroup">
      <template #icon>
        <plus-outlined />
      </template>
      {{ t('sys.appDesigner.createGroup') }}
    </a-button> -->
    <!-- <div class="perm-root-node-add-row" @click="handleAddRow">
      <plus-outlined />
      {{ t('sys.add') }}
    </div> -->
  </div>
</template>
<script setup lang="ts" name="perm-root-node">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Ch_Perm_Operator, OperatorTypeEnum } from '../../../constant/interface';
  import { useDataRulesTree } from '../../../hooks/useDataRulesTree';
  import type { SelectProps } from 'ant-design-vue';

  const { t } = useI18n();

  const OperatorOptions: SelectProps['options'] = [
    {
      label: t(Ch_Perm_Operator[OperatorTypeEnum.AND]),
      value: OperatorTypeEnum.AND,
    },
    {
      label: t(Ch_Perm_Operator[OperatorTypeEnum.OR]),
      value: OperatorTypeEnum.OR,
    },
  ];

  interface Props {
    data: object;
    /** 树的层级，从0开始 */
    level?: number;
    /** key */
    id: string;
    /** 操作类型 */
    operatorType: string;
    readonly: boolean;
  }

  const props = defineProps<Props>();

  const { updateNodeItem, addNewRow } = useDataRulesTree(props.readonly);

  const operatorType = computed<string>({
    get() {
      return props.operatorType;
    },
    set(value: string) {
      updateNodeItem(props.id, 'operatorType', value);
    },
  });

  // const treeId = computed(() => props.data.key);

  // const handleAddRow = () => {
  //   addNewRow(treeId.value);
  // };
</script>
<style lang="less" scoped>
  .perm-root-node {
    display: flex;
    justify-content: space-between;
    .ant-btn {
      line-height: 22px;
      .iconfont {
        font-size: 14px;
      }
    }
  }

  .ant-radio-button-wrapper-checked {
    background-color: rgba(from var(--ant-primary-color) r g b / 8%);
  }

  :deep(.ant-select.perm-root-node-select.ant-select-disabled) {
    .ant-select-selector {
      border-color: #fff !important;
      background: #e6eeff;
      color: #3168ec;
      cursor: default;
      .ant-select-selection-item {
        padding-right: 0;
      }
    }
  }

  .perm-root-node-add-row {
    color: var(--ant-primary-color);
    cursor: pointer;
  }

  :deep(.ant-select-selector) {
    border: none !important;
    background-color: var(--ant-primary-1) !important;
    color: var(--ant-primary-color) !important;
  }
  :deep(.ant-select-arrow) {
    color: var(--ant-primary-color) !important;
  }

  :deep(.ant-radio-group) {
    border-radius: 6px;
    border: 1px solid #e8ebf0;
    background-color: #e8ebf0;
    .ant-radio-button-wrapper {
      border-color: #e8ebf0;
      color: #5a5f6b;
      padding: 0 24px;
      font-weight: 400;
      background-color: transparent;
      &:first-child {
        border-radius: 4px;
      }
      &:last-child {
        border-radius: 4px;
      }
      &:hover {
        color: #5a5f6b;
        background-color: #f5f6f8;
      }
      &.ant-radio-button-wrapper-checked {
        color: #1a1d23;
        background-color: #fff;
        font-weight: 500;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
      }
    }
    .ant-radio-button-wrapper-checked.ant-radio-button-wrapper:first-child {
      border-right-color: #e8ebf0;
    }

    .ant-radio-button-wrapper:not(:first-child):before {
      width: 2px;
      background-color: #e8ebf0;
    }

    .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
    }
  }
</style>
