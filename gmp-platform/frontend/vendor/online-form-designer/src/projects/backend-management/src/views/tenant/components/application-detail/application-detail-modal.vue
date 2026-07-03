<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.tenant.applicationDetails')"
    centered
    width="1000px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <div class="detail">
      <div class="detail-left">
        <div class="logo">
          <img :src="transformUrl(appDetail?.logo)" alt="" />
        </div>
        <div class="name">{{ appDetail?.name }}</div>
      </div>
      <div class="detail-right">
        <div class="header">
          <div class="desc"
            >{{ t('sys.tenant.versionDescription') }}：<span>{{
              appDetail?.description
            }}</span></div
          >
          <div class="action">
            <a-button class="btn" type="primary" @click="handleOpenDesigner"
              ><i class="iconfont icon-a-Visualdevelopment mr-6px"></i
              >{{ t('sys.tenant.visualDevelopment') }}
            </a-button>
            <a-button class="btn ml-12px" @click="handleEditAppDetail"
              ><i class="iconfont icon-bianji mr-6px"></i
              >{{ t('sys.tenant.editApplicationInformation') }}</a-button
            >
            <a-button class="btn ml-12px" @click="handleDeleteApp"
              ><i class="iconfont icon-shanchu mr-6px"></i>{{ t('sys.delete') }}</a-button
            >
          </div>
        </div>
        <div class="container">
          <div class="title">{{ t('sys.model.basicInformation') }}</div>
          <div class="message">
            <a-row :gutter="24">
              <a-col :span="6"
                >{{ t('sys.tenant.ID') }}：<div class="id">{{ appDetail?.id }}</div></a-col
              >
              <a-col :span="6"
                >{{ t('sys.creator') }}： <div>{{ appDetail?.createUserName }}</div></a-col
              >
              <a-col :span="6"
                >{{ t('sys.createTime') }}： <div>{{ appDetail?.createTime }}</div></a-col
              >
              <a-col :span="6"
                >{{ t('sys.updateTime') }}：<div>{{ appDetail?.modifyTime }}</div></a-col
              >
            </a-row>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
  <application-edit-modal @register="register" @refresh="onRefresh" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { ApplicationType } from '../../types/tenant';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import ApplicationEditModal from './create-application-modal.vue';
  import { openWindow, genUrl } from '/@/utils';
  import { deleteApp, getAppInfoById } from '/@/apis/gct-platform/AppController';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['refresh']);

  const appDetail = ref<ApplicationType>();

  const [register, { openModal }] = useModal();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = (data: ApplicationType) => {
    appDetail.value = data;
  };

  const { t } = useI18n();

  const handleClose = () => {
    closeModal();
  };

  const handleOk = () => {
    closeModal();
  };

  const handleOpenDesigner = () => {
    openWindow(
      genUrl(
        `${location.origin}${
          import.meta.env.VITE_PATHNAME_APP_DESIGNER
        }#/app-design/model-designer`,
        {
          aid: appDetail.value?.id,
        },
      ),
      {
        target: '_blank',
      },
    );
  };

  const handleDeleteApp = async () => {
    Modal.confirm({
      title: t('sys.model.confirmDeleteAppMsg', { applicationName: appDetail.value?.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        await deleteApp(
          { ids: appDetail.value?.id || '' },
          {
            joinParamsToUrl: true,
          },
        );
        closeModal();
        emit('refresh');
      },
      onCancel: () => {},
    });
  };

  const onRefresh = () => {
    getAppDetail();
  };

  // 获取应用详情
  const getAppDetail = async () => {
    const res = await getAppInfoById({ id: appDetail.value?.id ?? '' });
    appDetail.value = res;
    emit('refresh');
  };

  const handleEditAppDetail = () => {
    openModal(undefined, appDetail.value);
  };

  const handleShow = () => {};
</script>

<style lang="less" :scoped>
  .border(@fs, @bh, @bw:3px) {
    display: flex;
    align-items: center;
    font-size: @fs;
    font-weight: bold;
    &::before {
      height: @bh;
      content: ' ';
      border-left: @bw solid var(--ant-primary-color);
      padding-right: 6px;
    }
  }

  .detail {
    width: 100%;
    display: flex;
    height: 400px;
    &-left {
      width: 240px;
      height: 100%;
      border-right: 2px solid #eaeaea;
      .logo {
        img {
          height: 50px;
          width: 159px;
          margin-bottom: 12px;
        }
      }
      .name {
        .border(18px, 16px);
      }
    }
    &-right {
      flex: 1;
      height: 100%;
      .header {
        margin-left: 24px;
        border-bottom: 1px solid #eaeaea;
        .desc {
          margin-bottom: 15px;
        }
        .action {
          margin-bottom: 16px;
          .btn {
            line-height: normal;
          }
        }
      }
      .container {
        margin-left: 24px;
        .title {
          .border(14px, 12px);
          margin: 16px 0 14px;
        }
        .id {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }
  }
</style>
