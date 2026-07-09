<template>
  <tree-sider-page
    ref="rootRef"
    :tabs="treeSideTab"
    @menu-click="handleMenuClick"
    pageName="PageDesigner"
  >
    <template v-if="selectedTreeKey?.length! > 0 && selectedTreeNodeIsFolder">
      <toolbar
        :actions="Actions"
        @handle-web-click="handleWebBtnClick"
        @handle-app-click="handleAppBtnClick"
        @handle-pad-click="handlePadBtnClick"
        :tab="siderTab!"
      />

      <!-- 主体内容区 -->
      <skeleton-preview
        class="page-designer-container select-none"
        :iframe-key="selectedTreeNode.node?.id"
        :iframe-url="webPageUrl"
        :type="siderTab"
      />
    </template>

    <template v-else>
      <empty-page module="pageDesigner" :sub-description="t('sys.model.emptyPageDesignerMsy')" />
    </template>
    <!-- 模态框部分 -->
    <page-modal
      @register="registerNewPage"
      :webPageCategory="treeData"
      :tab="siderTab!"
      @refresh="onRefresh"
    />
  </tree-sider-page>
</template>

<script setup lang="ts" name="PageDesigner">
  import { computed, watch, ref, createVNode, onActivated, onMounted, h } from 'vue';
  import treeSiderPage from '/@/layouts/tree-sider-page-new/next.vue';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { MenuClickEvent, PageTypeEnum } from '/@/layouts/tree-sider-page-new/enum';
  import { PageTypeOptions } from '/@/layouts/tree-sider-page-new/constant';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUUid } from '@/hooks/web/useUUid';
  import Toolbar from './toolbar.vue';
  import { Actions } from './constants/actions';
  import { ButtonTextEnum } from './types/page-model';
  import PageModal from './modals/page-modal.vue';
  import { useModal } from '/@/components/Modal';
  // import { deleteWebpage } from '/@/apis/gct-apaas/WebpageController';
  import emptyPage from '/@app-designer/components/empty-page.vue';
  import SkeletonPreview from '/@/components/SkeletonPreview/index.vue';
  import { genUrl } from '/@/utils';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  // import { deleteMobilePage } from '/@/apis/gct-apaas/MobilePageController';
  // import { Modal } from 'ant-design-vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { getToken } from '/@/utils/auth';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { Modal, message } from 'ant-design-vue';
  import { deleteWebpage } from '/@/apis/gct-apaas/WebpageController';
  import { deleteMobilePage } from '/@/apis/gct-apaas/MobilePageController';
  import { deletePadPage } from '/@/apis/gct-apaas/PadPageController';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { getTenant } from '@gct-paas/core';
  import { usePageDesignUtil } from './hooks/usePageDesign';
  import { SvgIcon } from '@gct/runtime-web';

  const rootRef = ref();

  const { openPageDesignView } = usePageDesignUtil();

  const { branchId } = useBranch();
  const appInfoStore = useAppInfoStore();
  const treeSideTab = computed<any>(() => {
    if (appInfoStore.appInfo.mobileEnabled) {
      return PageTypeOptions;
    } else {
      return PageTypeOptions.filter((tab) => {
        return tab.code !== PageTypeEnum.MOBILE && tab.code !== PageTypeEnum.PAD;
      });
    }
  });
  const { t } = useI18n();
  const [registerNewPage, { openModal: openPageModal }] = useModal();

  const {
    selectedTreeKey,
    selectedTreeNode,
    treeData,
    initTreeData,
    setTreeSelected,
    siderTab,
    sliderTabKeyPrefix,
  } = useTreeSiderPage('PageDesigner');

  const { getUuid } = useUUid(treeData, sliderTabKeyPrefix);

  // 当前选中节点是否为文件夹
  const selectedTreeNodeIsFolder = computed(() => !selectedTreeNode.node?.children);
  const usePathQuery = usePathQueryStore();

  const webPageUrl = ref<string>('');

  onActivated(() => {
    initTreeData();
  });

  // const treeData: Ref<any[]> = ref([]);
  watch(
    () => selectedTreeNode.node?.id,
    (value) => {
      if (siderTab.value === PageTypeEnum.WEB && value) {
        webPageUrl.value = genUrl(
          `${location.origin}${
            import.meta.env.VITE_PATHNAME_WEB_PAGE
          }?_t=${Date.now()}&header=false`,
          {
            aid: usePathQuery.getAid(),
            pid: value,
            bid: branchId.value,
            token: getToken(),
            'tenant-id': getTenant(),
          },
        );
      } else if (siderTab.value === PageTypeEnum.PAD && value) {
        const { hostname, origin } = location;
        const appOrigin = import.meta.env.DEV ? 'http://' + hostname : origin;
        webPageUrl.value = genUrl(
          `${appOrigin}${import.meta.env.VITE_PATHNAME_PAD_PAGE}?_t=${Date.now()}&header=false`,
          {
            aid: usePathQuery.getAid(),
            pid: value,
            bid: branchId.value,
            token: getToken(),
            'tenant-id': getTenant(),
          },
        );
      } else {
        const { hostname, origin } = location;
        const appOrigin = import.meta.env.DEV ? 'http://' + hostname : origin;
        webPageUrl.value = genUrl(
          `${appOrigin}${import.meta.env.VITE_PATHNAME_MOBILE_PAGE}?_t=${Date.now()}&header=false`,
          {
            aid: usePathQuery.getAid(),
            pid: value,
            bid: branchId.value,
            token: getToken(),
            'tenant-id': getTenant(),
          },
        );
      }
    },
  );

  function getNewFrontHost() {
    // 假设当前 window.location.host 是 "my.project.com"
    let hostParts = window.location.host.split('.');

    // 检查长度，确保至少有三个部分（例如 a.b.c）
    if (hostParts.length >= 3) {
      // hostParts.length - 3 是倒数第三个元素的索引
      hostParts[hostParts.length - 3] += 'front';
    } else {
      return '';
    }

    return hostParts.join('.');
  }

  // 查看详情/预览/删除/编辑/设计 Web
  const handleWebBtnClick = async (type: ButtonTextEnum, data, e: MouseEvent) => {
    switch (type) {
      // case ButtonTextEnum.DETAIL:
      //   break;
      // case ButtonTextEnum.PREVIEW:
      //   drawerVisible.value = true;
      //   break;
      case ButtonTextEnum.DELETE:
        Modal.confirm({
          title: t('sys.model.confirmDelWebPageMsg', { webpageName: data.name }),

          okText: t('sys.okText'),
          cancelText: t('sys.cancelText'),
          onOk: async () => {
            if (!selectedTreeKey.value) return;
            await deleteWebpage({ ids: selectedTreeKey.value });
            onRefresh();
          },
          onCancel: () => {},
        });
        break;
      case ButtonTextEnum.EDIT:
        // openPageModal(true, selectedTreeNode);
        //   break;
        // case ButtonTextEnum.DESIGN:
        // openWindow(
        //   genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}`, {
        //     aid: usePathQuery.getAid(),
        //     pid: selectedTreeNode.node.id,
        //     bid: branchId.value,
        //   }),
        //   {
        //     target: '_blank',
        //   },
        // );
        if (e.ctrlKey || e.metaKey) {
          // 如果按住了 Ctrl 键 或 Command 键，则在新标签页中打开
          const url = genUrl(
            `${location.origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}&platform=web`,
            {
              aid: usePathQuery.getAid(),
              pid: selectedTreeNode.node.id,
              bid: branchId.value,
            },
          );
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        // TODO: 临时写法，打开拆分的测试路径
        if (e.altKey && e.shiftKey) {
          const url = `http://${getNewFrontHost()}/page-design/aid=${usePathQuery.getAid()};bid=${branchId.value};pid=${selectedTreeNode.node.id};platform=web#/design`;
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        const webDesignRes = await openPageDesignView(selectedTreeNode.node.id, PageTypeEnum.WEB);

        if (webDesignRes?.ok) {
          rootRef.value.initTreeData();
        }

        // 如果返回了结果且操作成功，且包含id，且id不是当前选中的，则设置为选中节点
        if (webDesignRes?.ok && webDesignRes.data && webDesignRes.data.length > 0) {
          const returnedId = webDesignRes.data[0].id;
          if (returnedId && returnedId !== selectedTreeKey.value) {
            setTreeSelected(returnedId);
          }
        }
        break;
      case ButtonTextEnum.COPY:
        openPageModal(true, { node: { ...data, isCopy: true }, uuid: getUuid() });
        break;
      default:
    }
  };

  // 查看详情/预览/删除/编辑/设计 App
  const handleAppBtnClick = async (type: ButtonTextEnum, data, e: MouseEvent) => {
    switch (type) {
      // case ButtonTextEnum.DETAIL:
      //   break;
      // case ButtonTextEnum.PREVIEW:
      //   drawerVisible.value = true;
      //   break;
      case ButtonTextEnum.DELETE:
        Modal.confirm({
          title: t('sys.model.confirmDelWebPageMsg', { webpageName: data.name }),
          okText: t('sys.okText'),
          cancelText: t('sys.cancelText'),
          onOk: async () => {
            if (!selectedTreeKey.value) return;
            await deleteMobilePage({ ids: data.id });
            onRefresh();
          },
          onCancel: () => {},
        });
        break;
      case ButtonTextEnum.EDIT:
        //   console.log(selectedTreeNode);
        //   openPageModal(true, selectedTreeNode);
        //   break;
        // case ButtonTextEnum.DESIGN:
        // openWindow(
        //   genUrl(
        //     `${location.origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}&platform=mobile`,
        //     {
        //       aid: usePathQuery.getAid(),
        //       pid: selectedTreeNode.node.id,
        //       bid: branchId.value,
        //     },
        //   ),
        //   {
        //     target: '_blank',
        //   },
        // );
        if (e.ctrlKey || e.metaKey) {
          // 如果按住了 Ctrl 键 或 Command 键，则在新标签页中打开
          const url = genUrl(
            `${location.origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}&platform=mobile`,
            {
              aid: usePathQuery.getAid(),
              pid: selectedTreeNode.node.id,
              bid: branchId.value,
            },
          );
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        // TODO: 临时写法，打开拆分的测试路径
        if (e.altKey && e.shiftKey) {
          const url = `http://${getNewFrontHost()}/page-design/aid=${usePathQuery.getAid()};bid=${branchId.value};pid=${selectedTreeNode.node.id};platform=mobile#/design`;
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        const mobileDesignRes = await openPageDesignView(
          selectedTreeNode.node.id,
          PageTypeEnum.MOBILE,
        );

        if (mobileDesignRes?.ok) {
          rootRef.value.initTreeData();
        }

        // 如果返回了结果且操作成功，且包含id，且id不是当前选中的，则设置为选中节点
        if (mobileDesignRes?.ok && mobileDesignRes.data && mobileDesignRes.data.length > 0) {
          const returnedId = mobileDesignRes.data[0].id;
          if (returnedId && returnedId !== selectedTreeKey.value) {
            setTreeSelected(returnedId);
          }
        }
        break;
      case ButtonTextEnum.COPY:
        openPageModal(true, { node: { ...data, isCopy: true }, uuid: getUuid() });
        break;
      default:
    }
  };

  // 查看详情/预览/删除/编辑/设计 PAD
  const handlePadBtnClick = async (type: ButtonTextEnum, data, e: MouseEvent) => {
    switch (type) {
      case ButtonTextEnum.DELETE:
        Modal.confirm({
          title: t('sys.model.confirmDelWebPageMsg', { webpageName: data.name }),
          okText: t('sys.okText'),
          cancelText: t('sys.cancelText'),
          onOk: async () => {
            if (!selectedTreeKey.value) return;
            await deletePadPage({ ids: data.id });
            onRefresh();
          },
          onCancel: () => {},
        });
        break;
      case ButtonTextEnum.EDIT:
        if (e.ctrlKey || e.metaKey) {
          // 如果按住了 Ctrl 键 或 Command 键，则在新标签页中打开
          const url = genUrl(
            `${location.origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}&platform=pad`,
            {
              aid: usePathQuery.getAid(),
              pid: selectedTreeNode.node.id,
              bid: branchId.value,
            },
          );
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        // TODO: 临时写法，打开拆分的测试路径
        if (e.altKey && e.shiftKey) {
          const url = `http://${getNewFrontHost()}/page-design/aid=${usePathQuery.getAid()};bid=${branchId.value};pid=${selectedTreeNode.node.id};platform=pad#/design`;
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        const padDesignRes = await openPageDesignView(selectedTreeNode.node.id, PageTypeEnum.PAD);

        if (padDesignRes?.ok) {
          rootRef.value.initTreeData();
        }

        // 如果返回了结果且操作成功，且包含id，且id不是当前选中的，则设置为选中节点
        if (padDesignRes?.ok && padDesignRes.data && padDesignRes.data.length > 0) {
          const returnedId = padDesignRes.data[0].id;
          if (returnedId && returnedId !== selectedTreeKey.value) {
            setTreeSelected(returnedId);
          }
        }
        break;
      case ButtonTextEnum.COPY:
        openPageModal(true, { node: { ...data, isCopy: true }, uuid: getUuid() });
        break;
      default:
    }
  };

  const handleMenuClick = ({ data, key, event }) => {
    const e = event as PointerEvent;
    switch (key) {
      case MenuClickEvent.NEW:
        // openPageModal(true, { categoryId: data.id, uuid: getUuid() });
        let categoryId = '';
        if (rootRef.value) {
          const node = rootRef.value.getSelectTreeNode();
          categoryId = node?.categoryId;
        }
        const viewType =
          siderTab.value === PageTypeEnum.WEB
            ? PageTypeEnum.WEB
            : siderTab.value === PageTypeEnum.PAD
              ? PageTypeEnum.PAD
              : PageTypeEnum.MOBILE;
        const pid = `___new___:${getUuid()}`;
        if (e.ctrlKey || e.metaKey) {
          // 如果按住了 Ctrl 键 或 Command 键，则在新标签页中打开
          const url = genUrl(
            `${origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}&platform=${
              viewType === PageTypeEnum.WEB
                ? 'web'
                : viewType === PageTypeEnum.PAD
                  ? 'pad'
                  : 'mobile'
            }&category=${categoryId || ''}`,
            {
              aid: usePathQuery.getAid(),
              pid: pid,
              bid: branchId.value,
            },
          );
          const win = window.open(url, '_blank');
          win?.focus();
          return;
        }
        openPageDesignView(pid, viewType, categoryId).then(async (res) => {
          // 如果返回了结果且操作成功，且包含id，则设置为选中节点
          if (res?.ok && res.data && res.data.length > 0) {
            const returnedId = res.data[0].id;
            if (returnedId) {
              const data = await initTreeData();
              const parentNode = data.find((row) => row.children.find((c) => c.id === returnedId));

              if (parentNode) {
                rootRef.value.expand(parentNode);
              }
              setTreeSelected(returnedId);
            }
          }
        });
        break;
      case ButtonTextEnum.DELETE:
        Modal.confirm({
          title: t('sys.model.confirmDelWebPageMsg2', { webpageName: ` ${data.name} ` }),
          content: t('sys.model.confirmDelWebPageContent'),
          okText: t('sys.okText'),
          icon: h(SvgIcon, {
            src: '/assets/card-design/exclamation-circle.svg',
            class: 'anticon',
          }), // 使用h函数

          centered: true,
          class: 'delete-page-modal ',
          cancelText: t('sys.cancelText'),
          onOk: async () => {
            if (siderTab.value === PageTypeEnum.WEB) {
              await deleteWebpage({ ids: data.id });
            } else {
              await deleteMobilePage({ ids: data.id });
            }

            onRefresh();
            setTreeSelected(undefined);
            message.success(t('sys.delSuccess'));
          },
          onCancel: () => {},
        });
        break;
      case ButtonTextEnum.COPY:
        openPageModal(true, { node: { ...data, isCopy: true }, uuid: getUuid() });
        break;
      default:
        break;
    }
  };

  const onRefresh = async (data?) => {
    await initTreeData();
    if (data) {
      setTreeSelected(data.key);
    }
  };

  /**
   * 刷新后的根据路由参数，重新打开编辑视图
   */
  async function onReopenView() {
    const query = window._vue_router_instance.currentRoute.value.query;
    if (query.id) {
      // 打开页面设计器
      const res = await openPageDesignView(query.id as string, query.mode as PageTypeEnum);

      if (res?.ok) {
        rootRef.value.initTreeData();
      }

      // 如果返回了结果且操作成功，且包含id，则设置为选中节点
      if (res?.ok && res.data && res.data.length > 0) {
        const returnedId = res.data[0].id;
        if (returnedId) {
          setTreeSelected(returnedId);
        }
      }
    }
  }

  onMounted(() => {
    onReopenView();
  });
</script>
<style lang="less">
  .delete-page-modal {
    width: 316px !important;

    .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content {
      margin-left: 30px !important;
    }
  }
</style>
<style scoped lang="less">
  .primary-focus {
    border-color: var(--ant-primary-color);
  }

  .no-focus {
    border-color: #d9d9d9;
  }

  .page-designer-container {
    width: 100%;
    height: calc(100% - 68px);
    // background-color: #fff;
    padding: 0 24px 24px;

    iframe {
      width: 100%;
      height: 100%;
    }
  }

  .drawer-container {
    width: 100%;
    height: 100%;
    background-color: #fff;

    iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
