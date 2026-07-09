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
    <div class="org-delete-modal-area">
      <div class="title">{{ t('sys.org.delOrgTip') }}</div>
      <a-form ref="formRef" :model="formState" :wrapper-col="{ span: 24 }" autocomplete="off">
        <a-form-item label="" name="targetParentId" :rules="[{ required: true }]">
          <a-tree-select
            show-search
            v-model:value="formState.targetParentId"
            :show-checked-strategy="TreeSelect.SHOW_PARENT"
            :fieldNames="{ children: 'children', label: 'name', value: 'id' }"
            :height="233"
            :tree-data="filterData"
          />
        </a-form-item>
      </a-form>
    </div>
  </basic-modal>
</template>
<script setup lang="ts" name="org-delete-modal">
  import { reactive, ref, toRaw } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useTreeList from '/@backend-management/hooks/useTreeList';

  import type { FormInstance } from 'ant-design-vue';

  interface FormState {
    /** 选中组织id */
    id: string;
    /** 目标位置父节点id，不传或传「ROOT」则代表根节点 */
    targetParentId: string;
  }

  const { t } = useI18n();

  const emit = defineEmits(['ok', 'register']);

  const { initTree, getFilterTreeData } = useTreeList();

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    id: '',
    targetParentId: '',
  });

  const filterData = ref<any>([]);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.id = data.id;
      filterData.value = getFilterTreeData({ tenantId: data.tenantId });
    }
  });

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.id = '';
    formState.targetParentId = '';
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      emit('ok', { ...toRaw(formState) });
      closeModal();
    });
  };
</script>
<style scoped lang="less">
  .org-delete-modal-area {
    padding: 16px 48px;
    .title {
      line-height: 22px;
      margin-bottom: 8px;
    }
  }
</style>
