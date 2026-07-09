<template>
  <div class="w800px mt60px">
    <div class="title text-[24px] font-600">介绍及使用</div>
    <div class="info w371px mt16px mb24px">
      沙箱可模拟正式环境的数据及配置项，创建一个独立的空间 可在其中进行一系列升级改造及验证
    </div>
    <div class="position-relative add-btn" @click="handleAdd">
      <a-button type="primary" class="add"> 新建</a-button>
      <div class="btn-1"></div>
    </div>
    <div class="flex mt48px">
      <div v-for="item in infoList" :key="item.id" class="mr16px info-box">
        <div>
          <img :src="item.icon" class="h48px w48px" />
        </div>
        <div class="mt16px font-600 text-[16px]">
          {{ item.title }}
        </div>
        <div class="mt12px text-[12px] text-[#888888]">
          {{ item.detail }}
        </div>
      </div>
    </div>
  </div>
  <add-sandbox @register="register" @ok="emit('refresh')" @create="handleCreate" />
  <loading-sandbox @register="registerLoading" @ok="emit('refresh')" />
</template>
<script setup lang="ts">
  import SandboxCreate from '/@/assets/images/sandbox-create.png';
  import SandboxDeploy from '/@/assets/images/sandbox-deploy.png';
  import Environment from '/@/assets/images/sandbox-environment.png';
  import AddSandbox from './add-sandbox.vue';
  import LoadingSandbox from './loading-sandbox.vue';
  import { useModal } from '/@/components/Modal';
  import { getSandboxConfigValidStatus } from '/@/apis/gct-apaas/SandboxConfigController';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const emit = defineEmits(['refresh']);

  const [register, { openModal }] = useModal();
  const [registerLoading, { openModal: openLoadingModal }] = useModal();

  const appInfoStore = useAppInfoStore();

  const infoList = [
    {
      id: 1,
      title: '创建沙箱',
      detail: '创建沙箱，拥有「应用前台」链接',
      icon: SandboxCreate,
    },
    {
      id: 2,
      title: '环境隔离',
      detail: '创建沙箱时，复制此刻一份正式环境数据及配置，沙箱环境的数据与正式环境隔离',
      icon: Environment,
    },
    {
      id: 3,
      title: '无需发布',
      detail:
        '可在「应用设计器-逻辑开发-脚本」开发并同步至沙箱，无需发布，直接在「沙箱前台」验证效果',
      icon: SandboxDeploy,
    },
  ];

  const handleCreate = (data) => {
    openLoadingModal(true, { ...data });
  };

  const handleAdd = () => {
    getSandboxConfigValidStatus({ appId: appInfoStore?.appInfo?.id }).then(() => {
      openModal(true, {});
    });
  };
</script>
<style lang="less" scoped>
  .info-box {
    width: 256px;
    height: 264px;
    padding: 36px 32px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 24px 60px 0 rgba(175, 202, 251, 0.1);
  }

  .add-btn {
    display: inline-block;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    .add {
      width: 108px;
      height: 32px;
      border-color: #1a1d23;
      background-color: #1a1d23;
    }

    .btn-1 {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 108px;
      height: 32px;
      border: 1px solid #1a1d23;
      border-radius: 4px;
    }
  }
</style>
