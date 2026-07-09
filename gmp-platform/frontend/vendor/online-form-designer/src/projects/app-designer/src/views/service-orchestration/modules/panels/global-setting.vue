<template>
  <a-collapse
    v-model:activeKey="activeKey"
    ghost
    expandIconPosition="right"
    style="height: 100%; overflow: auto"
  >
    <a-collapse-panel header="变量" key="variable">
      <div class="pl-30px pr-30px pb-12px">
        <a-button type="primary" block @click="handleAddVariable">{{ t('添加变量') }}</a-button>
      </div>
      <div class="variable-item" v-for="item in soDataObject.variables" :key="item.name">
        <div>{{ item.type }}</div>
        <div>{{ item.name }}</div>
        <i class="iconfont icon-a-Single-linetext" @click="handleEditVariable(item)"></i>
        <i class="iconfont icon-shanchu" @click="handleDeleteVariable(item)"></i>
      </div>
    </a-collapse-panel>
  </a-collapse>
  <variable-modal @register="register" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useSOInstance } from '../../hooks/useSOInstance';
  import VariableModal from '../modals/variable-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  const activeKey = ref<string[]>(['variable']);

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const { soDataObject, addVariable, updateVariable, deleteVariable } = useSOInstance();

  const handleAddVariable = () => {
    openModal(true, {
      isEdit: false,
      callback: (data) => {
        addVariable(data);
      },
      list: soDataObject.value.variables,
    });
  };

  const handleEditVariable = (data) => {
    openModal(true, {
      isEdit: true,
      data,
      callback: (data) => {
        updateVariable(data);
      },
      list: soDataObject.value.variables,
    });
  };

  const handleDeleteVariable = (data) => {
    deleteVariable(data);
  };
</script>

<style lang="less" scoped>
  .variable-item {
    font-size: 14px;
    color: #333;
    padding: 16px 12px 10px;
    position: relative;
    border-bottom: 1px solid #eaeaea;

    & > div:nth-child(2) {
      color: #9d9da6;
      margin-top: 5px;
    }

    &:hover {
      background: #f5f5f5;
    }

    .iconfont {
      position: absolute;
      right: 45px;
      bottom: 10px;
      cursor: pointer;
      color: #7f8695;
      &:hover {
        color: var(--ant-primary-color);
      }

      &:nth-of-type(2) {
        right: 15px;
        &:hover {
          color: #ff4d4f;
        }
      }
    }
  }

  .ant-collapse {
    :deep(.ant-collapse-header) {
      border-bottom: 1px solid #eaeaea;
    }
    :deep(.ant-collapse-content-box) {
      padding-left: 0px;
      padding-right: 0px;
    }
  }
</style>
