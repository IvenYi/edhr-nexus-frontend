<template>
  <a-form-item :label="$t('sys.pageDesigner.bindingPermission')" style="margin-bottom: 0">
    <a-button type="link" class="gct-new-btn" @click="openPerModal()">
      {{ $t('sys.pageDesigner.newPermission') }}
    </a-button>
    <a-select
      v-model:value="pageJson.permissions[defProps.widget!.id]"
      allow-clear
      :placeholder="$t('sys.chooseText')"
      size="small"
    >
      <a-select-option v-for="per in pagePermissions" :key="per.key" :value="per.key">{{
        per.name
      }}</a-select-option>
    </a-select>
  </a-form-item>
  <span class="tip">{{ $t('sys.pageDesigner.bindingPermissionTip') }}</span>
  <page-permission-modal @register="permissionRegister" @ok="handlePerOk" />
</template>

<script setup lang="ts" name="permission-editor">
  import { pagePermissions, platform } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { props } from '/@page-designer/hooks/usePropEditor';
  import pagePermissionModal from '../../page/modals/page-permission-modal.vue';
  import { useModal } from '/@/components/Modal';
  import {
    getPermissionList,
    postPermission,
    putPermissionById,
  } from '/@/apis/gct-apaas/PermissionController';
  import { useQueryStore } from '/@/store/modules/query';

  const defProps = defineProps(props);
  const { pageJson } = useDesigner();
  const [permissionRegister, { openModal: openPerModal, closeModal: closePerModal }] = useModal();

  const handlePerOk = async (data) => {
    const queryStore = useQueryStore();
    !data.id
      ? await postPermission({
          ...data,
          terminalType: platform.value.toUpperCase(),
          relationId: queryStore.getPid(),
        })
      : await putPermissionById(
          { id: data.id },
          {
            name: data.name,
            key: data.key,
            terminalType: platform.value.toUpperCase(),
            relationId: queryStore.getPid(),
          },
        );
    closePerModal();
    pagePermissions.value = (await getPermissionList({ relationId: queryStore.getPid() })) || [];
  };
</script>

<style lang="less" scoped>
  .gct-new-btn {
    position: absolute;
    right: 0;
    top: -30px;
    z-index: 1;
  }
  :deep(.ant-btn) {
    padding: 0;
  }
  .tip {
    margin-top: 4px;
    font-size: 12px;
    color: #c3c3c3;
  }
</style>
