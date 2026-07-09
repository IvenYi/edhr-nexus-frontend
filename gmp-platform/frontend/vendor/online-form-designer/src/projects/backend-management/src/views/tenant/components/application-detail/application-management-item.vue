<template>
  <a-card
    :class="[
      'card',
      { 'is-init': disabled, 'is-error': initState === applicationStatusOptions.fail },
    ]"
    :hoverable="!disabled"
  >
    <div class="header">
      <div>
        <template v-if="!!logo">
          <img class="w-80px h-24px mb-8px" :src="transformUrl(logo)" alt="" />
        </template>
        <template v-else>
          <div class="label">
            <i class="iconfont icon-pingtaiguanli"></i>
          </div>
        </template>
      </div>
      <i class="delete iconfont icon-shanchu" @click.stop="handleDelete"></i>
      <div
        class="status-extra init-status"
        v-if="initState === applicationStatusOptions.initializing"
      >
        <LoadingOutlined class="mr-4px" spin />
        <span class="status-title">{{ t('sys.initializing') }}</span>
      </div>
      <div class="status-extra error-status" v-if="initState === applicationStatusOptions.fail">
        <a-tooltip placement="topLeft" arrow-point-at-center v-if="initFailReason">
          <template #title>{{ initFailReason }}</template>
          <question-circle-outlined class="mr-4px" />
        </a-tooltip>
        <span class="status-title">{{ t('sys.initializationFailed') }}</span>
      </div>
    </div>
    <div class="title">{{ name }}</div>
    <div class="desc">
      <span>{{ description }}</span>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { deleteApp } from '/@/apis/gct-platform/AppController';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isEmpty } from 'lodash-es';
  import { applicationStatusOptions } from '../../constant';

  const props = defineProps<{
    id: string;
    logo: string;
    name: string;
    description: string;
    initState?: string;
    initFailReason?: string;
  }>();

  const emit = defineEmits(['refresh']);

  const { t } = useI18n();

  const logo = ref(props.logo || '');
  const name = ref(props.name || '');
  const description = ref(props.description || '');

  const disabled = computed<boolean>(() => {
    // 老数据
    if (isEmpty(props.initState)) {
      return false;
    }
    return [applicationStatusOptions.initializing, applicationStatusOptions.fail].includes(
      props.initState as string,
    );
  });

  const handleDelete = async () => {
    Modal.confirm({
      title: t('sys.model.confirmDeleteAppMsg', { applicationName: props.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        await deleteApp(
          { ids: props.id },
          {
            joinParamsToUrl: true,
          },
        );
        emit('refresh');
      },
      onCancel: () => {},
    });
  };
</script>

<style lang="less" scoped>
  @primary-label-color: rgba(51, 112, 255, 1);
  .card {
    width: 280px;
    height: 172px;
    font-size: 14px;
    margin: 0 8px 16px;
    border-radius: 4px;
    &.is-init {
      background-color: #f5f5f5;
      .title {
        color: #9b9b9b;
      }
      .desc {
        color: #999;
      }
    }

    &.is-error {
      .header {
        .delete {
          display: block;
          top: 10px;
          font-size: 16px;
          line-height: 22px;
          width: 16px;
          height: 16px;
        }
        .status-extra.error-status {
          right: 24px;
        }
      }
    }
    .header {
      .label {
        width: 32px;
        height: 34px;
        background-color: @primary-label-color;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        i {
          color: #fff;
        }
      }
      .delete {
        position: absolute;
        top: 4px;
        right: 4px;
        display: none;
        z-index: 9;
        cursor: pointer;
      }

      .status-extra {
        position: absolute;
        top: 10px;
        right: 16px;
        font-size: 14px;
        &.init-status {
          color: var(--ant-primary-color);
        }

        &.error-status {
          color: #ff4d4f;
        }
        .status-title {
          display: inline-block;
          line-height: 22px;
        }
      }
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
    }
    .desc {
      width: 100%;
      height: 90px;
      text-overflow: ellipsis;
      color: #999;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      word-break: break-all;
      -webkit-line-clamp: 4;
    }
    &:not(.is-init):hover {
      border: 2px solid var(--ant-primary-color);
      .delete {
        display: block;
      }
    }
  }
  :deep(.ant-card-body) {
    padding: 16px;
  }
</style>
