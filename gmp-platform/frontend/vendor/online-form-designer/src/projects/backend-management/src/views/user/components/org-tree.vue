<template>
  <div>
    <a-page-header class="tree-header">
      <template #title>
        <div class="title"> {{ t('sys.org.orgTree') }} </div>
      </template>
      <template #extra>
        <div class="extra-btn">
          <a @click="openOrgModal"><plus-outlined />{{ t('sys.org.addRootOrg') }}</a>
          <a @click="initTree(getOrgListApi)"><redo-outlined /></a>
        </div>
      </template>
    </a-page-header>
    <div class="tree-box">
      <a-tree
        draggable
        block-node
        showIcon
        :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
        v-model:expandedKeys="expandedKeys"
        :selectedKeys="selectedTreeKey"
        :tree-data="treeData"
        @dragenter="onDragEnter"
        @drop="onDrop"
        @select="onTreeSelect"
      >
        <template #icon>
          <span class="iconfont icon-bumen"></span>
        </template>
        <template #title="{ name, id, data }">
          <div class="tree-node">
            <span>{{ name }}</span>
            <span v-if="id == selectedTreeKey">
              <a-dropdown>
                <ellipsis-outlined />
                <template #overlay>
                  <a-menu @click="({ key: menuKey }) => onOrgContextMenuClick(data, menuKey)">
                    <a-menu-item key="addSub">{{ t('sys.org.addChildOrg') }}</a-menu-item>
                    <a-menu-item key="edit">{{ t('sys.edit') }}</a-menu-item>
                    <a-menu-item key="delete">{{ t('sys.delete') }}</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </span>
          </div>
        </template>
      </a-tree>
    </div>
    <org-modal @register="orgRegister" @ok="handleModalOk" />
    <org-delete-modal @register="orgDelRegister" />
  </div>
</template>

<script setup lang="ts">
  import { createVNode, ref, onMounted } from 'vue';
  import {
    PlusOutlined,
    RedoOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined,
  } from '@ant-design/icons-vue';
  import type {
    AntTreeNodeDragEnterEvent,
    AntTreeNodeDropEvent,
    TreeDataItem,
    TreeProps,
  } from 'ant-design-vue/es/tree';
  import OrgModal from './org-modal.vue';
  import OrgDeleteModal from './org-delete-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { Modal } from 'ant-design-vue';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import {
    getOrgListApi,
    addOrgApi,
    updateOrgApi,
    deleteOrgApi,
    dragOrgApi,
  } from '/@backend-management/api/org-user/org';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const {
    setTreeSelect,
    selectedTreeKey,
    initTree,
    treeData,
    addTreeNode,
    updateTreeNode,
    deleteTreeNode,
    dragTreeNode,
  } = useTreeList();
  const expandedKeys = ref<(string | number)[]>([]);
  onMounted(async () => {
    await initTree(getOrgListApi);
    setTreeSelect([treeData.value[0].id], treeData.value[0]);
  });

  const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
    data?.forEach((item, index) => {
      if (item.id === key) {
        return callback(item, index, data);
      }
      if (item.children) {
        return loop(item.children, key, callback);
      }
    });
  };
  const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log(info);
    // expandedKeys 需要展开时
    expandedKeys.value = info.expandedKeys;
  };
  const onDrop = (info: AntTreeNodeDropEvent) => {
    console.log(info);
    const dropKey = info.node.id;
    const dragKey = info.dragNode.id;
    const dropPos = info.node.pos?.split('-') || [];
    // 这里计算的差值 分析了info.dropPosition的含义   dropPosition有3种情况
    // =0 表示拖拽到元素上
    // =1 表示拖拽到元素下面   那么放置元素的时候  应该放到这个位置+1的位置上
    // =-1 表示拖拽到元素上面   那么放置元素的时候 直接放到这个位置即可
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    console.log(dropPosition);

    const data = [...treeData.value];

    // Find dragObject
    // let dragObj: TreeDataItem;
    // loop(data, dragKey, (item: TreeDataItem, index: number, arr: TreeProps['treeData']) => {
    //   arr.splice(index, 1);
    //   dragObj = item;
    // });
    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item: TreeDataItem, index) => {
        console.log('item', item, index);
        dragTreeNode(dragOrgApi, {
          id: dragKey,
          targetParentId: item.id,
          targetSortNum: 0,
        });
        // item.children = item.children || [];
        // /// where to insert 示例添加到头部，可以是随意位置
        // item.children.unshift(dragObj);
      });
    } else {
      // let ar: TreeProps['treeData'] = [];
      // let i = 0;
      loop(data, dropKey, (_item: TreeDataItem, index: number, arr: TreeProps['treeData']) => {
        dragTreeNode(dragOrgApi, {
          id: dragKey,
          targetParentId: _item.parentId,
          targetSortNum: _item.sortNum + 1,
        });
        // console.log('item', arr, index);
        // ar = arr;
        // i = index;
      });
      // if (dropPosition === -1) {
      //   ar.splice(i, 0, dragObj);
      // } else {
      //   ar.splice(i + 1, 0, dragObj);
      // }
    }
    // treeData.value = data;
  };
  const onTreeSelect = (selectIds, { node }) => {
    //不让树取消选中
    if (selectIds.length == 0) {
      return;
    }
    setTreeSelect(selectIds, node);
  };
  const onOrgContextMenuClick = (node, menuKey) => {
    switch (menuKey) {
      case 'addSub':
        openOrgModal(true, {
          parentId: node.id,
        });
        break;
      case 'edit':
        openOrgModal(true, node);
        break;
      case 'delete':
        if (node.children.length) {
          openOrgDelModal(true, {
            id: node.id,
          });
        } else {
          Modal.confirm({
            title: t('sys.sureToDelete'),
            icon: createVNode(ExclamationCircleOutlined),
            okText: t('sys.ok'),
            cancelText: t('sys.cancel'),
            onOk() {
              deleteTreeNode(deleteOrgApi, { ids: node.id });
            },
            onCancel() {
              // console.log('Cancel');
            },
          });
        }
        break;
      default:
        break;
    }
  };

  const [orgRegister, { openModal: openOrgModal }] = useModal();
  const [orgDelRegister, { openModal: openOrgDelModal }] = useModal();

  const handleModalOk = (res) => {
    //如果是编辑
    res.id ? updateTreeNode(updateOrgApi, res) : addTreeNode(addOrgApi, res);
  };
</script>

<style lang="less" scoped>
  .tree-header {
    border-bottom: 1px solid #eaeaea;
    padding: 14px;
    .title {
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
    }
    .extra-btn {
      display: flex;
      line-height: 32px;
      a {
        display: flex;
        align-items: center;
      }
      a:first-child {
        margin-right: 15px;
      }
    }
  }
  .tree-box {
    padding: 20px 16px;
    height: calc(100% - 69px);
    overflow: auto;
    :deep(.ant-tree-treenode-selected):before {
      background: var(--ant-primary-color);
    }
    :deep(.ant-tree-treenode) {
      position: relative;
      &:before {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 4px;
        left: 0;
        transition: background-color 0.3s;
        content: '';
        pointer-events: none;
      }
      &:hover:before {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 4px;
        left: 0;
        transition: background-color 0.3s;
        content: '';
        pointer-events: none;
        background: var(--ant-primary-color);
        color: #fff;
      }
      &:hover {
        .ant-tree-switcher,
        .ant-tree-node-content-wrapper {
          color: #fff;
        }
      }
    }
    :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
      color: #fff;
      background: transparent;
    }
    :deep(.ant-tree-treenode-selected .ant-tree-switcher) {
      color: #fff;
    }
    :deep(.ant-tree-node-content-wrapper) {
      display: flex;
      align-items: center;
      .ant-tree-title {
        flex: 1;
      }
    }
    .tree-node {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    :deep(.ant-tree-node-content-wrapper) {
      &:hover {
        background-color: transparent;
        color: #fff;
      }
    }
  }
</style>
