<template>
  <tree-sider-page :tabs="LogicTypeOptions" @menu-click="handleMenuClick" page-name="LogicDevelop">
    <template v-if="siderTab === ScriptTypeEnum.GLOBAL_METHOD">
      <template v-if="selectedTreeKey?.length! > 0 && selectedTreeNodeIsFolder">
        <index-global-method />
      </template>
      <template v-else>
        <empty-page
          :description="t('sys.appDesigner.globalMethodEmptyTip')"
          :sub-description="t('sys.pageDesigner.clickPageToDetail')"
        />
      </template>
      <!-- <script-modal @register="register" :scriptCategory="treeData" @refresh="onRefresh" /> -->
    </template>

    <template v-else-if="siderTab === ScriptTypeEnum.DEFAULT">
      <template v-if="selectedTreeKey?.length! > 0 && selectedTreeNodeIsFolder">
        <index-script />
      </template>
      <template v-else>
        <empty-page
          :description="t('sys.appDesigner.scriptListEmptyTip')"
          :sub-description="t('sys.pageDesigner.clickPageToDetail')"
        />
      </template>
      <script-modal @register="register" :scriptCategory="treeData" @refresh="onRefresh" />
    </template>
    <template v-else-if="siderTab === ScriptTypeEnum.ORCHESTRATION">
      <template v-if="selectedTreeKey?.length! > 0 && selectedTreeNodeIsFolder">
        <index-service-orchestration />
      </template>
      <template v-else>
        <empty-page
          :description="t('sys.appDesigner.scriptListEmptyTip')"
          :sub-description="t('sys.pageDesigner.clickPageToDetail')"
        />
      </template>
      <service-orchestration-modal
        @register="soRegister"
        :category="treeData"
        @refresh="onRefresh"
      />
    </template>
  </tree-sider-page>
</template>

<script setup lang="ts" name="LogicDevelop">
  import { computed } from 'vue';
  import treeSiderPage from '/@/layouts/tree-sider-page/next.vue';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import emptyPage from '/@app-designer/components/empty-page.vue';
  import { MenuClickEvent, ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { LogicTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useModal } from '/@/components/Modal';
  import IndexGlobalMethod from './components/index-global-method.vue';
  import IndexScript from './components/index-script.vue';
  import ScriptModal from './modal/script-modal.vue';
  import IndexServiceOrchestration from './components/index-service-orchestration.vue';
  import ServiceOrchestrationModal from './modal/service-orchestration-modal.vue';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();
  const [soRegister, { openModal: openSoModal }] = useModal();
  const {
    selectedTreeKey,
    selectedTreeNode,
    treeData,
    sliderTabKeyPrefix,
    initTreeData,
    setTreeSelected,
    siderTab,
  } = useTreeSiderPage('LogicDevelop');

  const { getUuid } = useUUid(treeData, sliderTabKeyPrefix);

  // 当前选中节点是否为文件夹
  const selectedTreeNodeIsFolder = computed(() => !selectedTreeNode.node.children);

  // const treeData: Ref<any[]> = ref([]);
  const onRefresh = async (key) => {
    await initTreeData();

    if (key) {
      setTreeSelected(key);
    }
  };

  const handleMenuClick = ({ data, key }) => {
    switch (key) {
      case MenuClickEvent.NEW:
        if (siderTab.value === ScriptTypeEnum.DEFAULT) {
          openModal(true, { categoryId: data.id, uuid: getUuid() });
        } else {
          openSoModal(true, { edit: false, data: { categoryId: data.id, uuid: getUuid() } });
        }
        break;
      default:
        break;
    }
  };
</script>

<style scoped lang="less">
  .primary-focus {
    border-color: var(--ant-primary-color);
  }

  .no-focus {
    border-color: #d9d9d9;
  }

  .container {
    width: 100%;
    height: 100%;
    background-color: #fff;
  }
</style>
