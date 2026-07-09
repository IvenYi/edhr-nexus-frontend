<template>
  <tree-sider-page
    :tabs="treeSideTab"
    :hasInsertAuth="hasInsertAuth"
    @menu-click="handleMenuClick"
    @tab-label-click="handleTabClick"
  >
    <template v-if="selectedTreeKey?.length! > 0 && selectedTreeNodeIsFolder">
      <template v-if="siderTab === PrintTypeEnum.LABEL">
        <toolbar
          :actions="showActions"
          @handle-label-click="handleLabelBtnClick"
          :tab="siderTab!"
        />
        <!-- 主体内容区 -->
        <div class="wrap">
          <stage-canvas
            v-if="project"
            ref="canvas"
            style="pointer-events: none; user-select: none"
          />
        </div>
      </template>
      <template v-if="siderTab === PrintTypeEnum.RECEIPT">
        <DocumentDesigner
          :data="selectedTreeNode.node"
          :isOptionShow="isOptionShow"
          :isFrontPrint="isFrontPrint"
          @refresh="() => onRefresh({})"
        />
      </template>
    </template>

    <template v-else>
      <empty-page
        v-if="siderTab === PrintTypeEnum.LABEL"
        :description="t('sys.printDesigner.labelDesignerListEmptyTip')"
        :sub-description="t('sys.pageDesigner.clickPageToDetail')"
      />
      <empty-page
        v-if="siderTab === PrintTypeEnum.RECEIPT"
        :description="t('sys.printDesigner.printDesignerListEmptyTip')"
        :sub-description="t('sys.pageDesigner.clickPageToDetail')"
      />
    </template>
    <!-- 模态框部分 -->
    <label-modal
      @register="register"
      :labelCategory="labelTypes"
      :tab="siderTab!"
      :isFrontPrint="isFrontPrint"
      @refresh="onRefresh"
    />
  </tree-sider-page>
</template>

<script setup lang="ts" name="print-designer">
  import { computed, watch } from 'vue';
  import treeSiderPage from '/@/layouts/tree-sider-page/next.vue';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { MenuClickEvent, PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { PrintTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUUid } from '@/hooks/web/useUUid';
  import Toolbar from './toolbar.vue';
  import { Actions } from './constants/actions';
  import { ButtonTextEnum } from './types/print-model';
  import LabelModal from './modals/label-modal.vue';
  import { useModal } from '/@/components/Modal';
  import emptyPage from '/@app-designer/components/empty-page.vue';
  import openWindow from '/@app-designer/tools/openWindow';
  import { Modal } from 'ant-design-vue';
  import { deleteLabel } from '/@/apis/gct-apaas/LabelController';
  import { loadLabelInfo, usePage } from './label-designer/hooks/usePage';
  import StageCanvas from './label-designer/stage/stage-canvas.vue';
  import ReceiptModal from './modals/receipt-modal';
  import { DocumentDesigner } from './document-designer/document-designer';
  import { useRoute, useRouter } from 'vue-router';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

  const treeSideTab = computed(() => {
    return PrintTypeOptions;
  });
  const { project } = usePage();
  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const route = useRoute();
  const router = useRouter();

  const emit = defineEmits(['tab-change']);

  const {
    selectedTreeKey,
    selectedTreeNode,
    treeData,
    initTreeData,
    setTreeSelected,
    siderTab,
    sliderTabKeyPrefix,
  } = useTreeSiderPage();

  const { getUuid } = useUUid(treeData, sliderTabKeyPrefix);
  // 当前选中节点是否为文件夹
  const selectedTreeNodeIsFolder = computed(() => !selectedTreeNode.node.children);

  watch(
    () => selectedTreeNode.node.id,
    (value) => {
      siderTab.value === PrintTypeEnum.LABEL && loadLabelInfo(value);
    },
  );

  const userActions = computed(() => {
    return {
      [BasicAction.Insert]: getPermissionByKey('PrintDesigner', BasicAction.Insert),
      [BasicAction.Update]: getPermissionByKey('PrintDesigner', BasicAction.Update),
      [BasicAction.Delete]: getPermissionByKey('PrintDesigner', BasicAction.Delete),
      [BasicAction.Design]: getPermissionByKey('PrintDesigner', BasicAction.Design),
    };
  });

  const hasInsertAuth = computed(() => {
    let auth = true;
    if (isFrontPrint.value) {
      auth = !!userActions.value[BasicAction.Insert];
    }
    return auth;
  });

  const isOptionShow = computed(() => {
    const item = treeData.value.find((i) => {
      const keys = i.children?.map((v) => v.id);
      return keys.includes(selectedTreeNode.node.id);
    });
    return !(item?.id === '_SYS_' && isFrontPrint.value);
  });

  const showActions = computed(() => {
    let list: any = [];
    if (isFrontPrint.value) {
      if (!isOptionShow.value) {
        list = Actions.filter((i) => i.text == ButtonTextEnum.DETAIL);
      } else {
        const arr = Object.entries(userActions.value)
          .filter((i) => !!i[1])
          .map((v) => v[0].toLowerCase());
        arr.push(ButtonTextEnum.DETAIL);
        list = Actions.filter(
          (i) => arr.includes(i.text) || (i.text == ButtonTextEnum.EDIT && arr.includes('update')),
        );
      }
    } else {
      list = Actions;
    }
    return list;
  });

  // 查看详情/预览/删除/编辑/设计 Web
  const handleLabelBtnClick = async (type: ButtonTextEnum) => {
    switch (type) {
      case ButtonTextEnum.DETAIL:
        break;
      case ButtonTextEnum.DELETE:
        Modal.confirm({
          title: t('sys.model.confirmDelWebPageMsg', { webpageName: selectedTreeNode.node.name }),
          okText: t('sys.okText'),
          cancelText: t('sys.cancelText'),
          onOk: async () => {
            if (!selectedTreeKey.value) return;
            await deleteLabel({ ids: selectedTreeKey.value });
            selectedTreeKey.value = undefined;
            onRefresh({});
          },
          onCancel: () => {},
        });
        break;
      case ButtonTextEnum.EDIT:
        openModal(true, selectedTreeNode);
        break;
      case ButtonTextEnum.DESIGN:
        if (isFrontPrint.value) {
          // 前台web-render处理
          const routeData = router.resolve({
            name: 'LabelDesigner',
            params: { id: selectedTreeKey.value },
          });
          window.open(routeData.href, '_blank');
        } else {
          openWindow('#/label-designer/' + selectedTreeKey.value);
        }
        break;
      default:
    }
  };

  const handleMenuClick = ({ data, key }) => {
    switch (key) {
      case MenuClickEvent.NEW:
        if (siderTab.value === PrintTypeEnum.LABEL) {
          openModal(true, { categoryId: data.id, uuid: getUuid() });
        }
        if (siderTab.value === PrintTypeEnum.RECEIPT) {
          console.log(isFrontPrint.value, 'print-designer');
          gct.openUtil
            .modal(
              ReceiptModal,
              { id: data.id, context: { isFrontPrint: isFrontPrint.value } },
              {
                title: data.id
                  ? t('sys.appDesigner.printDesign.editReceipt')
                  : t('sys.appDesigner.printDesign.newReceipt'),
                width: 640,
                height: 702,
                showFooter: false,
              },
            )
            .then((result) => {
              if (result && result.ok && result.data && result.data.length > 0) {
                onRefresh(result.data[0]);
              }
            });
        }
        break;
      default:
        break;
    }
  };

  const isFrontPrint = computed(() => {
    const arr = route.fullPath.split('/');
    const routeName = arr[arr.length - 1];
    return routeName == 'PrintDesigner';
  });

  const labelTypes = computed(() => {
    return isFrontPrint.value ? treeData.value.filter((i) => i.id !== '_SYS_') : treeData.value;
  });

  const handleTabClick = (val) => {
    emit('tab-change', val);
  };

  const onRefresh = async (data) => {
    await initTreeData();
    setTreeSelected(data.key);
  };
</script>
<style lang="less" scoped>
  .wrap {
    display: flex;
    align-items: center;
    height: calc(100% - 60px);
    overflow: auto;
    background-color: #f1f1f1;
  }
</style>
