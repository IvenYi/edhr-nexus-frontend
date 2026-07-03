<template>
  <div :class="`${prefixCls}-wrapper`" id="application-manage-cmp">
    <app-center-header-new
      :prefixCls="prefixCls"
      :hasBILicense="hasBILicense"
      @create-app="handleCreateApp"
      @upload="handleUpload"
    />
    <app-center-container-new
      id="app-contain"
      ref="containerRef"
      :prefixCls="prefixCls"
      :tenantId="userStore.getTenant"
      :developerType="userStore.getTenantUserInfo?.tenantDeveloperType"
      @upload="handleUpload"
      @create-app="handleCreateApp"
      :hasBILicense="hasBILicense"
    />

    <app-modal @register="appRegister" @ok="handleModalOk" />
  </div>
</template>

<script setup lang="ts" name="app-center-wrapper">
  import { ref, onBeforeMount, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AppCenterHeaderNew from './app-center-header-new2.vue';
  import AppCenterContainerNew from './app-center-container-new2.vue';
  import { AppModal } from '/@/components/AppManageCmp/index';
  import { useModal } from '/@/components/Modal';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { AppClassifyEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import ImportDetail from './app-import-modal.vue';
  import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';
  import {
    postApp,
    getAppInfoById,
    putAppById,
    postAppUploadAppPkg,
  } from '/@/apis/gct-platform/AppController';

  const { prefixCls } = useDesign('application-manage-cmp');

  const { t } = useI18n();
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
      hasBILicense.value = res;
    });
  };

  const handleCreateApp = (appType: AppClassifyEnum) => {
    // if (AppClassifyEnum.Pro !== appType) {
    //   return false;
    // }

    openModal(true, {
      modalType: 'create',
      type: appType,
      tenantId: userStore.getTenant,
    });
  };

  const uploadSuccess = () => {
    message.success(t('导入成功'));
    containerRef.value?.getAppCount();
    containerRef.value?.getAppTableData();
  };

  /**
   * 应用导入
   * @param file
   */
  const handleUpload = async (file) => {
    let formData: any = new FormData();
    formData.append('file', file);

    const res = await postAppUploadAppPkg(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });

    const params = {
      sourceType: 'IMPORT',
      appPkgUrl: res,
      tenantId: userStore.getTenant as unknown as string,
    };

    await gct.openUtil.modal(
      ImportDetail,
      {
        file,
        params,
        successFunc: uploadSuccess,
      },
      {
        title: t('sys.appImport'),
        width: 640,
        minHeight: 450,
        showFooter: false,
        okText: t('sys.okText'),
      },
    );
  };

  const handleModalOk = async (result) => {
    if (result.type === 'create') {
      await postApp(result.info);
      message.success(t('sys.developer.appCenter.createSuccess'));
      containerRef.value?.getAppCount();
    } else if (result.type === 'edit') {
      console.log('result', result);
      await putAppById({ id: result.info.id }, result.info);
      message.success(t('sys.developer.appCenter.editSuccess'));
      emitter.emit(EmitterEnum.on_refresh_app_detail, { id: result.info.id });
    }
    containerRef.value?.getAppTableData();
  };

  onMounted(() => {
    // 滚动到我的专业应用固定
    const applicationElement = document.getElementById('application-manage-cmp');
    console.log('applicationElement', applicationElement);
    applicationElement?.addEventListener('scroll', function () {
      const titleElement = document.getElementsByClassName('ant-tabs-nav')[1];
      const navTitleElement = document.getElementsByClassName('menu-sider')[0];
      const searchElement = document.getElementsByClassName('search-container')[0];
      const navContentElement = document.getElementsByClassName('application-content')[0];
      console.log('applicationElement.scrollTop', applicationElement.scrollTop);
      if (applicationElement.scrollTop > 112) {
        if (titleElement) {
          titleElement.style.position = 'fixed';
          titleElement.style.top = '84px';
          titleElement.style.width = 'calc(100% - 270px)';
        }

        navTitleElement.style.position = 'fixed';
        navTitleElement.style.top = '149px';

        navContentElement.style.position = 'relative';
        navContentElement.style.left = '130px';
        navContentElement.style.paddingTop = '130px';
        navContentElement.style.ZIndex = '2';

        searchElement.style.position = 'fixed';
        searchElement.style.top = '140px';
        searchElement.style.width = 'calc(100% - 424px)';
        searchElement.style.left = '405px';
        searchElement.style.zIndex = '3';
      } else {
        if (titleElement) {
          titleElement.style.position = 'relative';
          titleElement.style.top = '0';
          titleElement.style.width = '100%';
        }

        navTitleElement.style.position = 'relative';
        navTitleElement.style.top = '0';
        navContentElement.style.left = '0';
        navContentElement.style.top = '0';
        navContentElement.style.paddingTop = '0';

        searchElement.style.position = 'relative';
        searchElement.style.top = '0';
        searchElement.style.width = '100%';
        searchElement.style.left = '0';
      }
    });
  });
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-wrapper {
    // position: relative;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }
</style>
