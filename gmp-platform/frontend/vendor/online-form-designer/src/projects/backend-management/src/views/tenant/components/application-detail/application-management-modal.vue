<template>
  <BasicModal
    v-bind="$attrs"
    class="application-management"
    @register="registerInner"
    :title="t('sys.appManager')"
    centered
    :use-wrapper="false"
    width="1212px"
    :minHeight="577"
    :maskClosable="false"
    :body-style="{ minHeight: '577px', maxWidth: '100%' }"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="actions mb-20px">
      <a-button type="primary" class="btn mr-12px" @click="handleAddByTpl">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.tenant.createAppFromTpl') }}
      </a-button>
      <a-button class="btn" @click="handleAddByDef">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.tenant.createBlankTpl') }}
      </a-button>
    </div>
    <div class="flex flex-wrap">
      <template v-for="item in appList" :key="item.id">
        <ApplicationManagementItem
          :id="item.id!"
          :logo="item.logo!"
          :name="item.name!"
          :description="item.description!"
          :initState="item.initState"
          :initFailReason="item.initFailReason"
          @refresh="onRefresh"
          @click="handleDetailModal(item)"
        />
      </template>
    </div>
  </BasicModal>
  <CreateApplicationModal
    @register="userRegister"
    :isDefault="isDefault"
    :tenant-id="tenantId"
    @refresh="onRefresh"
  />
  <ApplicationDetailModal @register="detailRegister" @refresh="onRefresh" />
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import ApplicationManagementItem from './application-management-item.vue';
  import CreateApplicationModal from './create-application-modal.vue';
  import ApplicationDetailModal from './application-detail-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ApplicationCategory } from '../../types/tenant';
  import { getAppPageList } from '/@/apis/gct-platform/AppController';
  import { AppResponse } from '/@/apis/gct-platform/model';
  import { applicationStatusOptions } from '../../constant';
  import { isEmpty } from 'lodash-es';
  import { useAsyncLooper } from '/@/hooks/web/useAsyncLooper';

  const props = defineProps<{
    tenantId: string;
  }>();

  const [userRegister, { openModal: openCreateModal }] = useModal();
  const [detailRegister, { openModal: openDetailModal }] = useModal();
  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const appList = ref<AppResponse[]>([]);
  const isDefault = ref<boolean>(false);

  const needLooper = computed(() => {
    return appList.value.some((item) => {
      return item.initState === applicationStatusOptions.initializing;
    });
  });

  const fetchAppList = async (tenantId) => {
    const res = await getAppPageList({ tenantId });
    appList.value = res!.data;
    // appList.value = appList.value.map((item) => {
    //   return { ...item, isSelected: unref(false) };
    // });
  };

  const onDataReceive = (data) => {
    fetchAppList(data);
  };

  const handleAddByDef = () => {
    openCreateModal(undefined, ApplicationCategory.newBlankApplication);
  };

  const handleAddByTpl = () => {
    openCreateModal(undefined, ApplicationCategory.newTplApplication);
  };

  const onRefresh = () => {
    fetchAppList(props.tenantId);
  };

  const handleDetailModal = (item: AppResponse) => {
    if (isEmpty(item.initState) || applicationStatusOptions.success === item.initState) {
      openDetailModal(undefined, item);
    }
  };

  const handleOk = () => {
    closeModal();
  };

  const handleClose = () => {
    return undefined;
  };

  const { startLoop, stopLoop } = useAsyncLooper(onRefresh, {
    time: 5000,
    immediate: false,
  });

  watch(
    () => needLooper.value,
    (v) => {
      if (v) {
        startLoop();
      } else {
        stopLoop();
      }
    },
  );
</script>

<style lang="less" scoped>
  .application-management {
    min-height: 732px;
    .actions {
      margin-bottom: 20px;
      .btn {
        border-radius: 4px;
      }
    }
  }

  :deep(.ant-modal-body) {
    // min-height: 577px;
  }
</style>
