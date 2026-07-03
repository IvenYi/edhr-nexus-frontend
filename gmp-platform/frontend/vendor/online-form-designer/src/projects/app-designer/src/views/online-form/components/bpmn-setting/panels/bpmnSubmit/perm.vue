<template>
  <div>
    <a-form :model="formState" layout="vertical">
      <SimpleCollapse :title="t('sys.appDesigner.approval.buttonPerm')">
        <OpConfig
          :edit-ops="editOpts"
          :is-show-custom-btn="false"
          v-model:value="formState!.buttonConfig"
        />
      </SimpleCollapse>
      <SimpleCollapse title="权限组">
        <PermissionGroupSetting2 v-model:value="formState!.permissionConfig" />
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { OpConfig } from '/@online-form/approval';
  import { getNodeOperateBySuiteKey } from '../../constant';
  import PermissionGroupSetting2 from '../../../base-permission/permission-group-setting2.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { t } = useI18n();

  const props = defineProps<{
    node: GctBpmnNode.BpmnStart;
  }>();

  // 根据应用计算支持的按钮
  const appInfoStore = useAppInfoStore();
  const editOpts = getNodeOperateBySuiteKey(props.node.type, appInfoStore.appInfo.suiteKey!);

  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });
</script>

<style></style>
