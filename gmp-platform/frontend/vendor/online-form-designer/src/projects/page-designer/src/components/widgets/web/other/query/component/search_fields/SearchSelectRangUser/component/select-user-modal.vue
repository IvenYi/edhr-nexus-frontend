<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :okText="$t('sys.okText')"
    :getContainer="getModalContainer"
    wrapClassName="ant-modal-new vxe-table--ignore-clear"
    center
    width="800px"
    :after-close="afterClose"
    @ok="handleOk"
  >
    <div v-if="visible" class="select-user-wrap">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="$t('sys.role')">
          <Role v-model:value="selectedRoles" :ignoreCase="ignoreCase" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t('sys.userGroup')">
          <UserGroup v-model:value="selectedUserGroups" :ignoreCase="ignoreCase" />
        </a-tab-pane>
        <a-tab-pane key="3" :tab="$t('sys.pageDesigner.deptUser')">
          <DeptUser v-model:value="selectedDeptUsers" :ignoreCase="ignoreCase" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>
<script setup lang="ts" name="select-user-modal">
  import { ref } from 'vue';
  import { useModalDragMove } from '/@/components/Modal/src/hooks/useModalDrag';
  import Role from './role.vue';
  import UserGroup from './userGroup.vue';
  import DeptUser from './deptUser.vue';

  const emit = defineEmits(['ok']);

  const props = defineProps<{
    getContainer?: HTMLElement;
    className?: string;
    ignoreCase?: number;
  }>();

  const getModalContainer = props.className
    ? () => document.querySelector(`.${props.className}`)
    : () => document.body;

  const visible = ref(false);
  const activeKey = ref('1');
  const title = ref('');
  const selectedRoles = ref([]);
  const selectedUserGroups = ref([]);
  const selectedDeptUsers = ref([]);
  // modal拖拽的方法
  useModalDragMove({ visible, destroyOnClose: ref(false), draggable: ref(true) });

  const open = (data) => {
    visible.value = true;
    title.value = data.title || $t('sys.pageDesigner.fieldCmp.range_user');
    activeKey.value = '1';
    if (data && data.selectedValue && Array.isArray(data.selectedValue)) {
      const selected = data.selectedValue;
      selectedRoles.value = selected.filter((e) => e.includes('ROLE:'));
      selectedUserGroups.value = selected.filter((e) => e.includes('USER_GROUP:'));
      selectedDeptUsers.value = selected.filter((e) => e.includes('ORG:') || e.includes('USER:'));
    }
  };

  const handleOk = () => {
    visible.value = false;
    emit('ok', [...selectedRoles.value, ...selectedUserGroups.value, ...selectedDeptUsers.value]);
    selectedRoles.value = [];
    selectedUserGroups.value = [];
    selectedDeptUsers.value = [];
  };

  const afterClose = () => {
    selectedRoles.value = [];
    selectedUserGroups.value = [];
    selectedDeptUsers.value = [];
  };

  defineExpose({ open });
</script>
<style lang="less" scoped>
  .select-user-wrap {
    border: 1px solid #e8ebf0;
    border-radius: 4px;

    :deep(.ant-tabs) {
      .ant-tabs-nav {
        padding: 0 12px;
        margin-bottom: 0;

        .ant-tabs-tab {
          padding: 12px 16px;
        }
      }
      .ant-tabs-content {
        padding: 12px;
      }
    }
  }
</style>
