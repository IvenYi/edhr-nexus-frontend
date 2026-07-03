<template>
  <basic-modal
    v-bind="$attrs"
    wrapClassName="loading-modal"
    @register="registerInner"
    :height="200"
    centered
    width="480px"
    :footer="null"
    :title="null"
    :maskClosable="false"
    :closable="false"
  >
    <div class="loading-container"></div>
    <div class="flex flex-col ml78px pt64px title">
      <div class="text-[20px] font-600 text-[#1A1D23] w280px">
        正在{{
          formState.id ? (formState.type === 'UPDATE' ? '同步沙箱' : '删除数据') : '创建沙箱'
        }}，请耐心等待片刻
      </div>
      <div class="flex mt32px w280px items-center">
        <i v-if="!step" class="gct-iconfont icon-loading color-theme"></i>
        <i v-else class="gct-iconfont color-theme icon-loading-wancheng"></i>
        <span class="color-theme"
          >【开始{{
            formState.id ? (formState.type === 'UPDATE' ? '同步' : '删除') : '创建'
          }}】</span
        >
        <span v-if="!step"
          >正在{{
            formState.id ? (formState.type === 'UPDATE' ? '同步' : '删除') : '复制'
          }}...</span
        >
        <span v-else>{{
          formState.id
            ? formState.type === 'UPDATE'
              ? '数据开始同步'
              : '数据开始删除'
            : '沙箱开始创建'
        }}</span>
      </div>

      <div v-if="step" class="flex mt16px w320px items-center">
        <i v-if="step !== 2" class="gct-iconfont icon-loading color-theme"></i>
        <i v-else class="gct-iconfont color-theme icon-loading-wancheng"></i>
        <span class="color-theme"
          >【数据{{
            formState.id ? (formState.type === 'UPDATE' ? '同步' : '删除') : '复制'
          }}成功】</span
        >
        <span v-if="step === 1"
          >正在{{
            formState.id ? (formState.type === 'UPDATE' ? '同步更新正式' : '删除沙箱') : '复制正式'
          }}环境数据...</span
        >
        <span v-if="step === 2 && formState.type !== 'DELETE'"
          >应用正式环境{{ formState.id ? '同步更新' : '复制' }}成功</span
        >
        <span v-else-if="step === 2 && formState.type === 'DELETE'">
          应用沙箱环境及其数据删除成功
        </span>
      </div>
    </div>
  </basic-modal>
</template>
<script setup lang="ts">
  import { computed, ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { message } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import {
    postSandboxConfig,
    postSandboxConfigSync,
    getSandboxConfigList,
    deleteSandboxConfig,
    putSandboxConfigById,
  } from '/@/apis/gct-apaas/SandboxConfigController';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();

  const step = ref(0);

  const formState = reactive({
    id: '',
    name: '',
    padRoutePath: '',
    pdaRoutePath: '',
    webRoutePath: '',
    description: '',
    type: '',
  });

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    Object.assign(formState, data);
    if (!data?.name) return;
    if (!formState.id) {
      postSandboxConfig(data).then(async () => {
        step.value = 1;
        let timer = setInterval(async () => {
          try {
            const dataList = await getSandboxConfigList();
            if (dataList[0].status !== 'INIT') {
              emit('ok');
              step.value = 2;
              clearInterval(timer); // 正确关闭定时器
              message.success('新建成功');

              closeModal();
            }
          } catch (error) {
            console.error('获取沙箱配置失败:', error);
            clearInterval(timer); // 错误时也关闭定时器
            closeModal();
          }
        }, 5000);
      });
    } else if (data.type === 'UPDATE') {
      try {
        await postSandboxConfigSync();
        await putSandboxConfigById({ id: data.id }, { ...data });
      } catch (error) {
        closeModal();
        return;
      }

      step.value = 1;
      let timer = setInterval(async () => {
        try {
          const dataList = await getSandboxConfigList();
          if (dataList[0].status !== 'SYNC') {
            emit('ok');
            step.value = 2;
            clearInterval(timer); // 正确关闭定时器
            message.success('同步成功');
            closeModal();
          }
        } catch (error) {
          console.error('获取沙箱配置失败:', error);
          clearInterval(timer); // 错误时也关闭定时器
          closeModal();
        }
      }, 5000);
    } else if (data.type === 'DELETE') {
      step.value = 1;
      deleteSandboxConfig()
        .then(() => {
          emit('ok');
          step.value = 2;
          message.success('删除成功');
          closeModal();
        })
        .finally(() => {});
    }
  });
</script>
<style lang="less" scoped>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .loading-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 117px;
    background: linear-gradient(
      270deg,
      #eafdff 0%,
      #ecfdff 14%,
      #eaf5fe 49%,
      #ecedfe 88%,
      #ecedfe 100%
    );
    filter: blur(50px);
  }

  /* 基础旋转动画 */
  .gct-iconfont.icon-loading {
    animation: spin 1s linear infinite;
  }
</style>
<style>
  .loading-modal .ant-modal-header {
    display: none;
  }

  .loading-modal .ant-modal-body {
    height: 320px !important;
  }

  .title {
    filter: blur(0);
  }

  .color-theme {
    color: var(--ant-primary-color);
  }
</style>
