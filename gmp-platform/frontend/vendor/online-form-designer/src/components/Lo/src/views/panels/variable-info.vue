<template>
  <a-collapse
    v-model:activeKey="activeKey"
    ghost
    expandIconPosition="right"
    style="height: 100%; overflow: auto"
  >
    <a-collapse-panel header="参数变量" key="local_">
      <div class="variable-item" v-for="item in loDataObject.parameter" :key="item">
        <div>{{ item }}</div>
      </div>
    </a-collapse-panel>
    <a-collapse-panel header="局部变量" key="local_variable">
      <div class="pl-30px pr-30px pb-12px">
        <a-button type="primary" block @click="handleAddVariable">{{ t('添加变量') }}</a-button>
      </div>
      <div class="variable-item" v-for="item in loDataObject.variables" :key="item.name">
        <div>{{ item.name }}</div>
        <div>{{ item.type }}</div>
        <i class="iconfont icon-a-Single-linetext" @click="handleEditVariable(item)"></i>
        <i class="iconfont icon-shanchu" @click="handleDeleteVariable(item)"></i>
      </div>
    </a-collapse-panel>
    <a-collapse-panel header="全局变量" key="global_variable">
      <div class="variable-item" v-for="item in gVar" :key="item.key">
        <div>{{ item.key }}</div>
        <div>{{ t(`sys.pageDesigner.${item.varInfo.type}`) }}</div>
      </div>
    </a-collapse-panel>
  </a-collapse>
  <variable-modal @register="register" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useLo } from '../../hooks/useLo';
  import VariableModal from '../modals/variable-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGlobal } from '/@page-designer/hooks/useGlobal';

  const activeKey = ref<string[]>(['local_variable', 'global_variable']);

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const { gVar } = useGlobal();

  const { loDataObject, addVariable, updateVariable, deleteVariable } = useLo();

  const handleAddVariable = () => {
    openModal(true, {
      isEdit: false,
      callback: (data) => {
        console.log(data);
        addVariable(data);
      },
      list: loDataObject.value.variables,
    });
  };

  const handleEditVariable = (data) => {
    openModal(true, {
      isEdit: true,
      data,
      callback: (data) => {
        updateVariable(data);
      },
      list: loDataObject.value.variables,
    });
  };

  const handleDeleteVariable = (data) => {
    deleteVariable(data);
  };
</script>

<style lang="less" scoped>
  .variable-item {
    position: relative;
    padding: 16px 12px 10px;
    border-bottom: 1px solid #eaeaea;
    color: #333;
    font-size: 14px;

    & > div:nth-child(2) {
      margin-top: 5px;
      color: #9d9da6;
    }

    &:hover {
      background: #f5f5f5;
    }

    .iconfont {
      position: absolute;
      right: 45px;
      bottom: 10px;
      color: #7f8695;
      cursor: pointer;

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
      padding-right: 0;
      padding-left: 0;
    }
  }
</style>
