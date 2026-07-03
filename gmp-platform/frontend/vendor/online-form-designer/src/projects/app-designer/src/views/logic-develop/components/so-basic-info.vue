<template>
  <div class="so-basic-info">
    <div class="so-basic-info__title">{{ t('基础信息') }}</div>
    <div class="p-16px">
      <a-descriptions
        :column="1"
        :colon="false"
        :labelStyle="{
          color: '#666',
        }"
        :contentStyle="{
          color: '#333',
        }"
      >
        <a-descriptions-item label="服务编排名称">{{ data?.name }}</a-descriptions-item>
        <a-descriptions-item label="服务编排KEY">
          <copy-module-key :moduleKey="data?.key" />
        </a-descriptions-item>
        <a-descriptions-item class="text-align__center" label="版本">
          <div class="flex items-center version-toggle w-120px">
            <a-select class="flex-1" v-model:value="versionId">
              <a-select-option v-for="item in versions" :key="item.id" :value="item.id">
                {{ item.version }}</a-select-option
              >
            </a-select>
            <span class="version-toggle__key ml-10px" v-if="versionId === currentVersion?.id">
              <i class="iconfont icon-key1"></i
            ></span>
            <span class="version-toggle__btn ml-10px" v-else @click="handleActivate">激活</span>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="描述">{{ data?.description }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ data?.createUserName }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ data?.createTime }}</a-descriptions-item>
        <a-descriptions-item label="修改人">
          {{ data?.modifyUserName }}
        </a-descriptions-item>
        <a-descriptions-item label="修改时间">
          {{ data?.modifyTime }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import {
    ServiceOrchestrationResponse,
    ServiceOrchestrationVersionResponse,
  } from '/@/apis/gct-apaas/model';
  import { message, Modal } from 'ant-design-vue';
  import { putServiceOrchestrationVersionSetVersionActive } from '/@/apis/gct-apaas/ServiceOrchestrationVersionController';

  const props = defineProps<{
    data: ServiceOrchestrationResponse;
    versions: ServiceOrchestrationVersionResponse[];
  }>();
  const { t } = useI18n();

  const emit = defineEmits(['ok']);

  const versionId = computed({
    get() {
      return props.data?.orchestrationVersion?.id;
    },
    set(value) {
      if (!props.data?.orchestrationVersion) return;
      Object.assign(props.data.orchestrationVersion, {
        id: value,
      });
    },
  });

  const currentVersion = computed(() => {
    return props.versions.find((item) => item.active === 1);
  });

  const handleActivate = () => {
    const target = props.versions.find((item) => item.id === versionId.value);
    if (!target) return;
    Modal.confirm({
      title: `确认要激活${target.version}版本吗？`,
      okText: '确认',
      cancelText: '取消',
      closable: false,
      onOk: async () => {
        await putServiceOrchestrationVersionSetVersionActive({
          id: target.id,
          scriptKey: props.data.key,
        });
        emit('ok');
        message.success('激活成功！');
      },
      onCancel: () => {},
    });
  };
</script>

<style lang="less" scoped>
  .so-basic-info {
    height: 100%;
    width: 100%;
    background: #fff;

    &__title {
      font-weight: bold;
      color: #333;
      height: 48px;
      line-height: 48px;
      text-align: center;
      border-bottom: 1px solid #d9d9d9;
    }

    .ant-descriptions :deep(.ant-descriptions-item-content) {
      justify-content: flex-end;
    }
  }

  .version-toggle {
    color: var(--ant-primary-color);
    &__key {
      height: 18px;
      width: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--ant-primary-1);
      font-size: 12px;
    }
    &__btn {
      cursor: pointer;
    }
  }

  .text-align__center :deep(.ant-descriptions-item-label) {
    align-items: center;
  }
</style>
