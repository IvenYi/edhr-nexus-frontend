<template>
  <basic-modal
    @register="register"
    :height="500"
    :title="$t('sys.edhr.dashboard.editCommonUse')"
    centered
    width="740px"
    :maskClosable="false"
    @ok="handleOk"
  >
    <div class="ks-row main">
      <div class="shrink-0 w-1/3 dept baseborder border-0 border-r ks-row flex-col">
        <div class="ks-col overflow-x-auto pt10px">
          <div
            v-for="i in menuTree"
            :key="i.id"
            class="approws cursor-pointer"
            :class="i.id === currentCategoryId ? 'active' : ''"
            @click="handleCategoryChange(i.id)"
          >
            {{ i.name }}
          </div>
        </div>
      </div>
      <div class="shrink-0 ks-row w-2/3 overflow-y-auto flex-col p12px">
        <a-tree
          v-if="treeData.length"
          :key="currentCategoryId"
          v-model:checkedKeys="checkedKeys"
          checkable
          :selectable="false"
          :defaultExpandAll="true"
          :tree-data="treeData"
          @check="handleCheck"
        />
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModal } from '/@/components/Modal';
  import { ref } from 'vue';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { getMenuConfigAvailableList } from '/@/apis/gct-apaas/MenuConfigController';
  import type { MenuConfigResponse } from '/@/apis/gct-apaas/model';
  import { cloneDeep } from 'lodash-es';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const checkedKeys = ref<string[]>([]);

  const commonMenuList = ref<any>([]);

  const handleCheck = (checkedKeys: string[], e) => {
    const { checked, node } = e;
    console.log(checked, node);
    if (checked) {
      if (node.children?.length) {
        const childIds = node.children.map((e) => e.id);
        commonMenuList.value = [...new Set([...commonMenuList.value, ...childIds])];
      } else {
        commonMenuList.value.push(node.id);
      }
    } else {
      if (node.children?.length) {
        commonMenuList.value = commonMenuList.value.filter(
          (e) => !node.children.some((n) => n.id === e),
        );
      } else {
        commonMenuList.value = commonMenuList.value.filter((item) => item !== node.id);
      }
    }
    console.log('commonMenuList', commonMenuList.value);
  };

  const emit = defineEmits(['ok']);
  const [register, { openModal, closeModal }] = useModal();

  const menuTree = ref<any>();

  const menuData = ref<any>([]);

  const treeData = ref<any>([]);

  const currentCategoryId = ref<string | undefined>('');

  const buildMenuTree = (
    menuList: MenuConfigResponse[],
    parentId: string | null = 'ROOT',
  ): any[] => {
    // 筛选出当前层级的菜单项
    const currentLevelMenus = menuList.filter((item) => {
      // 如果 parentId 为 'ROOT' 或 null，筛选出顶级菜单
      if (parentId === 'ROOT' || parentId === null) {
        return !item.parentId || item.parentId === 'ROOT';
      }
      // 否则筛选出指定父级的子菜单
      return item.parentId === parentId;
    });

    // 递归构建每个菜单项的子菜单
    return currentLevelMenus.map((item) => {
      // 构建基础菜单项对象
      const menuItem: any = {
        title: item.name,
        key: item.id,
        ...item,
      };

      // 递归获取并设置子菜单
      const children = buildMenuTree(menuList, item.id!);
      if (children.length > 0) {
        menuItem.children = children;
      }

      return menuItem;
    });
  };
  const getVisibleMenuList = async () => {
    const menuRes: MenuConfigResponse[] =
      (await getMenuConfigAvailableList({ menuType: 'WEB' })) ?? [];
    // 所有菜单依赖的目录id
    const menuResCatagoryIds = menuRes
      .filter(
        (m) =>
          ['STANDARD', 'LINK'].includes(m.type) || (m.type === 'CATALOG' && m.parentId !== 'ROOT'),
      )
      .reduce((total: string[], m) => {
        m.fullPath && total.push(...m.fullPath.split('/'));
        return total;
      }, []);
    const menuResCategoryIdsValid = [...new Set(menuResCatagoryIds)];
    // 过滤空目录
    const asyncMenus: MenuConfigResponse[] = menuRes.filter((m) => {
      if (m.name === '操作面板') {
        return false;
      }
      if (m.i18nConfig) {
        try {
          m.name = $t(JSON.parse(m.i18nConfig)?.name);
        } catch (error) {
          console.log(error, m);
        }
      }
      if (m.type === 'CATALOG') {
        return menuResCategoryIdsValid.includes(m.id!);
      }
      return true;
    });
    const asyncMenusVisible = asyncMenus.filter((i) => i.visible === 1);

    menuTree.value = buildMenuTree(asyncMenusVisible);

    menuData.value = cloneDeep(asyncMenusVisible);

    handleCategoryChange(asyncMenusVisible[0].id!);
  };

  const handleCategoryChange = async (id: string) => {
    currentCategoryId.value = id;
    const menu = menuTree.value.find((i) => i.id === id);
    treeData.value = menu?.children ?? [];
    checkedKeys.value = commonMenuList.value ?? [];
  };
  const handleOpen = async (data?: any) => {
    checkedKeys.value = data ?? [];
    commonMenuList.value = data ?? [];
    openModal();
    getVisibleMenuList();
  };
  const handleOk = async () => {
    await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_common_use_menu',
        bsKey: 'biz_save',
      },
      {
        type: 'PC',
        ids: commonMenuList.value,
      },
    );
    closeModal();
    emit('ok');
  };
  defineExpose({ handleOpen });

  // APP MENU
</script>

<style scoped lang="less">
  .lh1 {
    line-height: 1;
  }

  .main {
    height: 100%;
    border: 1px solid #eaeaea;
  }

  .baseborder {
    border-style: solid;
    border-color: #eaeaea;
  }

  .approws {
    padding: 10px 8px;
    // height: 32px;
    line-height: 1;

    &:hover {
      background-color: #ececec;
    }

    &.active {
      background-color: rgba(from var(--ant-primary-color) r g b / 5%);
      color: var(--ant-primary-color) !important;
    }
  }

  .c9b {
    color: #9b9b9b;
  }
</style>
./type
