<template>
  <div class="tree-root-node">
    <a-form-item-rest>
      <a-select
        class="tree-root-node-select"
        :disabled="readonly"
        v-model:value="operatorType"
        style="width: 60px"
        :options="OperatorOptions"
        :placeholder="t('sys.chooseText')"
      />
    </a-form-item-rest>
    <a-button v-if="!readonly" type="primary" class="ml-24px" ghost @click="handleAddGroup">
      <template #icon>
        <plus-outlined />
      </template>
      {{ t('sys.appDesigner.createGroup') }}
    </a-button>
    <a-button
      v-if="!readonly && !isLevel1"
      type="primary"
      ghost
      danger
      class="ml-16px"
      @click="handleDeleteGroup"
    >
      <template #icon>
        <i class="iconfont icon-shanchu1 mr4px"></i>
      </template>
      {{ t('sys.component.userCmp.deleteGroup') }}
    </a-button>
  </div>
  <div
    class="tree-root-node-add-row mt4px"
    @click="handleAddRow"
    v-if="!!isDataFilterEditor && !childrenNum"
  >
    +{{ t('sys.appDesigner.addCondition') }}
  </div>
</template>
<script setup lang="ts" name="tree-root-node">
  import { computed, inject } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Ch_Operator, OperatorTypeEnum } from './constant/interface';
  import { useDataRulesTree } from './hooks/useDataRulesTree';
  import type { SelectProps } from 'ant-design-vue';

  const { t } = useI18n();

  const isDataFilterEditor = inject('isDataFilterEditor') as boolean;

  const OperatorOptions: SelectProps['options'] = [
    {
      label: t(Ch_Operator[OperatorTypeEnum.AND]),
      value: OperatorTypeEnum.AND,
    },
    {
      label: t(Ch_Operator[OperatorTypeEnum.OR]),
      value: OperatorTypeEnum.OR,
    },
  ];

  interface Props {
    data: object;
    /** 树的层级，从0开始 */
    level: number;
    /** key */
    id: string;
    /** 操作类型 */
    operatorType: string;
    readonly: boolean;
  }

  const props = defineProps<Props>();

  const { addNewGroup, deleteGroup, updateNodeItem, addNewRow } = useDataRulesTree(props.readonly);

  const operatorType = computed<string>({
    get() {
      return props.operatorType;
    },
    set(value: string) {
      updateNodeItem(props.id, 'operatorType', value);
    },
  });

  const isLevel1 = computed(() => {
    return props.level === 1;
  });

  const handleAddGroup = () => {
    addNewGroup(props.id);
  };

  const handleDeleteGroup = () => {
    deleteGroup(props.id);
  };

  const treeId = computed(() => props.data.key);

  const childrenNum = computed(() => {
    return props.data?.children?.filter((n) => !n.children).length;
  });

  const handleAddRow = () => {
    addNewRow(treeId.value);
  };
</script>
<style lang="less" scoped>
  .tree-root-node {
    .ant-btn {
      line-height: 22px;

      .iconfont {
        font-size: 14px;
      }
    }
  }

  :deep(.ant-select.tree-root-node-select.ant-select-disabled) {
    .ant-select-selector {
      border-color: #fff !important;
      background: #e6eeff;
      color: #3168ec;
      cursor: default;

      .ant-select-selection-item {
        padding-right: 0;
      }
    }

    .ant-select-arrow {
      display: none;
    }
  }

  .tree-root-node-add-row {
    color: var(--ant-primary-color);
  }

  :deep(.ant-select-selector) {
    border: none !important;
    background-color: var(--ant-primary-1) !important;
    color: var(--ant-primary-color) !important;
  }
  :deep(.ant-select-arrow) {
    color: var(--ant-primary-color) !important;
  }
</style>
