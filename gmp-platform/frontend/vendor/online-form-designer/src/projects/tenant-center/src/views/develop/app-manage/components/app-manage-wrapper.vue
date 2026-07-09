<template>
  <div :class="`${prefixCls}-wrapper`" id="application-manage-cmp">
    <app-manage-container
      ref="containerRef"
      :prefixCls="prefixCls"
      :tenantId="userStore.getTenant"
    />
    <app-modal @register="appRegister" @ok="handleModalOk" />
  </div>
</template>

<script setup lang="ts" name="app-manage-wrapper">
  import { ref, onBeforeMount } from 'vue';
  import { message } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import AppManageContainer from './app-manage-container.vue';
  import { AppModal } from '/@/components/AppManageCmp/index';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { getAppInfoById, putAppById } from '/@/apis/gct-platform/AppController';

  const { prefixCls } = useDesign('application-manage-cmp');

  const { t } = useI18n();

  const userStore = useUserStoreWithOut();

  const [appRegister, { openModal }] = useModal();
  const { emitter, EmitterEnum } = useEmitter();

  const containerRef = ref();

  onBeforeMount(() => {
    emitter.on(EmitterEnum.on_edit_app, async (data: any) => {
      const info = await getAppInfoById({ id: data.id });
      openModal(true, {
        modalType: 'edit',
        type: data.type,
        tenantId: userStore.getTenant,
        info,
      });
    });
  });

  const handleModalOk = async (result) => {
    if (result.type === 'edit') {
      console.log('result', result);
      await putAppById({ id: result.info.id }, result.info);
      message.success(t('sys.developer.appCenter.editSuccess'));
      emitter.emit(EmitterEnum.on_refresh_app_detail, { id: result.info.id });
    }
    containerRef.value?.getAppTableData();
  };
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-wrapper {
    position: relative;
    overflow: hidden;
    height: 100%;
    background: #f0f2f5;
  }
</style>
