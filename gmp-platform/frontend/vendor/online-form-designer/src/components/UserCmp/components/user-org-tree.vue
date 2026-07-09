<template>
  <div>
    <a-page-header class="tree-header">
      <template #title>
        <div class="title"> {{ t('sys.org.orgTree') }} </div>
      </template>
      <template #extra>
        <div class="extra-btn">
          <a-dropdown v-if="btnConfig?.['HEAD']">
            <a class="create-org-dropdown" @click.prevent>
              <plus-outlined class="mr4px" />{{ t('sys.org.addRootOrg') }}
            </a>
            <template #overlay>
              <a-menu @click="({ key }) => handleMenuClick({ key, data: '', root: true })">
                <a-menu-item v-for="menu of btnConfig['HEAD']" :key="menu.key">
                  {{ menu.name }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </template>
    </a-page-header>
    <div class="tree-box">
      <ScrollContainer>
        <a-tree
          ref="treeRef"
          draggable
          block-node
          showIcon
          :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
          v-model:expandedKeys="expandedKeys"
          :selectedKeys="selectedTreeKey"
          :tree-data="treeData"
          @select="onTreeSelect"
          @drop="onDrop"
          @dragenter="onDragEnter"
        >
          <template #icon="props">
            <i :class="['iconfont', icons[props.type]]"></i>
          </template>
          <template #title="{ name, sortNum, data, parentId, id, children, indexDeep } = data">
            <div
              class="tree-node relative"
              :data-sort="sortNum ?? 0"
              :data-pid="parentId"
              :data-id="id"
              :data-haschild="!!children?.length"
            >
              <span class="name" :title="name">{{ name }}</span>
              <span class="hidden more-btn" @click.stop>
                <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                  <ellipsis-outlined />
                  <template #overlay>
                    <a-menu @click="({ key }) => handleMenuClick({ key, data, root: false, name })">
                      <a-menu-item
                        v-for="menu of getMenuList(btnConfig[data.type], indexDeep)"
                        v-bind="menu.style"
                        :key="menu.key"
                        v-show="!indexDeep || indexDeep < 14"
                      >
                        {{
                          data.type === TypeReqEnum.GROUP &&
                          menu.key === TreeMenuBtnTypeEnum.AddCompany
                            ? $t('sys.org.addChildCompany')
                            : menu.name
                        }}
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </span>
            </div>
          </template>
        </a-tree>
      </ScrollContainer>
    </div>
    <org-modal @register="orgRegister" @ok="handleOrgModalOk" />
    <org-delete-modal @register="orgDelRegister" @ok="handleDelOrgModalOk" />
  </div>
</template>
<script setup lang="ts" name="user-org-tree">
  import {
    ref,
    onBeforeMount,
    createVNode,
    unref,
    onUnmounted,
    onMounted,
    nextTick,
    computed,
  } from 'vue';
  import { Modal, message } from 'ant-design-vue';
  import {
    PlusOutlined,
    RedoOutlined,
    EllipsisOutlined,
    ExclamationCircleFilled,
  } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { useModal } from '/@/components/Modal';
  import OrgModal from './modal/org-modal.vue';
  import OrgDeleteModal from './modal/org-delete-modal.vue';
  import { useEmitter } from '../hooks/useEmitter';
  import Sortable from 'sortablejs';
  import { ScrollContainer } from '/@/components/Container';
  import {
    TypeEnum,
    ModalTypeEnum,
    TypeReqMap,
    TreeMenuBtnTypeEnum,
    getTreeMenuBtn,
    transformType,
    dropNode,
    TypeReqEnum,
    treeMenuConfig,
  } from '../constant/treeInterface';
  import { PlatformEnum } from '../constant/interface';

  import type { AntTreeNodeDropEvent, AntTreeNodeDragEnterEvent } from 'ant-design-vue/es/tree';
  import type { TreeApi } from '../types/index.d';
  import { cloneDeep } from 'lodash-es';
  import { postOrgOrgHavePersonCheck } from '/@/apis/gct-platform/OrgController';

  interface Props {
    treeApi: TreeApi;
    /** 平台类型 */
    platformType: PlatformEnum;
  }

  const icons = {
    [TypeReqEnum.GROUP]: 'icon-jituan',
    [TypeReqEnum.COMPANY]: 'icon-gongsi',
    // [TypeReqEnum.DEPARTMENT]: 'icon-section',
  };

  const { t } = useI18n();
  const treeRef = ref();

  const { emitter, EmitterEnum } = useEmitter();

  const {
    setTreeSelect,
    selectedTreeKey,
    initTree,
    treeData,
    addTreeNode,
    updateTreeNode,
    deleteTreeNode,
    dragTreeNode,
    isExistUser2SelectOrg,
    restTree,
  } = useTreeList();

  const visible = ref(false);
  const [orgRegister, { openModal: openOrgModal }] = useModal();
  const [orgDelRegister, { openModal: openOrgDelModal }] = useModal();

  const props = defineProps<Props>();

  const expandedKeys = ref<(string | number)[]>([]);
  const btnConfig = ref();

  onBeforeMount(async () => {
    await initTree(props.treeApi.init);
    btnConfig.value = getTreeMenuBtn(props.platformType);
    console.log('btnConfig.value', btnConfig.value);
    setTreeSelect([treeData.value[0].id], treeData.value[0]);

    emitter.on(EmitterEnum.on_refresh_tree_list, async () => {
      await initTree(props.treeApi.init);
    });
  });
  const getMenuList = (list, idx) => {
    if (!idx || idx < 14) {
      return list;
    } else {
      return list.filter((i) => i.key !== 'addDepartment');
    }
  };
  onUnmounted(() => {
    restTree();
  });
  // onMounted(() => {
  //   nextTick(() => {
  //     initSortable();
  //   });
  // });

  const onTreeSelect = (selectIds, { node }) => {
    if (!expandedKeys.value.some((e) => e === node.id)) expandedKeys.value.push(node.id);
    else {
      const idx = expandedKeys.value.findIndex((e) => e === node.id);
      expandedKeys.value.splice(idx, 1);
    }
    //不让树取消选中
    if (selectIds.length == 0) {
      return;
    }
    setTreeSelect(selectIds, node);
  };

  const onDrop = async (info: AntTreeNodeDropEvent) => {
    const params = dropNode(info, unref(treeData.value));
    if (params.type === 'error') {
      message.error(params.msg);
      return false;
    }
    await dragTreeNode(props.treeApi.drag, params);
  };

  const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    // expandedKeys 需要展开时
    expandedKeys.value = info.expandedKeys;
  };

  const cantDelete = async (data) => {
    // 返回值，true可以删，false不能删
    if (data?.children?.length) return true;
    const res = await postOrgOrgHavePersonCheck({ id: data.id });
    return !res;
  };

  const handleMenuClick = async ({
    key,
    data,
    root,
    name,
  }: {
    key: string;
    data?: any;
    root: boolean;
    name?: string;
  }) => {
    const params = {};
    if (data) {
      Object.assign(params, {
        parentId: data.id,
      });
    }
    let title;
    if (!root && data.type === TypeReqEnum.GROUP && key === TreeMenuBtnTypeEnum.AddCompany) {
      title = $t('sys.org.addChildCompany');
    } else title = treeMenuConfig[key]?.name;
    if (
      [
        TreeMenuBtnTypeEnum.AddBloc,
        TreeMenuBtnTypeEnum.AddCompany,
        TreeMenuBtnTypeEnum.AddDepartment,
      ].includes(key)
    ) {
      if (key === TreeMenuBtnTypeEnum.AddBloc) {
        Object.assign(params, {
          type: TypeEnum.Bloc,
        });
      } else if (key === TreeMenuBtnTypeEnum.AddCompany) {
        Object.assign(params, {
          type: TypeEnum.Company,
        });
      } else if (key === TreeMenuBtnTypeEnum.AddDepartment) {
        Object.assign(params, {
          type: TypeEnum.Department,
        });
      }
      openOrgModal(true, {
        modalType: ModalTypeEnum.Create,
        ...params,
        title,
      });
    } else if (key === TreeMenuBtnTypeEnum.Edit) {
      openOrgModal(true, {
        modalType: ModalTypeEnum.Edit,
        type: transformType(data.type),
        id: data.id,
        parentId: data.parentId,
        identifier: data.identifier,
        name: data.name,
        title: title + t(`sys.org.orgType.${data.type}`),
      });
    } else if (key === TreeMenuBtnTypeEnum.Delete) {
      // visible.value = true;
      // data.popVisible = true;
      // 如果存在下级组织或者当前选择的组织下存在用户
      // if (
      //   (data.children.length || isExistUser2SelectOrg.value) &&
      //   data.type === TypeReqEnum.DEPARTMENT
      // ) {
      //   openOrgDelModal(true, {
      //     id: data.id,
      //     tenantId: data.tenantId,
      //   });
      // }
      // if (data.children.length) {
      //   Modal.warning({
      //     title: t('sys.org.deleteOrgTip'),
      //     icon: createVNode(ExclamationCircleFilled),
      //     okText: t('sys.org.iKnow'),
      //     onOk() {},
      //     onCancel() {},
      //   });
      // } else {
      // }
      const delFlag = await cantDelete(data);

      Modal[delFlag ? 'warning' : 'confirm']({
        title: delFlag ? t('sys.org.deleteOrgTip') : t('sys.org.deleteOrgConfirmTip', { name }),
        icon: createVNode(ExclamationCircleFilled),
        okText: delFlag ? t('sys.org.iKnow') : t('sys.okText'),
        cancelText: t('sys.cancel'),
        width: delFlag ? '285px' : '236px',
        centered: true,
        onOk() {
          // deleteTreeNode(props.treeApi.delete, { ids: data.id });
          !delFlag && deleteFunc(data);
        },
        onCancel() {},
      });
    }
  };

  const handleOrgModalOk = ({ info, type, isEdit }) => {
    if (isEdit) {
      updateTreeNode(
        props.treeApi.edit,
        {
          ...info,
          type: TypeReqMap[type],
        },
        {
          id: info.id,
        },
      );
    } else {
      addTreeNode(props.treeApi.add, {
        ...info,
        type: TypeReqMap[type],
      });
    }
    message.success(t('sys.saveSuccess'));
  };

  const handleDelOrgModalOk = async (info) => {
    await props.treeApi.transfer2Delete({
      id: info.id,
      targetParentId: info.targetParentId,
    });
    initTree(props.treeApi.init);
  };

  const deleteFunc = async (data) => {
    await deleteTreeNode(props.treeApi.delete, { ids: data.id });
    message.success(t('sys.deleteSuccess'));
  };

  // function initSortable() {
  //   const rows = document.querySelector('.ant-tree .ant-tree-list-holder-inner') as HTMLElement;
  //   let newIndex;
  //   let insertPid;
  //   let dragId;
  //   let expandIds: any;
  //   new Sortable(rows, {
  //     animation: 150,
  //     // dataIdAttr: 'data-row-key',
  //     // disabled: disableSort.value,
  //     filter: '.unsortable', // 指定不可拖动项的选择器
  //     onStart: () => {
  //       expandIds = cloneDeep(expandedKeys.value);
  //     },
  //     onMove: (evt) => {
  //       // 限制只能同层级拖拽
  //       const { related, dragged, willInsertAfter } = evt;
  //       newIndex = undefined;
  //       insertPid = undefined;
  //       dragId = undefined;
  //       const dragItem = dragged.querySelector('.tree-node') as HTMLElement;
  //       let insertItem = related.querySelector('.tree-node') as HTMLElement;
  //       const dragPid = dragItem?.dataset?.pid;
  //       insertPid = insertItem?.dataset?.pid;
  //       dragId = dragItem?.dataset?.id;
  //       const insertId = insertItem?.dataset?.id;
  //       const parentLevelIds = getSameLevelIds(treeData.value, dragPid);
  //       const levelIds = getSameLevelIds(treeData.value, dragId);
  //       // 拖拽节点时，将所有的同层级收起
  //       if (levelIds && levelIds.length) {
  //         expandedKeys.value = expandedKeys.value.filter((e) => !levelIds.includes(e));
  //       }
  //       // 拖拽遇到未展开的父级，手动展开
  //       if (
  //         insertId &&
  //         !expandedKeys.value.includes(insertId) &&
  //         parentLevelIds.includes(insertId)
  //       ) {
  //         expandedKeys.value.push(insertId!);
  //       }
  //       // 不可拖拽返回false
  //       if (!dragPid || !insertPid) {
  //         return false;
  //       }
  //       const insertNo: number = Number(insertItem?.dataset?.sort ?? '0');
  //       newIndex = willInsertAfter ? insertNo + 1 : insertNo - 1;
  //       if (newIndex < 0 && newIndex !== undefined) newIndex = 0;
  //       return true;
  //     },
  //     onEnd: async () => {
  //       if (expandIds) expandedKeys.value = cloneDeep(expandIds);
  //       expandIds = undefined;
  //       if (newIndex == undefined) return;
  //       const params = {
  //         id: dragId,
  //         targetParentId: insertPid,
  //         targetSortNum: newIndex,
  //       };
  //       await dragTreeNode(props.treeApi.drag, params);
  //       message.success(t('sys.saveSuccess'));
  //     },
  //   });
  // }

  // 判断拖放的位置是否是同层级的
  // function canInsert(dragPid, insertPid): boolean {
  //   if (dragPid === 'ROOT' || insertPid === 'ROOT') {
  //     return dragPid === insertPid;
  //   }
  //   const ids = getSameLevelIds(treeData.value, dragPid);
  //   return ids.some((e) => e === insertPid);
  // }

  // 获取所有同层级的id
  // function getSameLevelIds(list, pid): string[] {
  //   let ids: string[] = [];
  //   if (pid === 'ROOT') {
  //     return [];
  //   }
  //   if (list.some((e) => e.id === pid)) {
  //     ids = list.map((e) => e.id);
  //   } else {
  //     let arr: any[] = [];
  //     list.forEach((e) => {
  //       if (e.children) {
  //         arr.push(...e.children);
  //       }
  //     });
  //     ids = getSameLevelIds(arr, pid);
  //   }
  //   return ids;
  // }
</script>

<style lang="less" scoped>
  .tree-header {
    padding: 16px;
    border-bottom: 1px solid #eaeaea;

    :deep(.ant-page-header-heading-left) {
      margin: 0;
    }

    :deep(.ant-page-header-heading-title) {
      line-height: 20px;
    }

    :deep(.ant-page-header-heading-extra) {
      margin: 0;
    }

    .title {
      color: #212528;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 16px;
      font-weight: 500;
    }

    .extra-btn {
      display: flex;

      .create-org-dropdown {
        font-size: 14px;
        line-height: 20px;
      }

      a {
        font-size: 14px;
        line-height: 20px;
      }
    }
  }
  :deep(.ant-tree-indent-unit) {
    width: 12px;
  }

  .tree-box {
    height: calc(100% - 53px);
    padding: 8px 0;
    overflow: auto;

    :deep(.ant-tree-treenode) {
      position: relative;
      padding: 0 16px 0 28px;
      color: #6a717d;

      &:hover {
        background: #f7f8fa;
      }

      &::before {
        content: '\e810';
        display: none;
        position: absolute;
        top: 8px;
        left: 8px;
        color: #888 !important;
        font-family: iconfont !important;
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        font-style: normal;
      }

      &:hover::before {
        display: block;
      }

      &.sortable-chosen::before {
        color: var(--ant-primary-color) !important;
      }

      &:hover {
        .more-btn {
          display: inline-block;
        }
      }
    }

    :deep(.ant-tree-switcher) {
      width: 14px;
      color: #797a7d;
      line-height: 40px;
    }

    :deep(.ant-tree-switcher .ant-tree-switcher-icon) {
      font-size: 14px;
      vertical-align: middle;
    }

    :deep(.ant-tree-node-content-wrapper) {
      display: flex;
      align-items: center;
      min-height: 40px;

      .ant-tree-iconEle {
        width: auto;
        color: #7f8696;
        line-height: 20px;

        .iconfont {
          font-size: 20px;

          &.icon-gongsi {
            margin-left: 4px;
            color: #3b9312;
          }

          &.icon-jituan {
            margin-left: 4px;
            color: #3168ec;
          }
        }
      }

      .ant-tree-title {
        flex: 1;
        margin-left: 4px;
      }

      &:hover {
        background-color: transparent;
      }
    }

    :deep(.ant-tree-treenode.ant-tree-treenode-selected) {
      background-color: hsl(from var(--ant-primary-color) h s 95%);
      color: #6a717d;
      // &::before {
      //   color: var(--ant-primary-color);
      //   background: var(--ant-primary-1);
      // }
      .ant-tree-switcher {
        // color: var(--ant-primary-color);
        transition: all 0.3s;
      }

      .ant-tree-iconEle {
        // color: var(--ant-primary-color);
        transition: all 0.3s;
      }

      .ant-tree-node-content-wrapper {
        background-color: transparent;
        color: #6a717d;
      }
    }

    .tree-node {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      word-wrap: break-word;
      word-break: break-all;

      .name {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &:hover {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
