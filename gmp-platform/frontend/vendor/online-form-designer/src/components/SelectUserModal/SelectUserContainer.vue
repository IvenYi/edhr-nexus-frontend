<template>
  <a-modal
    v-model:visible="visible"
    width="800px"
    wrapClassName="select-user-modal-wrapper"
    :class="{ isFullScreen }"
    :mask-closable="false"
    destroyOnClose
    :keyboard="false"
    v-bind="props.options"
    :cancelText="t('sys.cancel')"
    :okText="t('sys.ok')"
    @cancel="handleClose"
    @ok="handleOk"
  >
    <div class="select-user-modal-full-screen" @click="onFullScreen">
      <i :class="['iconfont', isFullScreen ? 'icon-tuichuquanping' : 'icon-quanping']"></i>
    </div>
    <div class="select-user-modal-container">
      <div class="waiting-area-container">
        <div class="waiting-area-wait-content">
          <div class="title">{{ $t('sys.pageDesigner.ToBeSelect') }}</div>
          <a-tabs v-model:activeKey="activeKey" class="waiting-area-tabs">
            <a-tab-pane key="User" :tab="$t('sys.user')" v-if="baseProps.showTabs.includes('User')">
              <User
                :treeData="orgTreeData"
                :rootIds="rootOrgIds"
                :multiple="baseProps.multiple"
                :hidden-keys="baseProps.hiddenKeys"
                :readonly="baseProps.readonly"
                v-model:select-users="selectMap.users"
              />
            </a-tab-pane>
            <a-tab-pane
              key="Org"
              :tab="$t('sys.pageDesigner.dept')"
              v-if="baseProps.showTabs.includes('Org')"
            >
              <Org
                :treeData="orgTreeData"
                v-model:select-orgs="selectMap.orgs"
                :readonly="baseProps.readonly"
              />
            </a-tab-pane>
            <a-tab-pane key="Role" :tab="$t('sys.role')" v-if="baseProps.showTabs.includes('Role')">
              <Role
                :roleData="roleData"
                v-model:select-roles="selectMap.roles"
                :readonly="baseProps.readonly"
              />
            </a-tab-pane>
            <a-tab-pane
              key="UserGroup"
              :tab="$t('sys.userGroup')"
              v-if="baseProps.showTabs.includes('UserGroup')"
            >
              <UserGroup
                :treeData="userGroupTreeData"
                :rootOrgIds="rootUserGroupIds"
                :readonly="baseProps.readonly"
                v-model:select-ug="selectMap.userGroups"
              />
            </a-tab-pane>
            <a-tab-pane
              key="Dynamic"
              :tab="$t('sys.pageDesigner.dynamic')"
              v-if="baseProps.showTabs.includes('Dynamic')"
            >
              <Dynamic
                :field-map="fieldMap"
                :treeData="orgTreeData"
                :readonly="baseProps.readonly"
                v-model:select-dyn="selectMap.dynamics"
              />
            </a-tab-pane>
          </a-tabs>
        </div>
        <div
          class="waiting-area-extra"
          v-if="
            baseProps.showTabs.includes('User') && visibleUserData && visibleUserData.length !== 0
          "
        >
          <div class="title">{{ $t('sys.org.visiblePersonnel') }}</div>
          <ExtraUser
            :useData="visibleUserData"
            :multiple="baseProps.multiple"
            :readonly="baseProps.readonly"
            v-model:select-users="selectMap.users"
          />
        </div>
      </div>
      <div class="selected-area-container ml-16px">
        <div class="title">
          <span
            >{{ $t('sys.selected') }}<em v-if="selectLength">{{ selectLength }}</em></span
          >
          <span v-if="!baseProps.readonly" class="delete-all" @click="onDeleteAll">{{
            $t('sys.pageDesigner.deleteAll')
          }}</span>
        </div>

        <select-area
          :select-map="selectMap"
          :readonly="baseProps.readonly"
          @update-select-value="handleUpdateSelectValue"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts" name="SelectUserContainer">
  import { ref, reactive, onBeforeMount, computed } from 'vue';
  import { cloneDeep, pick } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    list2Tree,
    filterDynFormatTypes,
    DynFormatTypes,
    dynamicData,
    DYN_FORMAT_TYPE_ENUM,
    findUniqueNode,
  } from './utils/index';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import User from './component/user.vue';
  import Org from './component/org.vue';
  import Role from './component/role.vue';
  import UserGroup from './component/user-group.vue';
  import Dynamic from './component/dynamic.vue';
  import ExtraUser from './component/extra-user.vue';
  import SelectArea from './component/select-area.vue';
  import {
    getDesignerCommonGetCanBeUsedOrg,
    getDesignerCommonGetVisibleOrg,
    getDesignerCommonGetVisibleUser,
  } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';

  import type { ModalProps } from 'ant-design-vue';
  import { SceneType, useController } from './controller';
  import { OrgDTO, UserDTO } from './type';

  const { t } = useI18n();

  const defaultSelect: any = {
    users: [],
    orgs: [],
    roles: [],
    userGroups: [],
    dynamics: [],
  };

  const props = defineProps<{
    baseProps: {
      /** 模型key */
      modelKey: string;
      /** 勾选的内容 */
      selectValues: string[];
      showTabs: string[];
      multiple: boolean;
      sceneType?: SceneType;
      /** 需要额外隐藏的id集合 */
      hiddenKeys?: string[];
      readonly?: boolean;
    };
    options?: ModalProps;
    callback?: any;
  }>();

  const visible = ref<boolean>(true);
  const isFullScreen = ref<boolean>(false);
  const activeKey = ref(props.baseProps.showTabs[0]);

  const orgData = ref<OrgDTO[]>([]);
  const visibleUserData = ref<UserDTO[]>([]);
  const roleData = ref<any[]>([]);
  const userGroupData = ref<any[]>([]);
  const fieldMap = ref({});

  const selectMap = reactive(cloneDeep(defaultSelect));

  const selectLength = computed(() => {
    return Object.values(selectMap)
      .flat()
      .map((item: any) => item.formatId)
      .filter((formatId) => !filterDynFormatTypes.includes(formatId)).length;
  });

  onBeforeMount(async () => {
    await getOrgData();
    await getVisibleUserData();
    await getRoleData();
    await getUserGroupData();
    await getModelFieldsData();

    if (props.baseProps.selectValues && Array.isArray(props.baseProps.selectValues)) {
      const selected = props.baseProps.selectValues;
      const userFormatIds = selected.filter((e) => e.includes('USER:'));
      userFormatIds.length &&
        getUserInfo(
          userFormatIds.map((e) => e.replace(/USER:/, '')),
          userFormatIds,
        );
      selectMap.orgs = getSelectInfo(
        selected.filter((e) => e.includes('ORG:')),
        orgData.value,
      );
      selectMap.roles = getSelectInfo(
        selected.filter((e) => e.includes('ROLE:')),
        roleData.value,
      );
      selectMap.userGroups = getSelectInfo(
        selected.filter((e) => e.includes('USER_GROUP:')),
        userGroupData.value,
      );

      selectMap.dynamics = getDynSelectInfo(
        selected.filter((formatId) => DynFormatTypes.some((item) => formatId.includes(`${item}:`))),
      );
    }
  });

  useController({
    sceneType: props.baseProps.sceneType,
    orgData,
  });

  function getSelectInfo(ids, list) {
    return ids
      .map((id) => {
        const info = list.find((item) => item.formatId === id);
        if (info) {
          return pick(info, ['formatId', 'id', 'fullname', 'name']);
        }
        return null;
      })
      .filter((i) => i);
  }

  function getDynSelectInfo(ids) {
    const basic = dynamicData
      .filter((item) => {
        return ids.some((id) => id.includes(`${item.formatId}:`));
      })
      .map((item) => {
        return {
          id: item.id,
          name: item.name,
          formatId: `${item.formatId}:current`,
        };
      });

    const getFieldInfo = (type, fieldTypes, id) => {
      return fieldTypes
        .flatMap((fieldType) => fieldMap.value?.[fieldType] ?? [])
        .find((item) => `${type}:${item.key}` === id);
    };

    return [
      ...basic,
      ...ids
        .filter((id) => !filterDynFormatTypes.includes(id))
        .map((id) => {
          switch (true) {
            case id.includes(`${DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS}:`): {
              const info = getFieldInfo(
                DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS,
                [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI],
                id,
              );
              return info
                ? {
                    id: info.key,
                    name: info.name,
                    formatId: `${DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS}:${info.key}`,
                  }
                : null;
            }
            case id.includes(`${DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER}:`): {
              const info = getFieldInfo(
                DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER,
                [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI],
                id,
              );
              return info ? { id: info.key, name: info.name, formatId: id } : null;
            }
            case id.includes(`${DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL}:`): {
              const info = getFieldInfo(
                DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL,
                [FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI],
                id,
              );
              return info ? { id: info.key, name: info.name, formatId: id } : null;
            }
            case id.includes(`${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:`): {
              const nodeId = id.replace(`${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:`, '');
              const node = findUniqueNode(orgTreeData.value, nodeId);
              return node ? { id: node.id, name: node.name, formatId: id } : null;
            }
            default:
              return null;
          }
        })
        .filter(Boolean),
    ];
  }

  /** 查询应用可见范围-部门 */
  async function getOrgData() {
    const data = (await getDesignerCommonGetVisibleOrg()) ?? [];
    orgData.value = data.map((e) => {
      return { ...e, formatId: `ORG:${e.id}` };
    });
  }

  /** 获取应用可见用户 */
  async function getVisibleUserData() {
    const data = (await getDesignerCommonGetVisibleUser()) ?? [];

    visibleUserData.value = data.map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });
  }

  /** 获取所有的角色 */
  async function getRoleData() {
    roleData.value = ((await getRoleList()) ?? []).map((e) => {
      return {
        ...e,
        formatId: `ROLE:${e.id}`,
      };
    });
  }

  /** 获取所有的用户组 */
  async function getUserGroupData() {
    userGroupData.value = ((await getUserGroupList()) ?? []).map((e) => {
      return { ...e, formatId: `USER_GROUP:${e.id}` };
    });
  }

  const getUserInfo = async (ids, userFormatIds) => {
    const list = (
      (await getOrgUserPickerTenantManagementUserListByIds({ ids: ids.join(',') })) ?? []
    ).map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });

    selectMap.users = getSelectInfo(userFormatIds, list);
  };

  /** 获取字段列表 */
  async function getModelFieldsData() {
    if (!props.baseProps.modelKey) {
      return;
    }
    const res = await getFieldMetaList({
      modelKey: props.baseProps.modelKey,
    });

    if (res) {
      fieldMap.value = res
        .filter((item) => {
          return (
            item.type === FIELD_TYPE.USER ||
            item.type === FIELD_TYPE.ORG ||
            item.type === FIELD_TYPE.USER_MULTI ||
            item.type === FIELD_TYPE.ORG_MULTI
          );
        })
        .reduce((acc, item) => {
          if (!acc[item.type!]) {
            acc[item.type!] = [];
          }
          acc[item.type!].push(item);

          return acc;
        }, {});
    }
  }

  // 部门转成树结构
  const orgTreeData = computed(() => {
    return list2Tree(orgData.value);
  });

  const userGroupTreeData = computed(() => {
    return list2Tree(userGroupData.value);
  });

  const rootOrgIds = computed(() => {
    return orgTreeData.value.map((item) => item.id);
  });

  const rootUserGroupIds = computed(() => {
    return userGroupTreeData.value.map((item) => item.id);
  });

  function handleUpdateSelectValue(key, item) {
    selectMap[key] = selectMap[key].filter((f) => f.formatId !== item.formatId);
  }

  const onFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
  };

  function onDeleteAll() {
    Object.assign(selectMap, cloneDeep(defaultSelect));
  }

  function handleOk() {
    const ids = Object.values(selectMap)
      .flat()
      .map((item: any) => item.formatId)
      .filter((formatId) => !filterDynFormatTypes.includes(formatId));
    const cloneSelectMap = cloneDeep(selectMap);

    handleClose();
    props?.callback(ids, cloneSelectMap);
  }

  function handleClose() {
    visible.value = false;
    isFullScreen.value = false;
    activeKey.value = '1';
    orgData.value = [];
    roleData.value = [];
    userGroupData.value = [];
    fieldMap.value = {};
    Object.assign(selectMap, cloneDeep(defaultSelect));
  }
</script>

<style lang="less" scoped>
  .select-user-modal-full-screen {
    position: absolute;
    top: 0;
    right: 48px;
    padding: 16px 8px;
    color: #212528;
    font-size: 16px;
    line-height: 1;
    line-height: 22px;
    cursor: pointer;
  }
</style>

<style lang="less">
  .select-user-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      max-height: 80vh;

      > .ant-modal-close {
        > .ant-modal-close-x {
          width: auto;
          height: auto;
          padding: 16px;
          color: #212528;
          line-height: 1;
          line-height: 22px;
        }
      }

      > .ant-modal-header,
      > .ant-modal-footer {
        flex-shrink: 0;
        padding: 16px;
      }

      > .ant-modal-header {
        border-bottom: 1px solid #e0e3ea;
      }

      > .ant-modal-footer {
        padding: 12px 16px;
        border-top: 1px solid #e0e3ea;
        background-color: #fff;
      }

      > .ant-modal-header .ant-modal-title {
        color: #000;
        font-weight: 600;
      }

      > .ant-modal-body {
        display: flex;
        flex-grow: 1;
        min-height: 600px;
        padding: 0;
        overflow: auto;
        background-color: #fff;

        .select-user-modal-container {
          display: flex;
          flex: 1;
          width: 100%;
          padding: 30px;

          .waiting-area-container,
          .selected-area-container {
            display: flex;
            position: relative;
            flex: 0.3961;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            border: 1px solid #e8ebf0;
            border-radius: 4px;
          }

          .waiting-area-container {
            flex: 0.6039;

            .waiting-area-wait-content,
            .waiting-area-extra {
              display: flex;
              position: relative;
              flex: 1;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
            }

            .waiting-area-wait-content {
              flex: 2.5;
            }
          }

          .title {
            display: flex;
            position: relative;
            justify-content: space-between;
            padding: 12px 20px;
            background: #f2f4f7;
            color: #212528;
            font-weight: 500;
            line-height: 20px;

            &::before {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 1px;
              background-color: #e0e3ea;
            }

            > span {
              display: inline-block;
              line-height: 20px;

              > em {
                margin-left: 4px;
                color: #8f8f8f;
                font-style: normal;
                font-weight: 400;
              }

              &.delete-all {
                color: #da1717;
                font-weight: 400;
                cursor: pointer;
              }
            }
          }

          .ant-tabs.waiting-area-tabs {
            width: 100%;
            height: 100%;

            .ant-tabs-nav {
              margin: 0;

              &::before {
                border-color: #e0e3ea;
              }

              .ant-tabs-nav-wrap {
                margin-left: 12px;

                .ant-tabs-tab {
                  padding: 12px 16px;
                  line-height: 20px;

                  & + .ant-tabs-tab {
                    margin: 0 0 0 24px;
                  }
                }
              }
            }

            .ant-tabs-content {
              height: 100%;
            }
          }
        }
      }
    }

    .isFullScreen {
      top: 0;
      width: 100vw !important;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;

      .ant-modal-content {
        display: flex;
        flex-direction: column;
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;
      }
    }
  }
</style>
