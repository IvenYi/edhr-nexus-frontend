<template>
  <div>
    <div class="header-area" v-if="userGroupUsePerms.Insert">
      <a-button type="primary" style="width: 100%" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        {{ t('sys.new') }}
      </a-button>
    </div>
    <div class="search-area">
      <a-input-group>
        <a-row :gutter="6">
          <a-col :span="9">
            <a-select
              v-model:value="formState.searchType"
              style="width: 100%"
              :options="SearchInputOptions"
            />
          </a-col>
          <a-col :span="15">
            <a-input
              v-model:value="formState.searchValue"
              :placeholder="t('sys.inputText')"
              allowClear
            />
          </a-col>
        </a-row>
      </a-input-group>
    </div>
    <div class="tree-box">
      <template v-if="isShowEmpty">
        <a-empty :image="simpleImage" />
      </template>
      <a-tree
        v-else
        :draggable="!formState.searchValue"
        block-node
        showIcon
        :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
        v-model:expandedKeys="expandedKeys"
        :selectedKeys="selectedTreeKey"
        :tree-data="formState.searchValue ? searchTreeOrignalData : treeData"
        @select="onTreeSelect"
        @drop="onDrop"
        @dragenter="onDragEnter"
      >
        <template #icon="props">
          <i class="iconfont icon-file" style="color: #fcc12b"></i>
        </template>
        <template #title="{ name, id, data }">
          <div class="tree-node">
            <span>{{ name }}</span>
            <span
              v-if="
                selectedTreeKey?.includes(id) &&
                (userGroupUsePerms.Insert || userGroupUsePerms.Delete)
              "
            >
              <a-dropdown overlayClassName="user-group-tree-dropdown" @click.stop>
                <ellipsis-outlined />
                <template #overlay>
                  <a-menu @click="({ key }) => handleMenuClick(key, data)" style="width: 102px">
                    <a-menu-item
                      v-if="data.fullPath.split('/').length < 6 && userGroupUsePerms.Insert"
                      class="primary-style"
                      :key="ModalTypeEnum.Create"
                    >
                      {{ t('sys.new') }}
                    </a-menu-item>
                    <a-menu-item
                      class="delete-style"
                      :key="ModalTypeEnum.Delete"
                      v-if="userGroupUsePerms.Delete"
                    >
                      {{ t('sys.component.userCmp.delete') }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </span>
          </div>
        </template>
      </a-tree>
    </div>
    <user-group-modal @register="register" @ok="handleModalOk" />
  </div>
</template>
<script setup lang="ts" name="user-group-tree">
  import { ref, onBeforeMount, watch, reactive, createVNode, unref, computed } from 'vue';
  import { Modal, message, Empty } from 'ant-design-vue';
  import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import useTreeList from '/@backend-management/hooks/useTreeList';

  import UserGroupModal from './modal/user-group-modal.vue';
  import { SearchTypeEnum, ModalTypeEnum, dropNode } from '../constant/interface';
  import { useEmitter } from '../hooks/useEmitter';
  import { useRole } from '../hooks/useRole';
  import {
    postUserGroup,
    getUserGroupList,
    deleteUserGroup,
    postUserGroupDrag,
    getUserGroupInfo,
    putUserGroupById,
    getUserGroupSearch,
  } from '/@/apis/gct-apaas/UserGroupController';

  import type { SelectProps } from 'ant-design-vue';
  import type { AntTreeNodeDropEvent, AntTreeNodeDragEnterEvent } from 'ant-design-vue/es/tree';

  const { t } = useI18n();
  const { userGroupUsePerms } = useRole();

  const SearchInputOptions: SelectProps['options'] = [
    {
      label: t('sys.appDesigner.userGroup'),
      value: SearchTypeEnum.USER_GROUP,
    },
    {
      label: t('sys.appDesigner.member'),
      value: SearchTypeEnum.MEMBER,
    },
    {
      label: t('sys.appDesigner.role'),
      value: SearchTypeEnum.ROLE,
    },
    {
      label: t('sys.appDesigner.model'),
      value: SearchTypeEnum.MODEL,
    },
  ];

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  interface FormState {
    searchType: SearchTypeEnum;
    searchValue: string;
  }

  const formState = reactive<FormState>({
    searchType: SearchTypeEnum.USER_GROUP,
    searchValue: '',
  });

  const expandedKeys = ref<(string | number)[]>([]);

  const { emitter, EmitterEnum } = useEmitter();

  const [register, { openModal }] = useModal();

  const {
    setTreeSelect,
    selectedTreeKey,
    initTree,
    treeData,
    addTreeNode,
    updateTreeNode,
    deleteTreeNode,
    dragTreeNode,
    searchTreeData,
    clearSearchTreeData,
    searchTreeOrignalData,
  } = useTreeList();

  onBeforeMount(async () => {
    await initTree(getUserGroupList);

    emitter.on(EmitterEnum.on_edit_user_group, async (data: any) => {
      const info = await getUserGroupInfo({ id: data.id });
      openModal(true, {
        modalType: ModalTypeEnum.Edit,
        info: {
          id: info?.id,
          parentId: info?.parentId,
          parentName: info?.parentName,
          name: info?.name,
        },
      });
    });

    emitter.on(EmitterEnum.on_delete_user_group, async (data: any) => {
      await deleteTreeNode(deleteUserGroup, { ids: data.ids });
      message.success(t('sys.delSuccess'));
      setTreeSelect([], {});
    });
  });

  watch([() => formState.searchType, () => formState.searchValue], async () => {
    if (formState.searchValue) {
      searchTreeData(getUserGroupSearch, {
        keyword: formState.searchValue,
        type: formState.searchType,
      });
    } else {
      clearSearchTreeData();
    }
  });

  const isShowEmpty = computed(() => {
    const options = formState.searchValue ? searchTreeOrignalData.value : treeData.value;
    return !options.length;
  });

  const onTreeSelect = (selectIds, { node }) => {
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
    await dragTreeNode(postUserGroupDrag, params);
  };

  const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    // expandedKeys 需要展开时
    expandedKeys.value = info.expandedKeys;
  };

  const handleMenuClick = (key, data) => {
    if (key === ModalTypeEnum.Create) {
      openModal(true, {
        modalType: ModalTypeEnum.Create,
        info: {
          parentId: data.id,
          parentName: data.name,
        },
      });
    } else if (key === ModalTypeEnum.Delete) {
      Modal.confirm({
        title: t('sys.sureToDelete'),
        icon: createVNode(ExclamationCircleOutlined),
        okText: t('sys.ok'),
        cancelText: t('sys.cancel'),
        async onOk() {
          await deleteTreeNode(deleteUserGroup, { ids: data.id });
          message.success(t('sys.delSuccess'));
          setTreeSelect([], {});
        },
        onCancel() {},
      });
    }
  };

  const handleCreate = () => {
    openModal(true, {
      modalType: ModalTypeEnum.Create,
    });
  };

  const handleModalOk = async ({ info, isEdit, callback }) => {
    if (isEdit) {
      await updateTreeNode(
        putUserGroupById,
        {
          name: info.name,
        },
        {
          id: info.id,
        },
      );
      message.success(t('sys.developer.appCenter.editSuccess'));
      emitter.emit(EmitterEnum.on_refresh_detail, { id: info.id });
    } else {
      await addTreeNode(postUserGroup, {
        name: info.name,
        parentId: info.parentId,
      });
      message.success(t('sys.createSuccess'));
    }
    typeof callback === 'function' && callback();
  };
</script>
<style scoped lang="less">
  .header-area {
    padding: 14px 14px 10px 14px;
    border-bottom: 1px solid #eaeaea;
  }

  .search-area {
    padding: 10px 14px 10px 10px;
  }

  .tree-box {
    padding: 8px 0;
    height: calc(100% - 53px);
    overflow: auto;

    :deep(.ant-tree-treenode) {
      position: relative;
      padding: 0 16px 4px 12px;
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
        background: rgba(0, 0, 0, 0.04);
      }
    }

    :deep(.ant-tree-switcher) {
      line-height: 40px;
      width: 14px;
    }
    :deep(.ant-tree-switcher .ant-tree-switcher-icon) {
      font-size: 14px;
      vertical-align: middle;
    }

    :deep(.ant-tree-node-content-wrapper) {
      display: flex;
      align-items: center;
      min-height: 40px;
      .ant-tree-title {
        flex: 1;
        margin-left: 4px;
      }
      &:hover {
        background-color: transparent;
      }
    }

    :deep(.ant-tree-treenode.ant-tree-treenode-selected) {
      &::before {
        color: var(--ant-primary-color);
        background: var(--ant-primary-1);
      }
      .ant-tree-switcher {
        color: var(--ant-primary-color);
        transition: all 0.3s;
      }
      .ant-tree-node-content-wrapper {
        color: var(--ant-primary-color);
        background-color: transparent;
      }
    }

    .tree-node {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
<style lang="less">
  .ant-dropdown.user-group-tree-dropdown {
    .ant-dropdown-menu-item {
      // min-width: 120px;
      margin-bottom: 0;
      padding: 6px 12px;
      transition: all 0.3s;
      font-size: 14px;
      line-height: 22px;
      cursor: pointer;

      &:hover {
        background-color: rgb(0 0 0 / 8%);
      }

      &.primary-style {
        // color: rgb(13 170 156);

        &:hover {
          // background: rgb(13 170 156 / 10%);
        }
      }

      &.delete-style {
        // color: #ff4d4f;

        &:hover {
          // background: rgb(255 77 79 / 15%);
        }
      }
    }
  }
</style>
