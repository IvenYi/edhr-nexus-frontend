<template>
  <tree-sider-page :tabs="ProcessTypeOptions" :showTab="false" @menu-click="handleMenuClick">
    <template v-if="selectedTreeKey?.length! > 0 && selectedTreeNodeIsFolder">
      <process-index />
    </template>
    <template v-else>
      <empty-page
        :description="t('sys.appDesigner.scriptListEmptyTip')"
        :sub-description="t('sys.pageDesigner.clickPageToDetail')"
      />
    </template>
    <process-modal @register="register" :categoryTree="treeData" @refresh="onRefresh" />
  </tree-sider-page>
</template>

<script setup lang="ts" name="page-designer">
  import { computed } from 'vue';
  import treeSiderPage from '/@/layouts/tree-sider-page/next.vue';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import emptyPage from '/@app-designer/components/empty-page.vue';
  import { MenuClickEvent, ProcessTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { ProcessTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useModal } from '/@/components/Modal';
  // import IndexScript from './components/index-script.vue';
  import ProcessModal from './modal/process-modal.vue';
  import ProcessIndex from './components/process-index.vue';
  // import IndexServiceOrchestration from './components/index-service-orchestration.vue';
  // import ServiceOrchestrationModal from './modal/service-orchestration-modal.vue';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();
  // const [soRegister, { openModal: openSoModal }] = useModal();

  const typeMap = {
    [ProcessTypeEnum.APPROVAL]: 'APPROVE',
    [ProcessTypeEnum.BUSINESS]: 'BUSINESS',
  };

  const {
    selectedTreeKey,
    selectedTreeNode,
    treeData,
    sliderTabKeyPrefix,
    initTreeData,
    setTreeSelected,
    siderTab,
  } = useTreeSiderPage();

  const { getUuid } = useUUid(treeData, sliderTabKeyPrefix);

  // 当前选中节点是否为文件夹
  const selectedTreeNodeIsFolder = computed(() => !selectedTreeNode.node.children);

  // const treeData: Ref<any[]> = ref([]);
  const onRefresh = async (data) => {
    await initTreeData();
    setTreeSelected(data.key);
  };

  const handleMenuClick = ({ data, key }) => {
    switch (key) {
      case MenuClickEvent.NEW:
        openModal(true, {
          edit: false,
          data: { categoryId: data.id, type: typeMap[siderTab.value!], key: getUuid() },
        });
        break;
      default:
        break;
    }
  };
</script>

<style scoped lang="less"></style>
