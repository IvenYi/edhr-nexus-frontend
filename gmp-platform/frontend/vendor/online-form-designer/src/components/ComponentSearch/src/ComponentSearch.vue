<template>
  <div class="gct-component-search">
    <a-input
      ref="searchBox"
      v-model:value="searchVal"
      :placeholder="t('sys.searchComponentKey')"
      @pressEnter="handlerSearch"
      @clear="clear"
      allow-clear
    >
      <template #prefix>
        <SearchOutlined/>
      </template>
    </a-input>
    <search-modal ref="searchRef" @selectResult="selectResult" />
  </div>
</template>
<script setup lang="ts" name="ComponentSearch">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import { togglePanel } from '/@page-designer/hooks/usePage';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import SearchModal from './search-modal.vue';

  import { SCOPE, SUB_TABLE_EDIT_MODE, ToolkitEnum, FormComponents } from '/@page-designer/enum';

  const { pageJson, setModalDesignState, modalInfo, setSubTableModalDesignState } = useDesigner();
  const { setSelectedWidget, resetSelectedWidget, setSelectedModal, resetSelectedModal } =
    useSelectedWidget();
  const { toggleToolkit, setFieldToolkit } = useToolkit();
  const { mitt } = useMitt();

  const { t } = useI18n();

  const searchVal = ref('');
  const searchRef = ref(null);

  const selectResult = async (searchResult, tabsObj) => {
    let { modalId, subTableData, result, key } = searchResult;
    // 重置回页面
    await setSubTableModalDesignState(false);
    await setModalDesignState(false);
    await resetSelectedWidget(SCOPE.PAGE);
    await resetSelectedModal();
    await togglePanel(SCOPE.PAGE);

    // 若有弹窗则打开弹窗
    if (modalId) {
      await toggleToolkit(ToolkitEnum.MODAL, true);
      await setModalDesignState(true, modalId);
      await resetSelectedWidget(SCOPE.MODAL);
      await setSelectedModal(modalInfo.value);

      if (tabsObj) {
        for (let tab in tabsObj) {
          mitt.emit('tabs-change-selected', { tabId: tab, selectedKey: tabsObj[tab] });
        }
      }
    }

    // 如查询到字表，则打开字表
    if (subTableData) {
      await setSelectedWidget(subTableData);
      await setSubTableModalDesignState(true, subTableData.id);
      const formInfo = subTableData.children![0]?.children?.[0]?.children?.[0];
      if (formInfo) {
        await setFieldToolkit({
          modelKey: formInfo.props.model,
          formId: formInfo.id,
          childParentModelKey: formInfo.props.refParentModelkey,
        });
      }
    }

    // 选中所查组件
    setSelectedWidget(result);
    // 将所选元素移动至可视区
    const element = document.body.querySelector(`#${key}`);
    if (!modalId) {
      element?.scrollIntoViewIfNeeded();
    } else {
      setTimeout(() => {
        element?.scrollIntoView(false);
      }, 200);
    }
  };

  const handlerSearch = async () => {
    const key = searchVal?.value?.trim();
    if (key) {
      let result = null;
      let modalIds = [];
      let subTableData = null;
      let path = [];
      let tabPaneId = '';
      let tabsObj = {};

      const findWidgetByKey = (node, id) => {
        path.push(node);
        if (node.id === id) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          for (let child of node.children) {
            const result = findWidgetByKey(child, id);
            if (result) {
              if (node.type === FormComponents.TabPane) {
                tabPaneId = node.id;
              }
              if (node.type === FormComponents.Tabs && tabPaneId) {
                tabsObj[node.id] = tabPaneId;
                mitt.emit('tabs-change-selected', { tabId: node.id, selectedKey: tabPaneId });
              }
              return result;
            }
          }
        }
        path.pop();
        return null;
      };

      if (pageJson.modals?.length) {
        for (let i = 0; i < pageJson.modals.length; i++) {
          path = [];
          const tempResult = findWidgetByKey(pageJson.modals[i], key);
          if (tempResult) {
            result = tempResult;
            modalIds.push(pageJson.modals[i].id);
          }
        }
      }

      if (!result && pageJson.widgets?.length) {
        for (let i = 0; i < pageJson.widgets.length; i++) {
          path = [];
          result = findWidgetByKey(pageJson.widgets[i], key);
          if (result) break;
        }
      }

      if (!result) {
        clear();
        message.warning(t('sys.component.app.searchNotData'));
        return;
      }
      if (path.some((n) => n.type === SCOPE.MODAL)) {
        subTableData = path.find((item) => item.type === FormComponents.SubTable);
        // 如果关联子表中组件类型为行内时，无法查询到组件
        if (subTableData?.props?.editMode === SUB_TABLE_EDIT_MODE.INLINE) {
          message.warning(t('sys.component.app.searchNotData'));
          return;
        }
      }
      let searchResult = { subTableData, result, key };
      if (modalIds.length) {
        searchResult.modalId = modalIds[0];
        selectResult(searchResult, tabsObj);
        if (modalIds.length > 1) {
          searchRef.value.showModal(modalIds, searchResult, tabsObj);
        }
      } else {
        selectResult(searchResult);
      }
    }
  };
  const clear = () => {
    searchRef.value.close();
  };
</script>
<style lang="less" scoped>
  .gct-component-search {
    display: flex;
    width: 200px;
    margin-left: auto;
    border-radius: 4px;

    .ant-input-affix-wrapper {
      border: none;
      background: var(--gct-color-bg-3);
      color: var(--gct-color-text-1);

      :deep(.ant-input) {
        background: var(--gct-color-bg-3);
        color: var(--gct-color-text-1);

        &::placeholder {
          transition: all 0.3s;
          color: var(--gct-color-text-6);
          font-size: 14px;
          font-weight: 400;
        }
      }

      :deep(.ant-input-suffix) {
        .ant-input-clear-icon-has-suffix {
          color: var(--gct-color-text-6);
        }
      }

      &:hover {
        background: var(--gct-color-bg-3);
        color: var(--gct-color-text-1);

        :deep(.ant-input) {
          background: var(--gct-color-bg-3);
        }
      }

      &:active,
      &-focused {
        background: var(--gct-color-bg-3) !important;
        color: var(--gct-color-text-1);

        :deep(.ant-input) {
          background: var(--gct-color-bg-3) !important;
        }
      }
    }
  }
  :deep(.gct-hidden-input-icon) {
    .anticon-close-circle {
      visibility: visible;
    }
  }
  :deep(.anticon.ant-input-clear-icon-hidden) {
    visibility: hidden;
  }
</style>
