<template>
  <div class="base-permission">
    <div class="base-permission-left">
      <a-menu v-model:selectedKeys="selectedKeys" style="width: 256px" mode="inline">
        <a-menu-item key="button">
          <i class="iconfont icon-anniuzu"></i>
          {{ $t('sys.webRender.buttonDesign') }}
        </a-menu-item>
        <a-menu-item key="permission">
          <i class="iconfont icon-shujufenzu"></i>
          {{ $t('sys.auth.OrgPermissionRole.PermissionSetting') }}
        </a-menu-item>
      </a-menu>
    </div>
    <div class="base-permission-right">
      <BaseButtonSetting
        ref="buttonRef"
        v-show="selectedKeys[0] === 'button'"
        :templateInfo="templateInfo"
        v-model:is-changed="buttonIsChanged"
      />
      <PermissionGroupSetting
        ref="permissionRef"
        v-show="selectedKeys[0] === 'permission'"
        :templateInfo="templateInfo"
        v-model:is-changed="permissionIsChanged"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="base-permission">
  import { onMounted, provide, reactive, ref } from 'vue';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import BaseButtonSetting from '../base-button-setting/base-button-setting.vue';
  import PermissionGroupSetting from './permission-group-setting.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postOnlineFormTmplSaveOperation } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { message } from 'ant-design-vue';
  import { useFieldPermission } from './field-permission/use-field-permission';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      templateInfo: OnlineFormTmplResponse;
    }>(),
    {},
  );
  const c = useFieldPermission(props.templateInfo.modelKey!);
  provide('FieldPermissionController', c);
  c.init({ designerJson: props.templateInfo.designerJson });

  const selectedKeys = ref<string[]>(['button']);

  const buttonRef = ref<any>();
  const permissionRef = ref<any>();
  const buttonIsChanged = ref(false);
  const permissionIsChanged = ref(false);

  const checkHasUnsaved = () => {
    return buttonIsChanged.value || permissionIsChanged.value;
  };

  const handleSave = async () => {
    if (permissionRef.value.hasEdit()) {
      message.warning($t('sys.edhr.savePermGroupFirst'));
      return Promise.reject();
    }
    const operation = await buttonRef.value.getSaveData();
    const permissionConfig = await permissionRef.value.getSaveData();
    await postOnlineFormTmplSaveOperation({
      id: props.templateInfo.id,
      operation,
      permissionConfig,
    });
    message.success(t('sys.saveSuccess'));

    // 重置变更状态
    buttonIsChanged.value = false;
    permissionIsChanged.value = false;
  };

  defineExpose({ checkHasUnsaved, handleSave });
</script>

<style lang="scss" scoped>
  .base-permission {
    height: 100%;
    display: flex;
    .base-permission-left {
      width: 256px;
      border-right: 1px solid #f0f0f0;
      background-color: #fff;
    }
    .base-permission-right {
      flex-grow: 1;
      padding: 16px;
      width: 1px;
    }
  }
</style>
