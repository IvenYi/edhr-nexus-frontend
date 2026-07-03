<template>
  <tree-sider-page
    page-name="ModelDesigner"
    ref="treeSiderPageRef"
    :tabs="ModelTypeOptions"
    @menu-click="handleMenuClick"
    @node-change="handleNodeChange"
  >
    <template #tree-header-extra>
      <a-tooltip>
        <template #title>{{ t('sys.model.modelDesigner') }}</template>
        <a-button
          class="tree-header-extra-btn"
          :style="{ marginLeft: '8px', width: '34px' }"
          :class="isShowER ? 'primary-focus' : 'no-focus'"
          @click="changeShowER"
          v-if="ModelTypeEnum.ENTITY == siderTab"
        >
          <template #icon>
            <span class="icon iconfont icon-moxingsuolveiocn"></span>
            <!-- <share-alt-outlined class="primary-gct" /> -->
          </template>
        </a-button>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ '权限作用域' }}</template>
        <a-button
          class="tree-header-extra-btn"
          :style="{ marginLeft: '8px', width: '34px' }"
          :class="isShowPermScope ? 'primary-focus' : 'no-focus'"
          @click="changeShowPermScope"
          v-if="ModelTypeEnum.ENTITY == siderTab"
        >
          <template #icon>
            <span class="icon gct-iconfont icon-quanxianzuoyongyu"></span>
            <!-- <span class="icon iconfont icon-moxingsuolveiocn"></span> -->
            <!-- <share-alt-outlined class="primary-gct" /> -->
          </template>
        </a-button>
      </a-tooltip>
    </template>

    <template #tree-footer>
      <div v-if="ModelTypeEnum.ENTITY == siderTab" class="recycle-bin" @click="changeShowRecycle">
        <i class="iconfont icon-shanchu1"></i>{{ t('sys.recycleBin') }}</div
      >
    </template>

    <template #content-header>
      <multi-tabs
        ref="multiTabsRef"
        :tabs="contentTabs"
        @tab-close="handleMultiTabClose"
        @tab-change="handleMultiTabChange"
      />
    </template>

    <empty-page
      v-if="'EMPTY' === showWhichMenu"
      :description="t(emptyDesc[siderTab || ModelTypeEnum.ENTITY])"
      :sub-description="t('sys.model.clickModelToDetail')"
    />
    <er-chart v-else-if="'ER' === showWhichMenu" />
    <recycle-bin v-else-if="'RECYCLE' === showWhichMenu" />
    <perm-scope v-else-if="'PERMSCOPE' === showWhichMenu" />
    <index-entity
      ref="pageRef"
      :key="currentModelMap[ModelTypeEnum.ENTITY]"
      :model="currentModelMap[ModelTypeEnum.ENTITY]"
      v-else-if="ModelTypeEnum.ENTITY === showWhichMenu"
      @edit="handleEntityModelEdit"
      @delete="handleEntityModelDelete"
      @node-change="handleNodeChange"
      @handle-expand="handleExpand"
      @handle-tab-click="handleTabClick"
    />
    <index-enum
      ref="enumRef"
      :key="currentModelMap[ModelTypeEnum.ENUM]"
      :model="currentModelMap[ModelTypeEnum.ENUM]"
      v-else-if="ModelTypeEnum.ENUM === showWhichMenu"
      @refresh="onRefresh"
      @delete="handleEnmuModelDelete"
    />

    <index-view
      ref="viewPageRef"
      v-else-if="ModelTypeEnum.VIEW === showWhichMenu"
      :key="currentModelMap[ModelTypeEnum.VIEW]"
      :model="currentModelMap[ModelTypeEnum.VIEW]"
      @edit="handleViewModelEdit"
      @delete="handleViewModelDelete"
      @viewSQL="handleViewSQL"
      @node-change="handleNodeChange"
      @handle-expand="handleExpand"
      @handle-tab-click="handleTabClick"
    />

    <index-data
      ref="dataModelRef"
      :key="currentModelMap[ModelTypeEnum.DATA]"
      :model="currentModelMap[ModelTypeEnum.DATA]"
      v-else-if="ModelTypeEnum.DATA === showWhichMenu"
      @edit="handleDataModelEdit"
      @delete="handleDataModelDelete"
      @node-change="handleNodeChange"
      @handle-expand="handleExpand"
      @handle-tab-click="handleTabClick"
    />

    <!-- 模态框部分 -->
    <model-entity-modal @register="registerEntity" @ok="handleEntityOk" @prev="handlePrev" />
    <enum-category-modal @register="registerEnum" @refresh="onRefresh" />
    <model-type-entity-modal ref="ModelTypeEntityModalRef" @next="handleNext" />
    <view-entity-modal @register="registerView" @ok="handleViewOk" />
    <model-data-modal @register="registerData" @ok="handleDataOk" />
    <ViewSQLModal @register="registerViewSQL" />
  </tree-sider-page>
</template>

<script setup lang="ts" name="ModelDesigner">
  import { Ref, ref, computed, nextTick, reactive } from 'vue';
  import indexEntity from './entity/index-entity.vue';
  import ModelEntityModal from './entity/components/model-entity-modal.vue';
  import multiTabs from '../../components/multi-tabs/index.vue';
  import { useMultiTabs } from '../../components/multi-tabs/useMultiTabs';
  import IndexEnum from './enum/index-enum.vue';
  import IndexView from './view/index-view.vue';
  import erChart from './entity/er-chart.vue';
  import RecycleBin from './entity/recycle-bin.vue';
  import PermScope from './entity/perm-scope.vue';
  import emptyPage from '/@app-designer/components/empty-page.vue';
  import {
    deleteModelMeta,
    postModelMetaSave,
    putModelMetaById,
  } from '/@/apis/gct-apaas/ModelMetaController';
  import { deleteEnumModel } from '/@/apis/gct-apaas/EnumModelController';
  import treeSiderPage from '/@/layouts/tree-sider-page/next.vue';
  import { ModelTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { ModelTypeEnum, MenuClickEvent } from '/@/layouts/tree-sider-page/enum';
  import { ShareAltOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUUid } from '@/hooks/web/useUUid';
  import { useModal } from '/@/components/Modal';
  import { ModelMetaVO } from '/@/apis/gct-apaas/model';
  import EnumCategoryModal from './enum/modal/enum-category-modal.vue';
  import ViewEntityModal from './view/modal/view-entity-modal.vue';
  import { deleteViewModel, getViewModelSql } from '/@/apis/gct-apaas/ViewModelController';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { cloneDeep, head, last } from 'lodash-es';
  import ModelTypeEntityModal from './entity/components/model-type-entity-modal.vue';
  import IndexData from './data-model/index-data.vue';
  import ModelDataModal from './data-model/modal/model-data-modal.vue';
  import {
    deleteDataModel,
    postDataModel,
    putDataModelById,
  } from '/@/apis/gct-apaas/DataModelController';
  import ViewSQLModal from './view/modal/view-SQL-modal.vue';

  const { t } = useI18n();
  const [registerEntity, { openModal: openEntityModal, closeModal: closeEntityModal }] = useModal();
  const [registerEnum, { openModal: openEnumModal }] = useModal();
  const [registerView, { openModal: openViewModal }] = useModal();
  const [registerData, { openModal: openDataModal, closeModal: closeDataModal }] = useModal();
  const [registerViewSQL, { openModal: openViewSQLModal }] = useModal();

  const { siderTab, sliderTabKeyPrefix, setSiderTab, treeData, initTreeData, setTreeSelected } =
    useTreeSiderPage('ModelDesigner');

  const { tab: contentTab } = useMultiTabs();

  /** 当前激活的模型，不能使用selectedTreeKey */
  const currentModel = ref<string>();
  /** currentModel 分开 后续不再使用*/
  const currentModelMap: Partial<Record<ModelTypeEnum, string>> = reactive({
    [ModelTypeEnum.ENTITY]: '',
    [ModelTypeEnum.ENUM]: '',
    [ModelTypeEnum.VIEW]: '',
    [ModelTypeEnum.DATA]: '',
  });

  const pageRef = ref();
  const viewPageRef = ref();
  const dataModelRef = ref();
  const enumRef = ref();
  const treeSiderPageRef = ref();

  const { getUuid } = useUUid(treeData, sliderTabKeyPrefix);

  const emptyDesc = {
    [ModelTypeEnum.ENTITY]: 'sys.model.entityModelToTable',
    [ModelTypeEnum.ENUM]: 'sys.model.enumModelToTable',
    [ModelTypeEnum.DATA]: '',
  };
  const erTab = {
    id: 'ER',
    name: t('sys.model.modelDesigner'),
  };
  const recycleTab = {
    id: 'RECYCLE',
    name: t('sys.recycleBin'),
  };
  const permScopeTab = {
    id: 'PERMSCOPE',
    name: '权限作用域',
    // name: t('sys.model.modelDesigner'),
  };

  const isShowER: Ref<boolean> = ref(false);
  const changeShowER = async () => {
    // isShowER.value = !isShowER.value;
    isShowER.value = true;
    if (isShowER.value) {
      await nextTick();
      multiTabsRef.value.setActive(erTab.id);
      setTreeSelected(undefined);
    } else {
      await nextTick();
      const firstTab = head(contentTabs.value);
      if (firstTab) {
        multiTabsRef.value.setActive(firstTab.id);
        handleMultiTabChange(firstTab);
      }
    }
  };

  const isShowPermScope: Ref<boolean> = ref(false);
  const changeShowPermScope = async () => {
    isShowPermScope.value = true;
    if (isShowPermScope.value) {
      await nextTick();
      multiTabsRef.value.setActive(permScopeTab.id);
      setTreeSelected(undefined);
    } else {
      await nextTick();
      const firstTab = head(contentTabs.value);
      if (firstTab) {
        multiTabsRef.value.setActive(firstTab.id);
        handleMultiTabChange(firstTab);
      }
    }
  };

  const isShowRecycle = ref<boolean>(false);
  const changeShowRecycle = async () => {
    isShowRecycle.value = true;
    if (isShowRecycle.value) {
      await nextTick();
      multiTabsRef.value.setActive(recycleTab.id);
      setTreeSelected(undefined);
    } else {
      await nextTick();
      const firstTab = head(contentTabs.value);
      if (firstTab) {
        multiTabsRef.value.setActive(firstTab.id);
        handleMultiTabChange(firstTab);
      }
    }
  };

  const modelTabs: Ref<Array<{ id: string; name: string; node: Object; belong?: number }>> = ref(
    [],
  );
  const contentTabs = computed(() => {
    const tabs = [...modelTabs.value];
    if (isShowRecycle.value) {
      tabs.unshift(recycleTab);
    }
    if (isShowER.value) {
      tabs.unshift(erTab);
    }
    if (isShowPermScope.value) {
      tabs.unshift(permScopeTab);
    }
    return tabs;
  });

  const multiTabsRef = ref();

  const showWhichMenu = computed(() => {
    const tabInfo = contentTabs.value.find((item) => item.id === contentTab.value);
    if (contentTabs.value.length === 0) {
      return 'EMPTY';
    } else if (tabInfo && tabInfo.id === 'ER') {
      return 'ER';
    } else if (tabInfo && tabInfo.id === 'RECYCLE') {
      return 'RECYCLE';
    } else if (tabInfo && tabInfo.id === 'PERMSCOPE') {
      return 'PERMSCOPE';
    } else if (tabInfo && tabInfo.belong) {
      return tabInfo.belong;
    }
    return undefined;
  });

  const onRefresh = async () => {
    await initTreeData();
    enumRef.value?.refreshEnum();
  };

  const handleExpand = (node) => {
    treeSiderPageRef.value?.expand(node);
  };

  const handleTabClick = (tab) => {
    treeSiderPageRef.value?.handleTabClick(tab);
  };

  const handleNodeChange = async (node) => {
    const { id, name } = node;
    if (modelTabs.value.findIndex((item) => item.id === id) === -1) {
      modelTabs.value.push({ id, name, node, belong: siderTab.value });
    }
    await nextTick();
    multiTabsRef.value.setActive(id);

    currentModel.value = id;
    currentModelMap[siderTab.value!] = id;
  };

  const ModelTypeEntityModalRef = ref();
  const handleMenuClick = ({ data, key }) => {
    const uuid = getUuid(
      [],
      [ModelTypeEnum.ENTITY].includes(siderTab.value) ? { chars: 'lowercase' } : {},
    );
    switch (key) {
      case MenuClickEvent.NEW:
        handleModelOpen({ data, uuid });
        // if (siderTab.value === ModelTypeEnum.ENTITY) {
        //   ModelTypeEntityModalRef.value?.open({ ...data });
        // } else if (siderTab.value === ModelTypeEnum.ENUM) {
        //   openEnumModal(true, {
        //     categoryId: data.id,
        //     uuid,
        //     isEdit: false,
        //   });
        // } else if (siderTab.value === ModelTypeEnum.VIEW) {
        //   openViewModal(true, {
        //     categoryId: data.id,
        //     uuid,
        //     isEdit: false,
        //   });
        // }
        break;
      default:
        break;
    }
  };

  const handleModelOpen = ({ data, uuid }) => {
    switch (siderTab.value) {
      case ModelTypeEnum.ENTITY:
        ModelTypeEntityModalRef.value?.open({ ...data });
        break;
      case ModelTypeEnum.ENUM:
        openEnumModal(true, {
          categoryId: data.id,
          uuid,
          isEdit: false,
        });
        break;
      case ModelTypeEnum.VIEW:
        openViewModal(true, {
          categoryId: data.id,
          uuid,
          isEdit: false,
        });
        break;
      case ModelTypeEnum.DATA:
        openDataModal(true, {
          categoryId: data.id,
          uuid,
          isEdit: false,
        });
        break;
      default:
        break;
    }
  };

  const handleViewSQL = async (viewData) => {
    const content = await getViewModelSql({ id: viewData.model });
    openViewSQLModal(true, { content });
  };

  const handleMultiTabChange = async (payload) => {
    if (payload.id === 'ER') {
      isShowER.value = true;
      // return;
    }
    if (payload.id === 'PERMSCOPE') {
      isShowPermScope.value = true;
      // return;
    }
    if (payload.id === 'RECYCLE') {
      isShowRecycle.value = true;
      return;
    }
    // 如果点击的不是当前侧边栏tab
    // window.console.log(payload, siderTab.value);
    if (siderTab.value !== payload.belong) {
      setSiderTab(payload.belong || ModelTypeEnum.ENTITY);
      await initTreeData();
      await nextTick();
      if (payload.id === 'ER') return;
    }
    setTreeSelected(payload.id);
    currentModel.value = payload.id;
    currentModelMap[payload.belong] = payload.id;
  };

  const handleMultiTabClose = (payload) => {
    setTreeSelected(undefined);
    if (payload.id === 'ER') {
      isShowER.value = false;
      return;
    }
    if (payload.id === 'PERMSCOPE') {
      isShowPermScope.value = false;
      return;
    }
    if (payload.id === 'RECYCLE') {
      isShowRecycle.value = false;
      return;
    }
    modelTabs.value = modelTabs.value.filter((item) => item.id !== payload.id);
    // console.log(modelTabs.value);
  };

  /** 新建编辑实体模型弹框OK事件 */
  const handleEntityOk = async (data: ModelMetaVO) => {
    !data.id ? await postModelMetaSave(data) : await putModelMetaById({ id: data.id }, data);
    await initTreeData();
    if (data.id) {
      // 刷新详情页
      pageRef.value.refreshDetailInfo(data.id);
      // 刷新tab内容
      modelTabs.value = modelTabs.value.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            name: data.name as string,
            node: {
              ...item.node,
              name: data.name as string,
            },
          };
        }
        return item;
      });
      // console.log(modelTabs.value);
    }

    const node = setTreeSelected(data.id ?? data.key);

    if (!data.id) {
      handleNodeChange(node);
    }
    closeEntityModal();
  };

  const handleEntityModelEdit = async (data) => {
    openEntityModal(true, data);
  };

  const handleEntityModelDelete = async (id: string) => {
    await deleteModelMeta({ ids: id });
    initTreeData();
    //删除时要把当前tab页关了
    handleMultiTabClose({ id });
  };

  const handleEnmuModelDelete = async (id: string) => {
    await deleteEnumModel({ ids: id });
    initTreeData();
    //删除时要把当前tab页关了
    handleMultiTabClose({ id });
  };

  // 实体-下一步
  const handleNext = (type, data) => {
    const uuid = getUuid([], siderTab.value === ModelTypeEnum.ENTITY ? { chars: 'lowercase' } : {});
    openEntityModal(true, {
      categoryId: data.id,
      uuid,
      isEdit: false,
      type,
    });
  };

  // 实体-上一步
  const handlePrev = (data) => {
    ModelTypeEntityModalRef.value?.open(data);
  };

  /** 编辑视图模型基本信息 */
  const handleViewModelEdit = async (data, stepIndex) => {
    const cloneData = cloneDeep(data);
    openViewModal(true, {
      ...cloneData,
      isEdit: true,
      categoryId: cloneData?.categoryResponse?.id,
      stepIndex,
    });
  };

  /** 保存视图模型 */
  const handleViewOk = async (data, isEdit) => {
    await initTreeData();

    if (isEdit) {
      // 刷新详情页
      viewPageRef.value.refreshDetailInfo(data.id);
      // 刷新tab内容
      modelTabs.value = modelTabs.value.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            name: data.name as string,
            node: {
              ...item.node,
              name: data.name as string,
            },
          };
        }
        return item;
      });
      setTreeSelected(data.id);
    } else {
      const node = setTreeSelected(data.id);
      handleNodeChange(node);
    }
  };

  /** 删除视图模型 */
  const handleViewModelDelete = async (id: string) => {
    await deleteViewModel({ ids: id });
    initTreeData();
    //删除时要把当前tab页关了
    handleMultiTabClose({ id });

    if (modelTabs.value.length > 0) {
      const info = last(modelTabs.value);
      if (info) {
        setTreeSelected(info.id);
        handleNodeChange(info.node);
      }
    }
  };

  const handleDataOk = async (data: any) => {
    !data.id ? await postDataModel(data) : await putDataModelById({ id: data.id }, data);
    await initTreeData();
    if (data.id) {
      // 刷新详情页
      dataModelRef.value.refreshDetailInfo(data.id);
      // 刷新tab内容
      modelTabs.value = modelTabs.value.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            name: data.name as string,
            node: {
              ...item.node,
              name: data.name as string,
            },
          };
        }
        return item;
      });
    }
    const node = setTreeSelected(data.id ?? data.key);
    if (!data.id) {
      handleNodeChange(node);
    }
    closeDataModal();
  };

  const handleDataModelEdit = async (data) => {
    const cloneData = cloneDeep(data);
    openDataModal(true, { ...cloneData, isEdit: true });
  };

  const handleDataModelDelete = async (id: string) => {
    await deleteDataModel({ ids: id });
    initTreeData();
    //删除时要把当前tab页关了
    handleMultiTabClose({ id });
  };
</script>

<style scoped lang="less">
  .primary-focus {
    border-color: var(--ant-primary-color);
  }

  .no-focus {
    border-color: #d9d9d9;
  }

  .recycle-bin {
    display: flex;
    position: relative;
    z-index: 999;
    align-items: center;
    height: 46px;
    padding: 12px 24px 12px 36px;
    transition: all 0.3s;
    border-top: 1px solid #f0f0f0;
    background-color: #fff;
    color: #666;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }

    .iconfont {
      margin-right: 4px;
      line-height: 1em;
    }
  }

  .tree-header-extra-btn {
    height: 34px;
  }

  .icon-moxingsuolveiocn,
  .icon-quanxianzuoyongyu {
    color: var(--ant-primary-color);
  }
</style>
