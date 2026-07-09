<template>
  <div class="section-title">
    {{ t('sys.menu.rolePermissionSetting') }}
  </div>
  <div ref="tableContainerRef" class="pl-12px pr-12px flex-1" >
    <basic-table
      :striped="false"
      :bordered="false"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :dataSource="menuTree"
      :pagination="false"
      row-key="id"
      :isTreeTable="true"
      :scroll="{ y: scrollHeight, }"
      @register="register"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'access'">
          <a-checkbox
            :checked="rolePermissionMap['MENU.*']"
            :disabled="!userActions.PermissionSetting"
            @change="(e) => handleChecked(e, 'MENU.*', 'MENU')"
          />
          {{ column.customTitle }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-checkbox
            :checked="rolePermissionMap['POINT.*']"
            :disabled="disabledPointCheckAll"
            @change="(e) => handleChecked(e, 'POINT.*', 'POINT')"
          />
          {{ column.customTitle }}
        </template>
        <template v-else>
          {{ column.customTitle }}
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'access' && record.type !== 'CATALOG'">
          <a-checkbox
            v-model:checked="rolePermissionMap[record.linkPage]"
            @change="(e) => handleChecked(e, record.linkPage, 'MENU')"
            :disabled="
              !userActions.PermissionSetting ||
              rolePermissionMap['MENU.*'] ||
              (record.type === 'PERMISSION' && !rolePermissionMap[record.parentLinkPage])
            "
          />
        </template>
        <template
          v-if="column.key === 'action' && ['STANDARD', 'PERMISSION'].includes(record.type)"
        >
          <a-checkbox
            v-if="record.permissionList && record.permissionList.length"
            v-model:checked="rolePermissionMap[`${record.linkPage}.*`]"
            :disabled="
              !userActions.PermissionSetting ||
              rolePermissionMap['POINT.*'] ||
              (!rolePermissionMap[record.linkPage] && !rolePermissionMap['MENU.*'])
            "
            @change="(e) => handleChecked(e, `${record.linkPage}.*`, 'POINT')"
          >
            {{ t('sys.all') }}
          </a-checkbox>
          <a-checkbox
            class="role-permission__action-item"
            v-for="item in record.permissionList"
            :disabled="
              rolePermissionMap[`${record.linkPage}.*`] ||
              !userActions.PermissionSetting ||
              !rolePermissionMap[record.linkPage]
            "
            :key="item.key"
            v-model:checked="rolePermissionMap[item.key]"
            @change="(e) => handleChecked(e, item.key, 'POINT')"
          >
            {{ item.name }}
          </a-checkbox>
        </template>
      </template>
    </basic-table>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, nextTick } from 'vue';
  import {
    getRolePermissionMenuList,
    postRolePermission,
    postRolePermissionRemove,
  } from '/@/apis/gct-apaas/RolePermissionController';
  import { BasicColumn, BasicTable, useTable } from '/@/components/Table';
  import { listToTree } from '/@/utils/helper/treeHelper';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { cloneDeep } from 'lodash-es';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';

  const props = defineProps({
    platform: {
      type: String,
      default: 'WEB',
    },
    roleId: {
      type: String,
      required: true,
    },
  });

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const { t } = useI18n();
  const [register, methods] = useTable();
  const roleId: string = props.roleId;
  interface MenuTreeItem {
    key: string;
    name: string;
    children?: MenuTreeItem[];
  }

  const menuTree = ref<MenuTreeItem[]>([]);
  const allMenus = ref([]);
  const allMenuMap = ref(new Map());
  const rolePermissionMap = ref<Record<string, boolean>>({});
  const userActions = computed(() => {
    return {
      PermissionSetting: getPermissionByKey(`PermissionSetting`, BasicAction.Update),
    };
  });

  const disabledPointCheckAll = computed(() => {
    const linkPageList = allMenus.value.map((e) => e.linkPage).filter((e) => !!e);
    let permissions = [];
    for (let k in rolePermissionMap.value) {
      if (rolePermissionMap.value[k]) permissions.push(k);
    }
    return (
      !userActions.value.PermissionSetting ||
      (!rolePermissionMap.value['MENU.*'] && permissions.every((e) => !linkPageList.includes(e)))
    );
  });

  // 递归设置节点父linkPageId
  const deepSetParentLinkPageId = (items: any[], parent?: any) => {
    if (items.length > 0) {
      items.forEach((item) => {
        if (parent && parent.linkPage) {
          item.parentLinkPage = parent.linkPage;
          const data = allMenus.value.find((self) => self.id === item.id);
          data.parentLinkPage = parent.linkPage;
        }
        if (item.children) {
          deepSetParentLinkPageId(item.children, item);
        }
      });
    }
  };

  const loadRolePermissionList = async () => {
    if (!roleId) return;
    const res = (await getRolePermissionMenuList({ roleId, type: props.platform })) || {};
    res.permissions?.forEach((item) => {
      rolePermissionMap.value[item] = true;
    });
    // 对链接菜单增加linkPage默认是设置 否则无法绑定访问权限
    res.menus?.forEach((i) => {
      if (i.type === 'LINK') {
        i.linkPage = i.id;
      }
      allMenuMap.value.set(i.id, i);
    });
    allMenus.value = cloneDeep(res.menus);
    menuTree.value = listToTree(res.menus || [], { pid: 'parentId' });
    deepSetParentLinkPageId(menuTree.value);
    await nextTick();
    methods.expandAll();
  };
  loadRolePermissionList();
  const columns: BasicColumn[] = [
    {
      width: 280,
      title: t('sys.nameOfSth', { sth: t('sys.menuText') }),
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      customRender: ({ text }) => t(text),
    },
    // {
    //   align: 'left',
    //   width: 200,
    //   title: 'key',
    //   dataIndex: 'linkPage',
    // },
    {
      width: 120,
      title: t('sys.auth.access'),
      key: 'access',
      align: 'left',
    },
    {
      align: 'left',
      title: t('sys.auth.action'),
      key: 'action',
      ellipsis: false,
    },
  ];
  const handleChecked = async (e, key, permissionType) => {
    const checked = e.target.checked;
    if (checked) {
      await postRolePermission({
        roleId,
        permissionKey: key,
        permissionType,
        terminalType: props.platform,
      });
    } else {
      await postRolePermissionRemove({
        roleId,
        permissionKey: key,
        permissionType,
        terminalType: props.platform,
      });
    }
    // 更新本地数据
    rolePermissionMap.value[key] = checked;
    const item: any = allMenus.value.find((menu: any) => {
      if (menu.parentLinkPage === key) {
        return menu;
      }
      return null;
    });
    if (item) {
      rolePermissionMap.value[item.linkPage] = checked;
    }
  };
</script>

<style lang="less" scoped>
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
    margin: 0;
  }
</style>
