<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.org.delOrg')"
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="delFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      {{t('sys.org.delOrgTip')}}
      <a-form-item label="" name="targetParentId" :rules="[{ required: true }]">
        <a-tree-select
          show-search
          v-model:value="formState.targetParentId"
          :show-checked-strategy="TreeSelect.SHOW_PARENT"
          :fieldNames="{ children: 'children', label: 'name', value: 'id' }"
          :height="233"
          :tree-data="treeData"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { TreeSelect } from 'ant-design-vue';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { transferAndDeleteOrg, getOrgListApi } from '/@backend-management/api/org-user/org';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { treeData, initTree } = useTreeList();

  //Form
  const delFormRef = ref<FormInstance>();
  const formState = reactive({
    id: '',
    targetParentId: '',
  });
  //Modal
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && (formState.id = data.id);
  });
  const handleOk = () => {
    delFormRef.value?.validate().then(async () => {
      await transferAndDeleteOrg({
        id: formState.id,
        targetParentId: formState.targetParentId,
      });
      initTree(getOrgListApi);
      closeModal();
    });
  };
  const handleClose = () => {
    delFormRef.value?.resetFields();
  };
</script>

<style scoped></style>
