<template>
  <a-drawer
    v-model:visible="visible"
    class="custom-class"
    placement="right"
    :closable="false"
    width="70%"
    :destroy-on-close="true"
    @after-visible-change="afterVisibleChange"
    :style="{ position: 'absolute' }"
    :headerStyle="{ padding: '0px 0px 8px 0px', backgroundColor: '#f0f2f5' }"
    :bodyStyle="{
      borderRadius: 0,
      padding: 0,
      backgroundColor: '#f0f2f5',
      display: 'flex',
      flexDirection: 'column',
    }"
  >
    <!-- <template #title>
      <a-button size="small" type="primary" ghost :style="{ height: '28px' }" @click="onClose">{{
        t('sys.developer.appCenter.goBack')
      }}</a-button>
    </template> -->
    <detail-header
      :detail="detail"
      :version="version"
      :isShowEditBtn="isShowEditBtn"
      :isShowDesignBtn="isShowDesignBtn"
      @onClose="onClose"
    />
    <detail-container
      :pid="pid"
      :tenantId="tenantId"
      :detail="detail"
      :platformType="platformType"
      :isOnlyBI="isOnlyBI"
    />
  </a-drawer>
</template>
<script setup lang="ts" name="application-detail">
  import { ref, onBeforeMount, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DetailHeader from './detail-header.vue';
  import DetailContainer from './detail-container.vue';
  import { useEmitter } from '../../hooks/useEmitter';
  import { PlatformEnum } from '../../constant/interface';
  import {
    getAppInfoById,
    getAppGetCurrentProdAppVersionTagByAppId,
  } from '/@/apis/gct-platform/AppController';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';

  const getContainer = () => document.querySelector(`#application-manage-cmp`);

  const emit = defineEmits(['reload']);

  interface Props {
    /** 租户id */
    tenantId: string;
    platformType: PlatformEnum;
    isOnlyBI?: boolean;
  }

  const { t } = useI18n();
  const { emitter, EmitterEnum } = useEmitter();

  defineProps<Props>();

  const visible = ref<boolean>(false);
  const pid = ref<string>('');
  const detail = ref<AppResponse>({});
  const isShowEditBtn = ref<boolean>(true);
  const isShowDesignBtn = ref<boolean>(true);
  const version = ref<string>();

  onBeforeMount(() => {
    emitter.on(EmitterEnum.on_refresh_app_detail, async (data: any) => {
      const res = await getAppInfoById({ id: data.id });
      detail.value = res!;
    });
  });

  const reloadAppList = () => {
    onClose();
    emit('reload', { key: 'request-data', isRequestTotal: true });
  };

  provide('reload', reloadAppList);

  const afterVisibleChange = (bool: boolean) => {
    console.log('visible', bool);
  };

  const onOpen = async (id, isHideEditBtn, isHideDesignBtn) => {
    if (id) {
      pid.value = id;
      const res = await getAppInfoById({ id: id });
      detail.value = res!;
      if (isHideEditBtn) {
        isShowEditBtn.value = false;
      }
      isShowDesignBtn.value = !isHideDesignBtn;
    }
    visible.value = true;
  };

  const onClose = () => {
    visible.value = false;
    emitter.emit(EmitterEnum.on_refresh_app_list);
    pid.value = '';
    detail.value = {};
    version.value = undefined;
    isShowEditBtn.value = true;
  };

  defineExpose({ onOpen, onClose });
</script>
<style lang="less">
  .custom-class.ant-drawer {
    z-index: 99;
  }
</style>
