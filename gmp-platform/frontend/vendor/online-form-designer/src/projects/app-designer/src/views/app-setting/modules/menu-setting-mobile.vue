<template>
  <div class="menu-setting-mobile-container">
    <div class="table-header">
      <div v-if="menuType !== 'PAD'" class="switch-tab">
        <div
          class="switch-item"
          :class="element.name === showType ? 'selected' : ''"
          v-for="element of switchIcon"
          :key="element.key"
          @click="
            showType = element.name;
            createLS.set('menu_list_m_type', element.name);
          "
        >
          <i class="iconfont" :class="element.icon"></i>
        </div>
      </div>
      <a-button type="primary" @click="handleNewMenu">
        {{ t('sys.appDesigner.newMenu') }}
      </a-button>
    </div>
    <div
      ref="basicTableParent"
      v-if="showType === 'Table' || menuType === 'PAD'"
      class="table-warp"
    >
      <basic-table
        row-key="id"
        :key="tableData"
        :columns="mobileColumns"
        :data-source="tableData"
        :striped="false"
        :bordered="false"
        :showIndexColumn="false"
        :ellipsis="true"
        :isTreeTable="true"
        :rowDraggable="true"
        :pagination="false"
        :expandedRowKeys="expandedRowKeys"
        :row-drag-api="postMenuConfigMove"
        :rowClassName="rowClassName"
        @expand="expandedRows"
        @row-drag-end="
          async ({ expandKeysList, showMessage, dragItemKey }) => {
            if (showMessage) {
              createMessage.success(t('sys.operationSuccess'));
            }
            await getTableData(true);
            expandedRowKeys = expandKeysList;
            scrollDragItem(dragItemKey);
          }
        "
      >
        <template #expandIcon="props">
          <span style="position: relative">
            <span
              v-show="props.record.children && props.record.children.length && props.expanded"
              class="tree-line"
            ></span>
            <span v-show="props.record.level !== 1" class="tree-line tree-line-1"></span>
            <span
              v-show="props.record.level !== 1 && props.record.level !== 2"
              class="tree-line tree-line-2"
            ></span>
            <span v-show="props.record.level === 4" class="tree-line tree-line-3"></span>
          </span>
          <span
            v-if="!props.record.children || !props.record.children.length"
            style="display: inline-block; width: 14px"
          ></span>
          <caret-right-outlined
            v-if="!props.expanded && props.record.children && props.record.children.length"
            @click="(e) => props.onExpand(props.record, e)"
          />
          <caret-down-outlined
            v-if="props.expanded && props.record.children && props.record.children.length"
            class="caret-down"
            @click="(e) => props.onExpand(props.record, e)"
          />
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span
              v-if="record.logo"
              class="gct-menu-icon-m"
              :style="{ backgroundColor: record.color }"
            >
              <IconNext
                :size="16"
                :value="record.logo"
                :style="{
                  verticalAlign: 'text-bottom',
                }"
              />
            </span>
            {{ record.name }}
          </template>
          <template v-if="column.key === 'type'">
            {{ t(`sys.appDesigner.${record.type}Menu`) }}
          </template>
          <template v-if="column.key === 'sysBuiltin'"> {{ getType(record.sysBuiltin) }}</template>
          <template v-if="column.key === 'menuUrl'">
            {{ record.linkPageName || record.url }}
          </template>
          <template v-if="column.key === 'visible'">
            {{
              record.type !== MenuType.CATALOG
                ? record.visible
                  ? t('sys.appDesigner.show')
                  : t('sys.appDesigner.hidden')
                : ''
            }}
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: handleEdit.bind(null, record),
                },
                {
                  label: t('sys.delete'),
                  color: 'text',
                  getPopupContainer: (trigger: HTMLElement) => trigger.parentElement,
                  okButtonProps: {
                    danger: true,
                  },
                  onClick: handleSelectedRow.bind(null, record),
                  popConfirm: {
                    title: t('sys.sureToDo'),
                    confirm: handleDelete.bind(null, record),
                    cancel: handleSelectedRow.bind(null, {}),
                  },
                },
                {
                  label: t('sys.appDesigner.addPermissionMenu'),
                  color: 'success',
                  onClick: handleAddPermissionMenu.bind(null, record),
                  // ifShow: record.level === 2 && record.createType === CreateType.USER_DEFINED,
                  ifShow: record.type === MenuType.STANDARD && record.sysBuiltin !== 1,
                },
              ]"
            />
          </template>
        </template>
      </basic-table>
    </div>

    <mobile-menu-preview v-else-if="showType === 'Preview'" :data-source="tableData" />
    <menu-type-setting-modal @register="typeRegister" @closed="handleMenuTypeClosed" />
    <menu-setting-modal
      @register="register"
      @refresh="onRefresh"
      :menus="menus"
      :isMobile="true"
      @prev="handleMenuSettingPrev"
    />
    <permission-menu-modal
      @register="permissionMenuRegister"
      @refresh="onRefresh"
      :isMobile="false"
    />
  </div>
</template>
<script setup lang="ts" name="menu-setting-mobile">
  import { computed, onMounted, ref, nextTick } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { IconNext } from '/@/components/Icon';
  import { listToTree, findNode } from '/@/utils/helper/treeHelper';
  import { mobileColumns } from '../constants/columns';
  import { cloneDeep } from 'lodash-es';
  import MobileMenuPreview from '../components/mobile-menu-preview.vue';
  import MenuSettingModal from '../components/menu-setting-modal.vue';
  import menuTypeSettingModal from '../components/menu-type-setting-modal.vue';
  import { MenuType } from '@/enums/appEnum';
  import { onClickOutside } from '@vueuse/core';
  import { createLocalStorage } from '/@/utils/cache';
  import {
    deleteMenuConfig,
    getMenuConfigList,
    postMenuConfigMove,
    getMenuConfigInfo,
  } from '/@/apis/gct-apaas/MenuConfigController';

  import type { SelectProps } from 'ant-design-vue';
  import type { MenuConfigResponse } from '/@/apis/gct-apaas/model';
  import PermissionMenuModal from '../components/permission-menu-modal.vue';

  interface Props {
    menuType?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    menuType: 'MOBILE',
  });

  let menusBak: MenuConfigResponse[] = [];
  const findParentMenu = (id) => {
    return menusBak.find((item) => item.id === id);
  };

  const switchIcon = [
    {
      icon: 'icon-liebiao',
      name: 'Table',
      key: 'switch_icon_table',
    },
    {
      icon: 'icon-APP',
      name: 'Preview',
      key: 'switch_icon_preview',
    },
  ];

  const { t } = useI18n();

  const { createMessage } = useMessage();

  const [register, { openModal }] = useModal();
  const [permissionMenuRegister, { openModal: openPermissionMenuModal }] = useModal();
  const [typeRegister, { openModal: openMenuTypeModal }] = useModal();
  const menus = ref<SelectProps['options']>([]);

  const expandedRowKeys = ref<string[]>([]);
  const tableData = ref<MenuConfigResponse[]>([]);
  const menusData = ref<MenuConfigResponse[]>([]);
  const currentRowKey = ref();
  const createLS = createLocalStorage();
  const showType = ref(createLS.get('menu_list_m_type') || 'Table');

  onMounted(() => {
    getTableData(true);
  });

  const getTableData = async (refreshTable?: boolean) => {
    const res = (await getMenuConfigList({ menuType: props.menuType })) || [];
    menusData.value = cloneDeep(res);
    if (refreshTable) tableData.value = listToTree(res, { pid: 'parentId' });
    menusBak = res;
    menus.value = listToTree(
      menusData.value.filter((e) => e.level === 1 || e.level === 2),
      { pid: 'parentId' },
    );
  };
  // 手动刷新一条数据
  const onRefresh = async (id, isDelete = false) => {
    const menuInfo: any = !isDelete ? await getMenuConfigInfo({ id }) : { id };
    if (menusData.value.some((e) => e.id === menuInfo.id)) {
      const menu = findNode(tableData.value, (node) => {
        return node.id === menuInfo.id;
      });
      // 编辑才需要更新level
      menuInfo.parentId && updateLevel(menu.children || [], menuInfo.level + 1);
      updateChild(tableData.value, menuInfo, menu);
    } else {
      // 添加
      addMenu(tableData.value, menuInfo);
    }
    // scrollToPosition(tableData.value, menuInfo.id);
    // 更新其他相关数据
    getTableData();
  };
  // 手动添加一个菜单
  const addMenu = (list, info, oldInfo = {}) => {
    if (info.parentId === 'ROOT') {
      insetChildren(list, info, oldInfo);
    } else {
      list.forEach((e, i) => {
        if (e.id === info.parentId) {
          if (e.children == undefined) e.children = [];
          insetChildren(e.children, info, oldInfo);
          if (!expandedRowKeys.value.some((f) => f === e.id)) {
            expandedRowKeys.value.push(e.id);
          }
        } else if (Array.isArray(e.children)) {
          addMenu(e.children, info, oldInfo);
        }
        if (!list[i].children || !list[i].children.length) {
          expandedRowKeys.value = expandedRowKeys.value.filter((f) => f !== e.id);
        }
      });
    }
  };

  // 根据sortNum判断插入数据的位置
  const insetChildren = (list, info, oldInfo) => {
    let idx = 0;
    list.forEach((f, j) => {
      if (
        f.sortNum > info.sortNum &&
        (j + 1 === list.length || list[j + 1].sortNum < info.sortNum)
      ) {
        idx = j + 1;
      }
    });
    if (oldInfo.children && oldInfo.children.length) {
      updateLevel(oldInfo.children, info.level + 1);
    }
    list.splice(idx, 0, { ...oldInfo, ...info });
  };

  // 更新level
  const updateLevel = (list, level) => {
    list.forEach((e, i) => {
      list.splice(i, 1, { ...e, level });
      if (Array.isArray(e.children)) {
        updateLevel(e.children, level + 1);
      }
    });
  };

  // 更新一条数据
  const updateChild = (list, info, oldInfo) => {
    if (info.parentId === 'ROOT' && oldInfo.parentId === 'ROOT') {
      // 层级不变
      const idx = list.findIndex((e) => e.id === info.id);
      if (idx > -1) {
        list.splice(idx, 1, { ...oldInfo, ...info });
      } else {
        list.unshift({ ...oldInfo, ...info });
      }
    } else if (info.parentId === 'ROOT' && oldInfo.parentId !== 'ROOT') {
      // 移动到第一层
      list.unshift({ ...oldInfo, ...info });
      list.forEach((e) => {
        if (e.id === oldInfo.parentId) {
          const idx = e.children.findIndex(
            (f) => f.id === oldInfo.id && f.parentId === oldInfo.parentId,
          );
          e.children.splice(idx, 1);
        }
      });
    } else {
      // 移动到其他层
      let spliceIdx = -1;
      list.forEach((e, i) => {
        if (e.id === info.parentId) {
          if (!expandedRowKeys.value.includes(e.id)) {
            expandedRowKeys.value = [...expandedRowKeys.value, e.id];
          }
          const idx = e.children ? e.children.findIndex((f) => f.id === info.id) : null;
          if (idx == null) list.splice(i, 1, { ...e, children: [{ ...info }] });
          else if (idx > -1) {
            e.children.splice(idx, 1, { ...oldInfo, ...info });
          } else {
            e.children.unshift({ ...oldInfo, ...info });
          }
        }
        if (e.id === info.id && (e.parentId !== info.parentId || !info.parentId)) {
          // 编辑时的，更改父节点，将原节点数据删除；或者删除操作，删掉原节点。
          spliceIdx = i;
        }
        if (Array.isArray(e.children)) {
          updateChild(e.children, info, oldInfo);
        }
      });
      // list遍历结束再进行删除操作，splice会改变原数组，导致遍历提前结束
      if (spliceIdx > -1) list.splice(spliceIdx, 1);
    }
  };

  const handleNewMenu = () => {
    openMenuTypeModal(true);
    // openModal(true, { isEdit: false, menuType: props.menuType });
  };

  const handleEdit = (data) => {
    const { type } = data;
    if (type === 'PERMISSION') {
      openPermissionMenuModal(true, {
        isEdit: true,
        parent: findParentMenu(data.parentId),
        record: data,
        menuType: props.menuType,
      });
    } else {
      openModal(true, { ...data, isEdit: true, menuType: props.menuType });
    }
  };

  const handleDelete = async (record) => {
    if (record.children?.length) {
      currentRowKey.value = '';
      createMessage.error(t('sys.appDesigner.delMenuErrorTip'));
      return;
    }
    await deleteMenuConfig({ ids: record.id });
    createMessage.success(t('sys.appDesigner.delMenuSucessTip'));
    onRefresh(record.id, true);
  };

  const handleAddPermissionMenu = (record) => {
    openPermissionMenuModal(true, {
      isEdit: false,
      parent: record,
      menuType: props.menuType,
    });
  };
  // 下一步
  const handleMenuTypeClosed = (data) => {
    openModal(true, { ...data, isEdit: false, menuType: props.menuType });
  };
  // 上一步
  const handleMenuSettingPrev = (data) => {
    openMenuTypeModal(true, { type: data.type });
  };
  const getType = computed(() => (type) => {
    let text = '';
    switch (type) {
      case 1:
        text = t('sys.appDesigner.sysMenu');
        break;
      case 0:
        text = t('sys.appDesigner.userMenu');
        break;
      default:
    }
    return text;
  });

  // 行点击事件
  const handleSelectedRow = (row) => {
    currentRowKey.value = row.id;
  };
  const expandedRows = (expanded, record) => {
    if (expanded) expandedRowKeys.value.push(record.id);
    else {
      const idx = expandedRowKeys.value.findIndex((e) => e === record.id);
      if (idx > -1) expandedRowKeys.value.splice(idx, 1);
    }
  };
  const rowClassName = (row) => {
    if (row.id === currentRowKey.value) return 'gct-current-row';
    else return '';
  };
  const basicTableParent = ref();
  onClickOutside(basicTableParent, () => {
    handleSelectedRow({});
  });

  const scrollDragItem = async (key) => {
    await nextTick();
    const rowElement = document.querySelector(`tr[data-row-key="${key}"]`);
    rowElement?.scrollIntoView();
  };
</script>

<style scoped lang="less">
  :deep(.ant-table-row .ant-table-cell) {
    user-select: none;
  }

  .caret-down {
    color: var(--ant-primary-color);
  }

  .menu-setting-mobile-container {
    position: relative;
    width: 100%;
    height: 100%;

    .table-header {
      display: flex;
      position: absolute;
      top: -39px;
      right: 0;
      align-items: center;
      justify-content: space-between;

      .ant-btn {
        margin-left: 16px;
      }

      .switch-tab {
        display: flex;
        position: relative;

        .switch-item {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 32px;
          border: 1px solid #ddd;
          color: #666;
          cursor: pointer;

          &:first-child {
            border-right: 0;
            border-radius: 4px 0 0 4px;

            &::after {
              content: '';
              position: absolute;
              right: 0;
              width: 1px;
              height: 32px;
              background-color: var(--ant-primary-color);
            }
          }

          &:last-child {
            border-left: 0;
            border-radius: 0 4px 4px 0;
          }

          &.selected {
            border-color: var(--ant-primary-color);
            color: var(--ant-primary-color);
          }
        }
      }
    }

    .table-warp {
      flex: 1 1;
      width: 100%;
      height: 100%;
      overflow: auto;
    }

    .logo-warp {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .logo-area {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
      }
    }

    .color-warp {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      > span {
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
    }
  }

  .gct-menu-icon-m {
    // background-color: #ccc;
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    line-height: 20px;
    text-align: center;
    vertical-align: middle;
  }

  .tree-line {
    display: inline-block;
    position: absolute;
    bottom: -15px;
    left: 6px;
    width: 1px;
    height: 16px;
    border-left: 1px solid #c3c3c3;
  }

  .tree-line-1 {
    top: -13px;
    left: -18px;
    height: 45px;
  }

  .tree-line-2 {
    top: -13px;
    left: -42px;
    height: 45px;
  }

  .tree-line-3 {
    top: -13px;
    left: -66px;
    height: 45px;
  }
</style>
