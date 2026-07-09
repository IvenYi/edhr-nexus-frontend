<template>
  <div v-if="showDetailContainer === 'DETAIL'">
    <div class="basic-info-wrap">
      <div class="basic-info">
        <a-descriptions
          :column="4"
          size="small"
          :labelStyle="{ color: '#333', lineHeight: '32px' }"
          :contentStyle="{ color: '#333', lineHeight: '32px' }"
        >
          <a-descriptions-item :label="t('sys.appDesigner.userGroupName')">{{
            detail?.name
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.appDesigner.needUserGroup')">{{
            detail?.parentName ?? '-'
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.appDesigner.createTime')">{{
            detail?.createTime
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.appDesigner.createUser')">
            {{ detail?.createUserName }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="btn-action">
        <template v-for="(btn, index) of detailButton">
          <a-button
            :key="btn.key"
            v-bind="btn.style"
            :class="index !== 0 ? 'ml-8px' : ''"
            @click="() => handleBtnClick(btn)"
            v-if="btn.isShow"
          >
            <template #icon>
              <i :class="['iconfont', btn.icon ?? '']"></i>
            </template>
            {{ btn.name }}
          </a-button>
        </template>
      </div>
    </div>
    <item-container
      :title="t('sys.appDesigner.member')"
      :type="RelationTypeEnum.USER"
      @notify="handleAdd"
    >
      <template #item-area>
        <div class="item-container-area">
          <template v-if="memberList.length">
            <a-tag
              class="tag-item"
              v-for="tag of memberList"
              :key="tag.id"
              :bordered="false"
              :closable="userGroupUsePerms.Delete"
              @close="() => handleDelete(tag)"
            >
              <template #icon>
                <i
                  :class="['iconfont', memberIcon[tag.relationType ?? ''].icon]"
                  :style="{ color: memberIcon[tag.relationType ?? ''].color }"
                ></i>
              </template>
              {{ tag.relationName }}
            </a-tag>
          </template>
          <template v-else>
            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </div>
      </template>
    </item-container>
    <item-container
      :title="t('sys.appDesigner.authority')"
      :subtitle="t('sys.appDesigner.role')"
      :type="RelationTypeEnum.ROLE"
      @notify="handleAdd"
    >
      <template #item-area>
        <div class="item-container-area">
          <template v-if="roleList?.length">
            <a-tag
              class="tag-item"
              v-for="role of roleList"
              :key="role.id"
              :bordered="false"
              :closable="userGroupUsePerms.Delete"
              @close="() => handleDelete(role)"
            >
              <template #icon>
                <i
                  :class="['iconfont', memberIcon[role.relationType ?? ''].icon]"
                  :style="{ color: memberIcon[role.relationType ?? ''].color }"
                ></i>
              </template>
              {{ role.relationName }}
            </a-tag>
          </template>
          <template v-else>
            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </div>
      </template>
    </item-container>
    <item-container
      v-if="inEDHRApp"
      :title="t('sys.appDesigner.dataAuthority')"
      :subtitle="t('sys.appDesigner.builtinConditionalModel')"
      :type="RelationTypeEnum.BUILT_CONDITION_MODEL"
      @notify="handleAdd"
    >
      <template #item-area>
        <div class="item-container-area">
          <template v-if="builtinDataRoleList?.length">
            <a-tag
              class="tag-item"
              v-for="tag of builtinDataRoleList"
              :key="tag.id"
              :bordered="false"
              closable
            >
              <template #closeIcon>
                <div class="btn-action">
                  <a-tooltip placement="top">
                    <template #title>
                      <span>{{ t('sys.appDesigner.setting') }}</span>
                    </template>
                    <i
                      class="iconfont icon-shezhi"
                      @click="() => handleAdd(BUILT_BUTTON_KEY, tag)"
                    ></i>
                  </a-tooltip>
                  <a-tooltip placement="top">
                    <template #title>
                      <span>{{ t('sys.appDesigner.delete') }}</span>
                    </template>
                    <i
                      class="iconfont icon-shanchu"
                      v-if="userGroupUsePerms.Delete"
                      @click="() => handleDelete(tag)"
                    ></i>
                  </a-tooltip>
                </div>
              </template>
              {{ tag.description }}
            </a-tag>
          </template>
          <template v-else>
            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </div>
      </template>
    </item-container>
    <item-container
      v-else
      :title="t('sys.appDesigner.dataAuthority')"
      subtitle=""
      :type="RelationTypeEnum.ENTITY_MODEL_DATA"
      @notify="handleAdd"
    >
      <template #item-area>
        <div class="item-container-area">
          <template v-if="dataRoleList?.length || permScopeRoleList?.length">
            <template v-if="dataRoleList?.length">
              <div class="entity-tag-item-container mb-20px">
                <p>{{ t('sys.appDesigner.physicalBusinessModel') }}</p>
                <a-tag
                  class="tag-item"
                  v-for="tag of dataRoleList"
                  :key="tag.id"
                  :bordered="false"
                  closable
                >
                  <template #closeIcon>
                    <div class="btn-action">
                      <a-tooltip placement="top">
                        <template #title>
                          <span>{{ t('sys.appDesigner.setting') }}</span>
                        </template>
                        <i
                          class="iconfont icon-shezhi"
                          @click="() => handleAdd(ENTITY_BUTTON_KEY, tag)"
                        ></i>
                      </a-tooltip>
                      <a-tooltip placement="top">
                        <template #title>
                          <span>{{ t('sys.appDesigner.delete') }}</span>
                        </template>
                        <i
                          class="iconfont icon-shanchu"
                          v-if="userGroupUsePerms.Delete"
                          @click="() => handleDelete(tag)"
                        ></i>
                      </a-tooltip>
                    </div>
                  </template>
                  {{ tag.relationName }}
                </a-tag>
              </div>
            </template>
            <template v-if="permScopeRoleList?.length">
              <div class="prem-tag-item-container">
                <p>{{ t('sys.appDesigner.permissionScope') }}</p>
                <a-tag
                  class="tag-item"
                  v-for="tag of permScopeRoleList"
                  :key="tag.id"
                  :bordered="false"
                  closable
                >
                  <template #closeIcon>
                    <div class="btn-action">
                      <a-tooltip placement="top">
                        <template #title>
                          <span>{{ t('sys.appDesigner.setting') }}</span>
                        </template>
                        <i
                          class="iconfont icon-shezhi"
                          @click="() => handleAdd(PERMISSION_SCOPE_BUTTON_KEY, tag)"
                        ></i>
                      </a-tooltip>
                      <a-tooltip placement="top">
                        <template #title>
                          <span>{{ t('sys.appDesigner.delete') }}</span>
                        </template>
                        <i
                          class="iconfont icon-shanchu"
                          v-if="userGroupUsePerms.Delete"
                          @click="() => handleDelete(tag)"
                        ></i>
                      </a-tooltip>
                    </div>
                  </template>
                  {{ tag.description }}
                </a-tag>
              </div>
            </template>
          </template>
          <template v-else>
            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </div>
      </template>
    </item-container>
    <add-role-modal @register="addRoleRegister" @refresh="onRefresh" />
    <add-data-role-modal @register="addDataRoleRegister" @refresh="onRefresh" />
    <data-role-setting-modal @register="dataRoleSettingRegister" @refresh="onRefresh" />
  </div>
  <div class="empty-area" v-else-if="showDetailContainer === 'EMPTY'">
    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
  </div>
</template>
<script setup lang="ts" name="user-group-container">
  import { ref, onBeforeMount, toRaw, unref, watch, computed, onUnmounted, createVNode } from 'vue';
  import { message, Empty, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { useModal } from '/@/components/Modal';
  import { useModalPicker, PickType } from '/@/components/UserPick';
  import ItemContainer from './item-container.vue';
  import { ModalTypeEnum, RelationTypeEnum } from '../../constant/interface';
  import { useEmitter } from '../../hooks/useEmitter';
  import AddRoleModal from '../modal/add-role-modal.vue';
  import AddDataRoleModal from '../modal/add-data-role-modal.vue';
  import DataRoleSettingModal from '../modal/data-role-setting/data-role-setting-modal.vue';
  import { isEmpty } from 'lodash-es';
  import { useRole } from '../../hooks/useRole';

  import { getUserGroupInfo, deleteUserGroup } from '/@/apis/gct-apaas/UserGroupController';
  import {
    postUserGroupRelationBatch,
    deleteUserGroupRelation,
  } from '/@/apis/gct-apaas/UserGroupRelationController';
  import type { UserGroupResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const ENTITY_BUTTON_KEY = 'SETTING_ENTITY_MODEL_DATA';
  const BUILT_BUTTON_KEY = 'SETTING_BUILT_CONDITION_MODEL';
  const PERMISSION_SCOPE_BUTTON_KEY = 'SETTING_PERMISSION_SCOPE_MODEL';

  const { userGroupUsePerms, inEDHRApp } = useRole();

  const detailButton = [
    {
      key: ModalTypeEnum.Edit,
      name: t('sys.component.userCmp.edit'),
      icon: 'icon-a-Single-linetext',
      style: {
        type: 'primary',
        ghost: true,
      },
      isShow: userGroupUsePerms.value.Update,
    },
    {
      key: ModalTypeEnum.Delete,
      name: t('sys.component.userCmp.delete'),
      icon: 'icon-shanchu',
      style: {
        type: 'primary',
        danger: true,
        ghost: true,
        class: 'error',
      },
      isShow: userGroupUsePerms.value.Delete,
      tips: t('sys.pageDesigner.areYouSureToDelete'),
    },
  ];

  const memberIcon = {
    [RelationTypeEnum.ORG]: {
      icon: 'icon-file',
      color: '#fcc12b',
    },
    [RelationTypeEnum.USER]: {
      icon: 'icon-a-Accountnumber',
      color: '#bfbfbf',
    },
    [RelationTypeEnum.ROLE]: {
      icon: 'icon-a-Accountnumber',
      color: '#bfbfbf',
    },
  };

  const { emitter, EmitterEnum } = useEmitter();

  const { selectTreeNode, restTree } = useTreeList();

  const [addRoleRegister, { openModal: openAddRoleModal }] = useModal();
  const [addDataRoleRegister, { openModal: openAddDataRoleModal }] = useModal();
  const [dataRoleSettingRegister, { openModal: openDataRoleSettingModal }] = useModal();
  const { openPicker } = useModalPicker({ type: PickType.ViSIBLE });

  const detail = ref<UserGroupResponse>();

  onBeforeMount(async () => {
    emitter.on(EmitterEnum.on_refresh_detail, (data: any) => {
      onRefresh();
    });
  });

  onUnmounted(() => {
    restTree();
  });

  watch(
    () => selectTreeNode.node,
    (value) => {
      if (!isEmpty(value)) {
        requestUserGroupInfo();
      }
    },
    { deep: true },
  );

  const showDetailContainer = computed(() => {
    if (selectTreeNode.node.id) {
      return 'DETAIL';
    }
    return 'EMPTY';
  });

  const orgList = computed(() =>
    detail.value?.userGroupRelations?.filter((item) => RelationTypeEnum.ORG === item.relationType),
  );

  const userList = computed(() =>
    detail.value?.userGroupRelations?.filter((item) => RelationTypeEnum.USER === item.relationType),
  );

  const dataRoleList = computed(() =>
    detail.value?.userGroupRelations?.filter(
      (item) => RelationTypeEnum.ENTITY_MODEL_DATA === item.relationType,
    ),
  );

  const builtinDataRoleList = computed(() =>
    detail.value?.userGroupRelations?.filter(
      (item) => RelationTypeEnum.BUILT_CONDITION_MODEL === item.relationType,
    ),
  );

  const permScopeRoleList = computed(() =>
    detail.value?.userGroupRelations?.filter(
      (item) => RelationTypeEnum.PERMISSION_SCOPE === item.relationType,
    ),
  );

  const memberList = computed(() => {
    return [...unref(orgList.value ?? []), ...unref(userList.value ?? [])];
  });

  const roleList = computed(() =>
    detail.value?.userGroupRelations?.filter((item) => RelationTypeEnum.ROLE === item.relationType),
  );

  async function requestUserGroupInfo() {
    detail.value = await getUserGroupInfo({ id: selectTreeNode.node.id });
  }

  const handleBtnClick = (btnInfo) => {
    if (btnInfo && btnInfo.key) {
      if (btnInfo?.tips) {
        Modal.confirm({
          title: btnInfo?.tips,
          icon: createVNode(ExclamationCircleOutlined),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          onOk() {
            handleNotify(toRaw(btnInfo));
          },
          onCancel() {},
        });
      } else {
        handleNotify(toRaw(btnInfo));
      }
    }
  };

  const handleNotify = (params) => {
    if (params.key === ModalTypeEnum.Edit) {
      emitter.emit(EmitterEnum.on_edit_user_group, { id: detail.value?.id });
    } else if (params.key === ModalTypeEnum.Delete) {
      emitter.emit(EmitterEnum.on_delete_user_group, { ids: detail.value?.id });
    }
  };

  const handleAdd = (type, info?) => {
    if (type === RelationTypeEnum.USER) {
      openPicker({
        userIds: userList.value?.map((item) => item.relationId ?? '') ?? [],
        deptIds: orgList.value?.map((item) => item.relationId ?? '') ?? [],
        callback: async (value) => {
          const { deptIds, userIds } = value;
          const userArr = userIds.map((item) => {
            return {
              relationId: item,
              relationType: RelationTypeEnum.USER,
              userGroupId: selectTreeNode.node.id,
            };
          });
          const deptArr = deptIds.map((item) => {
            return {
              relationId: item,
              relationType: RelationTypeEnum.ORG,
              userGroupId: selectTreeNode.node.id,
            };
          });

          await postUserGroupRelationBatch({
            relations: [...userArr, ...deptArr],
          });
          message.success(t('sys.appDesigner.addSuccess'));
          onRefresh();
        },
      });
    } else if (type === RelationTypeEnum.ROLE) {
      openAddRoleModal(true, {
        userGroupId: selectTreeNode.node.id,
        selectRoleIds: roleList.value?.map((item) => item.relationId),
      });
    } else if (type === RelationTypeEnum.ENTITY_MODEL_DATA) {
      openAddDataRoleModal(true, {
        userGroupId: selectTreeNode.node.id,
        selectModelIds: dataRoleList.value?.map((item) => item.relationId),
        type,
      });
    } else if (type === RelationTypeEnum.BUILT_CONDITION_MODEL) {
      openAddDataRoleModal(true, {
        userGroupId: selectTreeNode.node.id,
        selectModelIds: dataRoleList.value?.map((item) => item.relationId),
        type,
      });
    } else if (type === 'SETTING_ENTITY_MODEL_DATA') {
      openDataRoleSettingModal(true, {
        userGroupId: selectTreeNode.node.id,
        relationId: info.relationId,
        id: info.id,
        detail: info,
        relationType: RelationTypeEnum.ENTITY_MODEL_DATA,
      });
    } else if (type === 'SETTING_BUILT_CONDITION_MODEL') {
      openDataRoleSettingModal(true, {
        userGroupId: selectTreeNode.node.id,
        relationId: info.relationId,
        id: info.id,
        detail: info,
        relationType: RelationTypeEnum.BUILT_CONDITION_MODEL,
      });
    } else if (type === 'SETTING_PERMISSION_SCOPE_MODEL') {
      openDataRoleSettingModal(true, {
        userGroupId: selectTreeNode.node.id,
        relationId: info.relationId,
        id: info.id,
        detail: info,
        relationType: RelationTypeEnum.PERMISSION_SCOPE,
      });
    }
  };

  const handleDelete = async (info) => {
    Modal.confirm({
      title: t('sys.pageDesigner.areYouSureToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await deleteUserGroupRelation({
          ids: info.id,
        });
        message.success(t('sys.appDesigner.deleteSuccess'));
        onRefresh();
      },
      onCancel() {},
    });
  };

  const onRefresh = () => {
    requestUserGroupInfo();
  };
</script>
<style lang="less" scoped>
  .basic-info-wrap {
    display: flex;
    position: relative;
    margin-bottom: 6px;
    padding: 16px 16px 16px 20px;
    background-color: #fff;

    .btn-action {
      display: flex;

      :deep(.ant-btn) {
        .iconfont {
          margin-right: 4px;
          font-size: 14px;
        }
      }
    }
  }

  .basic-info :deep(.ant-descriptions-item) {
    padding-bottom: 0;
  }

  .empty-area {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }

  .item-container-area {
    p {
      margin-bottom: 8px;
      color: #333;
    }
    :deep(.tag-item) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      background: #fff;
      color: #333;
      font-size: 14px;
      line-height: 18px;

      > .iconfont + span,
      > span + .anticon {
        margin-left: 4px;
      }

      .ant-tag-close-icon {
        margin-left: 4px;
        color: #96a0b5;
        font-size: 12px;
      }

      .btn-action {
        height: 18px;
        line-height: 18px;

        .iconfont + .iconfont {
          margin-left: 8px;
        }

        .icon-shezhi:hover {
          color: var(--ant-primary-color);
        }

        .icon-shanchu:hover {
          color: #ff4d4f;
        }
      }
    }
  }
</style>
