<template>
  <a-drawer
    v-model:visible="open"
    class="gct-biz-process-detail"
    width="60vw"
    :title="`${t('sys.process.biz')}${t('sys.detail')}`"
    placement="right"
    @after-open-change="afterOpenChange"
  >
    <a-collapse v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="t('sys.basicInfo')">
        <a-descriptions :column="3" class="basic-info-container">
          <a-descriptions-item :label="t('sys.process.bizName')">
            {{ modelDetail.name }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.process.bizKey')">
            <copy-module-key :moduleKey="modelDetail.key" />
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.process.activeVersion')">
            {{ modelDetail.activeVersion }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.createUser')">
            {{ modelDetail.createUserName }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.createTime')">
            {{ modelDetail.createTime }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.modifier')">
            {{ modelDetail.modifyUserName }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.modifyTime')">
            {{ modelDetail.modifyTime }}
          </a-descriptions-item>
          <a-descriptions-item
            :span="2"
            :label="t('sys.description')"
            :contentStyle="{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inlineBlock',
            }"
          >
            <span :title="modelDetail.description" class="index-entity-desc">
              {{ modelDetail.description }}
            </span>
          </a-descriptions-item>
        </a-descriptions>

        <div class="mt-20px" style="height: calc(100vh - 350px)">
          <PaasBpmnDiagram
            v-if="modelDetail.id"
            :key="modelDetail.id"
            :onlyFlow="true"
            :id="modelDetail.id"
          />
        </div>
      </a-collapse-panel>
    </a-collapse>
  </a-drawer>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import PaasBpmnDiagram from './process-design/index.vue';

  const { t } = useI18n();

  const open = ref<boolean>(false);

  const modelDetail = reactive<any>({});

  const activeKey = ref(['1']);

  const afterOpenChange = (bool: boolean) => {
    console.log('open', bool);
  };

  const showDrawer = (data: any) => {
    open.value = true;
    Object.assign(modelDetail, data);
  };

  defineExpose({
    showDrawer,
  });
</script>
<style lang="less">
  .gct-biz-process-detail {
    .ant-drawer-body {
      padding: 16px;
    }
    .header-title {
      font-weight: 400;
      font-size: 16px;
      color: #212528;
    }

    .basic-info-container {
      background: #f7f8fa;
      border-radius: 4px;
      padding: 20px;
      :deep(.ant-descriptions-item) {
        padding-bottom: 0 !important;
      }
    }

    :deep(.ant-descriptions-item-label) {
      color: #797a7d;
    }

    .index-entity-desc {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
