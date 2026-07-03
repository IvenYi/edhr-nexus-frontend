<template>
  <basic-page>
    <a-tabs v-model:activeKey="activeTab">
      <template #rightExtra>
        <a-button v-if="activeTab === TabEnum.Commit" type="primary" @click="handleCommit">
          提交</a-button
        >
        <a-button v-else-if="activeTab === TabEnum.Test" type="primary" @click="handleTest"
          >发布验证</a-button
        >
        <a-button v-else-if="activeTab === TabEnum.Release" type="primary" @click="handleRelease"
          >创建发行</a-button
        >
        <a-button v-else-if="activeTab === TabEnum.Publish" type="primary" @click="handlePublish"
          >发布生产</a-button
        >
      </template>
      <a-tab-pane :key="TabEnum.Commit" tab="提交记录">
        <commit-table ref="CommitTableRef" />
      </a-tab-pane>
      <a-tab-pane :key="TabEnum.Test" tab="验证记录">
        <test-table ref="TestTableRef" />
      </a-tab-pane>
      <a-tab-pane :key="TabEnum.Release" tab="发行记录">
        <release-table ref="ReleaseTableRef" />
      </a-tab-pane>
      <a-tab-pane :key="TabEnum.Publish" tab="发布记录">
        <publish-table ref="PublishTableRef" />
      </a-tab-pane>
    </a-tabs>

    <commit-modal @register="registerCommit" @ok="() => CommitTableRef?.getTableData(1)" />
    <test-modal @register="registerTest" @ok="() => TestTableRef?.getTableData(1)" />
    <release-modal
      @register="registerRelease"
      @ok="
        () => {
          TestTableRef?.getTableData(1);
          ReleaseTableRef?.getTableData(1);
        }
      "
    />
    <publish-modal @register="registerPublish" @ok="() => PublishTableRef?.getTableData(1)" />
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, provide } from 'vue';
  import { TabEnum } from './types';
  import { useAppDeployment } from './hooks/useAppDeployment';
  import CommitTable from './modules/commit-table.vue';
  import TestTable from './modules/test-table.vue';
  import ReleaseTable from './modules/release-table.vue';
  import PublishTable from './modules/publish-table.vue';
  import { useModal } from '/@/components/Modal';
  import CommitModal from './modals/commit-modal.vue';
  import TestModal from './modals/test-modal.vue';
  import ReleaseModal from './modals/release-modal.vue';
  import PublishModal from './modals/publish-modal.vue';

  const [registerCommit, { openModal: openCommitModal }] = useModal();
  const [registerTest, { openModal: openTestModal }] = useModal();
  const [registerRelease, { openModal: openReleaseModal }] = useModal();
  const [registerPublish, { openModal: openPublishModal }] = useModal();

  provide('openReleaseModal', openReleaseModal);

  const { activeTab } = useAppDeployment();

  const CommitTableRef = ref();
  const TestTableRef = ref();
  const ReleaseTableRef = ref();
  const PublishTableRef = ref();

  const handleCommit = () => {
    openCommitModal(true, {});
  };

  const handleTest = () => {
    openTestModal(true, {});
  };

  const handleRelease = () => {
    openReleaseModal(true, {});
  };

  const handlePublish = () => {
    openPublishModal(true, {});
  };
</script>

<style lang="less" scoped>
  .ant-tabs {
    height: 100%;

    :deep(.ant-tabs-nav) {
      padding-left: 16px;
    }
    :deep(.ant-tabs-extra-content) {
      padding-right: 16px;
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }
    :deep(.ant-tabs-tabpane) {
      padding: 0 16px 16px 16px;
    }
  }
</style>
