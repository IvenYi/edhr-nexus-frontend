<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :okText="t('sys.okText')"
    wrapClassName="ant-modal-new vxe-table--ignore-clear"
    center
    width="800px"
    :after-close="afterClose"
    @ok="handleOk"
  >
    <dept-user-modal v-model:value="selectedDeptUsers" />
  </a-modal>
</template>
<script setup lang="ts" name="select-user-modal">
  import { ref } from 'vue';
  import DeptUserModal from './dept-user-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['ok']);

  const selectedDeptUsers = ref([]);

  const title = ref('');

  const { t } = useI18n();

  const visible = ref(false);

  const open = (data) => {
    visible.value = true;
    console.log('visible', data.selectedValue);

    title.value = data.title || $t('sys.pageDesigner.fieldCmp.range_user');
    if (data && data.selectedValue && Array.isArray(data.selectedValue)) {
      const selected = data.selectedValue;
      selectedDeptUsers.value = selected.filter((e) => e.includes('ORG:') || e.includes('USER:'));
      console.log('selectedDeptUsers', selectedDeptUsers.value);
    }
  };

  const handleOk = () => {
    visible.value = false;
    emit('ok', [...selectedDeptUsers.value]);

    selectedDeptUsers.value = [];
  };

  const afterClose = () => {
    selectedDeptUsers.value = [];
  };
  defineExpose({ open });
</script>
