<template>
  <basic-page>
    <template #header>
      <a-button @click="router.back" v-if="route.params.roleId" type="primary" ghost size="small">{{
        t('sys.back')
      }}</a-button>
    </template>
    <div class="flex flex-col">
      <div class="role-setting__description" :class="route.params.roleId && 'role-setting-pt'">
        <a-descriptions>
          <a-descriptions-item :label="t('sys.nameOfSth', { sth: t('sys.role') })">{{
            roleInfo.name
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.status')">
            <a-switch
              @click="handleStatusChange"
              :checked="roleInfo.enabled"
              :checked-value="1"
              :un-checked-value="0"
              :disabled="!userActions.PermissionSetting"
            />
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.notes')">{{
            roleInfo.description
          }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <div class="section-title">
        {{ t('sys.menu.rolePermissionSetting') }}
      </div>

      <div class="relative z-0 pl-12px pr-12px">
        <BasicTable
          :striped="false"
          :bordered="true"
          :showIndexColumn="false"
          :ellipsis="true"
          :columns="columns"
          :dataSource="menuTree"
          :pagination="false"
          row-key="key"
          :isTreeTable="true"
          @register="register"
        >
          <!-- <template #headerCell="{ column }">
            <template v-if="column.key === 'access'">
              {{ column.customTitle }}
              <a-checkbox
                :checked="rolePermissionMap['MENU.*']"
                :disabled="!userActions.PermissionSetting"
                @change="(e) => handleChecked(e, 'MENU.*')"
              />
            </template>
            <template v-else-if="column.key === 'action'">
              {{ column.customTitle }}
              <a-checkbox
                :checked="rolePermissionMap['POINT.*']"
                :disabled="!userActions.PermissionSetting"
                @change="(e) => handleChecked(e, 'POINT.*')"
              />
            </template>
            <template v-else>
              {{ column.customTitle }}
            </template>
          </template> -->
          <template #bodyCell="{ column, record }">
            <template
              v-if="
                column.key === 'access' &&
                !record.skipAuthAccess &&
                (record.authActions.length ||
                  (!record.authActions.length && !record.children?.length && record.key))
              "
            >
              <a-checkbox
                :checked="rolePermissionMap[record.pKey]"
                @change="(e) => handleChecked(e, record.pKey)"
                :disabled="!userActions.PermissionSetting || rolePermissionMap['MENU.*']"
              />
            </template>
            <template v-if="column.key === 'action'">
              <a-checkbox
                v-if="record.authActions.length > 0"
                :disabled="
                  !userActions.PermissionSetting ||
                  rolePermissionMap['POINT.*'] ||
                  (!rolePermissionMap[record.pKey] && !rolePermissionMap['MENU.*'])
                "
                :checked="rolePermissionMap[`${record.pKey}.*`]"
                @change="(e) => handleChecked(e, `${record.pKey}.*`)"
              >
                {{ t('sys.all') }}
              </a-checkbox>
              <a-checkbox
                :disabled="
                  !userActions.PermissionSetting ||
                  rolePermissionMap['POINT.*'] ||
                  (!rolePermissionMap[record.pKey] && !rolePermissionMap['MENU.*']) ||
                  rolePermissionMap[`${record.pKey}.*`]
                "
                class="role-permission__action-item"
                v-for="item in record.authActions"
                :key="item.key"
                :checked="rolePermissionMap[item.pKey]"
                @change="(e) => handleChecked(e, item.pKey)"
                >{{ t(item.i18nKey) }}</a-checkbox
              >
            </template>
          </template>
        </BasicTable>

        <div v-if="loading" class="absolute z-10 inset-0 cursor-wait"></div>
      </div>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, nextTick, createVNode, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicColumn } from '/@/components/Table/index';
  import { BasicTable, useTable } from '/@/components/Table';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import { useRoleApis, useRolePermissionApis } from '/@/views/permission/hooks/useModule';
  import { useRoute, useRouter } from 'vue-router';
  import type { RoleResponse } from '/@/apis/gct-platform/model';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { isArray } from '/@/utils/is';

  const { getCurrentProject } = usePermissionStoreWithOut();
  const [register, methods] = useTable();
  const { getRoleInfo, putRoleByIdByEnabled } = useRoleApis();
  const { getRolePermissionList, postRolePermissionSingle, postRolePermissionRemove } =
    useRolePermissionApis();
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { hasPermission } = usePermission();

  const loading = ref(false);

  const userActions = computed(() => {
    return {
      PermissionSetting: hasPermission(`OrgPermissionRole.${CustomAction.PermissionSetting}`),
    };
  });

  interface MenuTreeItem {
    key: string;
    name: string;
    children?: MenuTreeItem[];
    authActions?: string[];
  }

  const props = defineProps<{
    roleKey: any;
  }>();

  const menuTree = ref<MenuTreeItem[]>([]);
  let roleId: string = (route.params.roleId as string) || props.roleKey;
  const roleInfo = ref<RoleResponse>({});
  const rolePermissionMap = ref<Record<string, boolean>>({});

  watch(
    () => props.roleKey,
    async () => {
      menuTree.value = [];
      roleInfo.value = {};
      rolePermissionMap.value = {};
      roleId = props.roleKey;
      await nextTick();
      loadRoleInfo();
      loadRolePermissionList();
      loadMenus();
    },
  );

  const loadRoleInfo = async () => {
    if (!roleId) return;
    const res = await getRoleInfo({ id: roleId });
    roleInfo.value = res!;
  };
  loadRoleInfo();
  const loadRolePermissionList = async () => {
    if (!roleId) return;
    const res = await getRolePermissionList({ roleId });
    res!.permissionIds?.forEach((item) => {
      rolePermissionMap.value[item] = true;
    });
  };
  loadRolePermissionList();

  const columns: BasicColumn[] = [
    {
      width: 280,
      title: t('sys.nameOfSth', { sth: t('sys.menuText') }),
      dataIndex: 'title',
      key: 'title',
      align: 'left',
      customRender: ({ text }) => t(text),
    },
    // {
    //   align: 'left',
    //   width: 200,
    //   title: 'key',
    //   dataIndex: 'key',
    // },
    {
      width: 120,
      title: t('sys.auth.access'),
      key: 'access',
    },
    {
      align: 'left',
      title: t('sys.auth.action'),
      key: 'action',
      ellipsis: false,
    },
  ];

  const transformMenu = (menus, parent = '') => {
    return menus
      .filter((item) => item.meta?.hideMenuInAuth !== true)
      .map((item) => {
        return {
          key: item.name,
          pKey: `${parent}.${item.name}`,
          title: item.meta?.title,
          children: item.children && transformMenu(item.children, `${parent}`),
          authActions: (item.meta?.filterAction
            ? (item.meta?.filterAction() ?? [])
            : (item.meta?.authActions ?? [])
          ).map((e) => ({
            key: e,
            pKey: `${parent}.${item.name}.${e}`,
            i18nKey: 'sys.auth.' + `${item.name}.${e}`,
          })),
          skipAuthAccess: item.meta?.skipAuthAccess,
        };
      });
  };

  const loadMenus = async () => {
    const modules =
      getCurrentProject === ProjectName.TENANT_CENTER
        ? import.meta.glob('../../projects/tenant-center/src/router/routes/modules/**/*.ts', {
            import: 'default',
          })
        : import.meta.glob('../../projects/backend-management/src/router/routes/modules/**/*.ts', {
            import: 'default',
          });
    let menus: any[] = [];
    for (const path in modules) {
      const module = await modules[path]();
      if (isArray(module)) {
        const list = module.filter((i) => !i.meta.hideMenu);
        menus = [...menus, ...list];
      } else {
        menus.push(module);
      }
    }

    menus.sort((a, b) => {
      return (a.meta?.orderNo ?? 999999) - (b.meta?.orderNo ?? 999999);
    });
    menuTree.value = transformMenu(
      menus,
      getCurrentProject === ProjectName.TENANT_CENTER ? 'TENANT_CENTER' : 'BACKEND_MANAGEMENT',
    );
    await nextTick();
    methods.expandAll();
  };
  loadMenus();

  const handleStatusChange = () => {
    Modal.confirm({
      title: roleInfo.value.enabled === 1 ? t('sys.sureToDisable') : t('sys.sureToEnable'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        const enabled = roleInfo.value.enabled === 1 ? 0 : 1;
        await putRoleByIdByEnabled({
          id: roleInfo.value.id as string,
          enabled,
        });
        roleInfo.value.enabled = enabled;
        createMessage.success(t('sys.operationSuccess'));
      },
      onCancel() {},
    });
  };

  const handleChecked = async (e, key) => {
    loading.value = true;

    const checked = e.target.checked;

    try {
      if (checked) {
        await postRolePermissionSingle({
          roleId,
          permissionId: key,
        });
      } else {
        await postRolePermissionRemove({
          roleId,
          permissionId: key,
        });
      }

      // 更新本地数据
      rolePermissionMap.value[key] = checked;

      loading.value = false;
    } catch (err) {
      loading.value = false;
    }
  };
</script>

<style lang="less" scoped>
  .role-setting {
    &__description {
      padding: 2px 20px 2px;
      border-bottom: 1px solid #eaeaea;
      &.role-setting-pt {
        padding-top: 22px;
      }
    }
  }

  .section-title {
    font-size: 16px;
    line-height: 20px;
    color: #333;
    display: flex;
    align-items: center;
    padding: 12px 20px;

    &::before {
      content: '';
      display: block;
      height: 14px;
      width: 4px;
      border-radius: 2px;
      background: var(--ant-primary-color);
      margin-right: 8px;
    }
  }

  .role-permission__action-item {
    margin: 0 10px 0 0;
  }
</style>
