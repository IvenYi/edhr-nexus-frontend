<template>
  <div :class="`${prefixCls}-wrapper`" id="bi-app-manage-cmp">
    <bi-app-center-container
      id="bi-app-contain"
      ref="containerRef"
      :prefixCls="prefixCls"
      :tenantId="userStore.getTenant"
      :developerType="userStore.getTenantUserInfo?.tenantDeveloperType"
      :hasBILicense="hasBILicense"
      @create-app="handleCreateApp"
    />
    <app-modal @register="appRegister" @ok="handleModalOk" />
  </div>
</template>

<script setup lang="ts" name="bi-app-center-wrapper">
  import { ref, onBeforeMount, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { AppModal } from '/@/components/AppManageCmp/index';
  import { useModal } from '/@/components/Modal';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { AppClassifyEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';
  import { postApp, getAppInfoById, putAppById } from '/@/apis/gct-platform/AppController';
  import BiAppCenterContainer from './bi-app-center-container.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const { t } = useI18n();
  const { prefixCls } = useDesign('bi-app-manage-cmp');
  const { emitter, EmitterEnum } = useEmitter();

  const userStore = useUserStoreWithOut();
  const containerRef = ref();
  const hasBILicense = ref(false);
  const [appRegister, { openModal }] = useModal();

  onBeforeMount(() => {
    getBILicense();
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

  /** 获取BI是否有授权 */
  const getBILicense = () => {
    getLicenseModuleAuth().then((res) => {
      hasBILicense.value = res || false;
      if (!hasBILicense.value) {
        router.push({ path: '/bi-404' });
      }
    });
  };

  const handleCreateApp = (appType: AppClassifyEnum) => {
    openModal(true, {
      modalType: 'create',
      type: appType,
      tenantId: userStore.getTenant,
    });
  };

  const handleModalOk = async (result) => {
    if (result.type === 'create') {
      await postApp(result.info);
      message.success(t('sys.developer.appCenter.createSuccess'));
    } else if (result.type === 'edit') {
      await putAppById({ id: result.info.id }, result.info);
      message.success(t('sys.developer.appCenter.editSuccess'));
      emitter.emit(EmitterEnum.on_refresh_app_detail, { id: result.info.id });
    }
    containerRef.value?.getAppTableData();
  };

  onMounted(() => {
    // 滚动到我的专业应用固定
    const applicationElement = document.getElementById('bi-app-manage-cmp');
    applicationElement?.addEventListener('scroll', function () {
      const searchElement = document.getElementsByClassName('search-container')[0];
      const navContentElement = document.getElementsByClassName('application-content')[0];
      if (applicationElement.scrollTop > 56) {
        navContentElement.style.position = 'relative';
        navContentElement.style.ZIndex = '2';

        searchElement.style.position = 'fixed';
        searchElement.style.top = '124px';
        searchElement.style.width = 'calc(100% - 44px)';
        searchElement.style.left = '0';
        searchElement.style.zIndex = '3';
      } else {
        navContentElement.style.left = '0';
        navContentElement.style.top = '0';
        navContentElement.style.paddingTop = '0';

        searchElement.style.position = 'relative';
        searchElement.style.top = '0';
        searchElement.style.width = 'calc(100% - 40px)';
        searchElement.style.left = '0';
      }
    });
  });
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-bi-app-manage-cmp';

  .@{prefix-cls}-wrapper {
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }
</style>
