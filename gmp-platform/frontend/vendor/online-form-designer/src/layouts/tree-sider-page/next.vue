<template>
  <div :class="['tree-sider-page', isFrontPrint ? 'front-print-box' : '']">
    <div class="tabs" v-if="!(siderTab == CategoryEnum.RECEIPT && isFrontPrint) && showTab">
      <div
        class="tab"
        :class="{
          'tab-active': n.code === siderTab,
        }"
        v-for="n in tabs"
        :key="n.code"
        @click="handleTabClick(n)"
      >
        <i :class="['iconfont', n.icon]"></i>
        <div>{{ n.label }}</div>
      </div>
    </div>
    <div
      class="tree tree-sider-page__tree"
      :class="{
        'tree--hidden': !treeVisible,
      }"
    >
      <div class="tree-sider-page__tree-box">
        <div class="tree-sider-page__tree-content">
          <div class="tree-header" v-if="siderTab !== CategoryEnum.GLOBAL_METHOD && hasInsertAuth">
            <slot name="tree-header">
              <a-button
                style="flex: 1"
                type="primary"
                class="tree-sider-page__btn"
                ghost
                @click="openModelModal({}, MenuClickEvent.NEW)"
              >
                <template #icon>
                  <plus-outlined />
                </template>
                {{ t(getTabLabel) }}
              </a-button>
            </slot>
            <slot name="tree-header-extra"></slot>
          </div>
          <div class="tree-content">
            <slot name="tree-content">
              <div class="tree-content-filter">
                <a-input
                  class="tree-search"
                  v-model:value="searchKey"
                  :placeholder="t(getTabSearch)"
                  allowClear
                  @pressEnter="getFilterTree"
                >
                  <template #prefix>
                    <i class="iconfont icon-sousuo1"></i>
                  </template>
                </a-input>
              </div>
              <div class="pl-8px" v-if="siderTab !== CategoryEnum.GLOBAL_METHOD">
                <a-button type="link" @click.stop="openCategoryModal">
                  <template #icon>
                    <plus-outlined />
                  </template>
                  {{ t('sys.newCategory') }}
                </a-button>
              </div>
              <Scrollbar class="tree-content-body">
                <a-tree
                  class="tree-instance"
                  :selectedKeys="selectedKeys"
                  auto-expand-parent
                  default-expand-all
                  block-node
                  draggable
                  :fieldNames="treeSettings.fieldNames"
                  :tree-data="treeDataFiltered"
                  v-model:expanded-keys="expandedKeys"
                  @dragstart="handleDragStart"
                  @drop="onDrop"
                  @select="handleSelect"
                >
                  <template #title="{ data }">
                    <div :class="['tree-node', highlightId === data.id ? 'is-highlight' : '']">
                      <!-- <i v-if="data.children" class="iconfont folder icon-file"></i> -->
                      <SvgIcon v-if="data.children" class="folder" size="20" name="folder" />
                      <span
                        class="tree-node__title"
                        :class="{
                          'is-folder': data.children,
                        }"
                        :title="data[f_title]"
                        >{{ data[f_title] }}</span
                      >
                      <span
                        v-if="isFrontPrint && !data.children"
                        :class="['tree-node__tag', !isSYS(data.id) ? 'custom-label' : '']"
                      >
                        {{ isSYS(data.id) ? '系统' : '自定义' }}
                      </span>
                      <span
                        v-if="data.sysBuiltin && !data.children && data.id == 'enu_SsMmtFHB'"
                        class="tree-node__tag custom-label"
                        >系统</span
                      >
                      <a-dropdown
                        v-if="
                          data.children && siderTab !== CategoryEnum.GLOBAL_METHOD && sysHide(data)
                        "
                        class="tree-node__more"
                        @click.stop
                        @visible-change="(visible) => onVisibleChange(visible, data.id)"
                      >
                        <ellipsis-outlined />
                        <template #overlay>
                          <a-menu
                            style="width: 102px"
                            @click="({ key }) => handleMenuClick(data, key)"
                          >
                            <a-menu-item :key="MenuClickEvent.EDIT">重命名</a-menu-item>
                            <a-menu-item :key="MenuClickEvent.DELETE">删除</a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </div>
                  </template>
                </a-tree>
              </Scrollbar>
            </slot>
          </div>
          <slot name="tree-footer"> </slot>
        </div>
      </div>
      <a-tooltip v-model:visible="treeToggleTooltipVisible">
        <template #title>{{ treeVisible ? t('sys.hideSider') : t('sys.expandSider') }}</template>
        <div class="tree-sider-page__tree-toggle" @click="handleTreeToggle">
          <i class="iconfont icon-a-Leftarrow"></i>
        </div>
      </a-tooltip>
    </div>

    <div class="content">
      <div class="content-header">
        <slot name="content-header"></slot>
      </div>
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </div>
    <category-modal @register="registerCategory" @ok="handleCategoryOk" />
  </div>
</template>

<script setup lang="ts">
  import {
    Ref,
    ref,
    unref,
    computed,
    watch,
    onMounted,
    nextTick,
    createVNode,
    onUnmounted,
    onActivated,
  } from 'vue';
  import {
    PlusOutlined,
    SearchOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined,
  } from '@ant-design/icons-vue';
  import { MenuClickEvent } from './enum';
  import { useTreeSiderPage } from './useTreeSiderPage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    postCategory,
    getCategoryListComplete,
    putCategoryById,
    deleteCategory,
    postCategoryDrag,
  } from '/@/apis/gct-apaas/CategoryController';
  import { postCategoryRelationDrag } from '/@/apis/gct-apaas/CategoryRelationController';
  import { useModal } from '/@/components/Modal';
  import { Modal } from 'ant-design-vue';
  import { useWindowSizeFn, onMountedOrActivated } from '@vben/hooks';
  import { moduleTabLabelEnum, moduleTabSearchEnum } from '/@/layouts/tree-sider-page/constant';
  import { CategoryEnum } from '/@/layouts/tree-sider-page/enum';
  import { Scrollbar } from '/@/components/Scrollbar';
  import CategoryModal from './components/category-modal.vue';
  import { cloneDeep, has } from 'lodash-es';
  import { SiderTab } from './index.d';
  import { SvgIcon } from '/@/components/Icon';
  import { useRoute } from 'vue-router';
  import { useQuickNext } from '/@/hooks/web/useQuickSearch';
  // import Sortablejs from 'sortablejs';
  const { t } = useI18n();
  const [registerCategory, { openModal: openCategoryModal }] = useModal();
  const route = useRoute();
  const searchKey = ref('');
  const expandedKeys = ref<(string | number)[]>([]);
  const treeVisible = ref<boolean>(true);
  const treeToggleTooltipVisible = ref<boolean>(false);
  const highlightId = ref<string>('');
  const emit = defineEmits(['tab-change', 'node-change', 'menu-click', 'tab-label-click']);
  const routePath = route.path;

  const props = defineProps({
    tabs: {
      type: Array<SiderTab>,
      default: () => [],
    },
    treeProps: {
      type: Object,
    },
    hasInsertAuth: {
      // 新建按钮的权限
      type: Boolean,
      default: true,
    },
    pageName: {
      type: String,
      default: 'default',
    },
    showTab: {
      type: Boolean,
      default: true,
    },
  });
  const {
    setTreeSelected,
    setSiderTab,
    siderTab,
    initTreeData,
    treeData,
    selectedTreeKey,
    selectedTreeNode,
    reset,
  } = useTreeSiderPage(props.pageName);

  const treeSettings = computed(() => {
    return Object.assign(
      {},
      {
        data: [],
        filter: true,
        fieldNames: { children: 'children', title: 'name', key: 'id' },
      },
      props.treeProps,
    );
  });

  const f_key = computed(() => treeSettings.value.fieldNames.key);
  const f_title = computed(() => treeSettings.value.fieldNames.title);
  const f_children = computed(() => treeSettings.value.fieldNames.children);

  const selectedKeys = computed(() => {
    return selectedTreeKey.value ? [selectedTreeKey.value] : [];
  });

  const getTabLabel = computed(() => {
    return moduleTabLabelEnum[siderTab.value!] || moduleTabLabelEnum[props.tabs[0].code];
  });

  const getTabSearch = computed(() => {
    return moduleTabSearchEnum[siderTab.value!] || moduleTabSearchEnum[props.tabs[0].code];
  });

  onMounted(() => {
    useQuickNext(
      async ({ module, key, searchName, categoryId }) => {
        siderTab.value = module;
        await initTreeData();
        setTreeSelected(key);
        expandedKeys.value = [categoryId];
        await nextTick();
        emit('node-change', { id: key, name: searchName });
      },
      async () => {
        if (!siderTab.value) {
          const list = props.tabs.map((i) => i.code) || [];
          if (list.includes(CategoryEnum.RECEIPT)) {
            setSiderTab(props.tabs[1].code);
          } else {
            setSiderTab(props.tabs[0].code);
          }
        }
        await initTreeData();
      },
    );
  });

  const isFrontPrint = computed(() => {
    const arr = route.fullPath.split('/');
    const routeName = arr[arr.length - 1];

    return ['PrintDesigner', 'PrintDesigner', 'ReceiptDesigner'].includes(routeName);
  });

  const sysHide = computed(() => {
    return (data: any) => {
      return !(data.id === '_SYS_' && isFrontPrint.value);
    };
  });

  const isSYS = computed(() => {
    return (id: any) => {
      for (let i of keyList.value) {
        if (i.subKeys.includes(id)) {
          return i.id == '_SYS_';
        }
      }
      return false;
    };
  });

  onUnmounted(() => {
    reset();
  });

  const treeDataFiltered = ref();
  const getFilterTree = () => {
    const key = searchKey.value.trim().toLowerCase();
    if (key) {
      treeDataFiltered.value = cloneDeep(
        treeData.value.reduce((prev, current) => {
          // 如果搜索的是文件夹，直接返回全部数据
          if (
            current[f_title.value].toLowerCase().includes(key) ||
            current['key']?.toLowerCase().includes(key)
          ) {
            (prev as object[]).push({ ...current });
            if (!expandedKeys.value.includes(current.id)) {
              expandedKeys.value.push(current.id);
            }
          } else {
            const nodes = current[f_children.value].filter(
              (node) =>
                node[f_title.value].toLowerCase().includes(key) ||
                node['key']?.toLowerCase().includes(key),
            );
            // 对内容进行过滤
            if (Array.isArray(nodes) && nodes.length) {
              prev = (prev as object[]).concat([{ ...current, [f_children.value]: nodes }]);
              if (!expandedKeys.value.includes(current.id)) {
                expandedKeys.value.push(current.id);
              }
            }
          }
          return prev;
        }, []),
      );
    } else {
      treeDataFiltered.value = cloneDeep(treeData.value);
    }
  };

  watch(
    () => treeData.value,
    (val) => {
      getFilterTree();
    },
    { deep: true, immediate: true },
  );

  watch(
    () => searchKey.value,
    (val) => {
      const key = val.trim().toLowerCase();
      if (!key) {
        treeDataFiltered.value = cloneDeep(treeData.value);
      }
    },
  );

  // const treeDataFiltered = computed(() => {
  //   const key = searchKey.value.trim();
  //   if (key) {
  //     return treeData.value.reduce((prev, current) => {
  //       // 如果搜索的是文件夹，直接返回全部数据
  //       if (current[f_title.value].includes(key) || current['key']?.includes(key)) {
  //         (prev as object[]).push({ ...current });
  //         if (!expandedKeys.value.includes(current.id)) {
  //           expandedKeys.value.push(current.id);
  //         }
  //       } else {
  //         const nodes = current[f_children.value].filter(
  //           (node) => node[f_title.value].includes(key) || node['key']?.includes(key),
  //         );
  //         // 对内容进行过滤
  //         if (Array.isArray(nodes) && nodes.length) {
  //           prev = (prev as object[]).concat([{ ...current, [f_children.value]: nodes }]);
  //           if (!expandedKeys.value.includes(current.id)) {
  //             expandedKeys.value.push(current.id);
  //           }
  //         }
  //       }
  //       return prev;
  //     }, []);
  //   } else {
  //     return treeData.value;
  //   }
  // });

  // 节点数量统计
  const treeNodeCount = computed(() => {
    // return treeData.value.reduce((total, item) => {
    //   return total + item[f_children.value].length;
    // }, 0);
    return treeDataFiltered.value.reduce((total, item) => {
      return total + (item?.[f_children.value]?.length ?? 0) + Number(has(item, 'categoryId'));
    }, 0);
  });

  // 平铺数据，并添加_pid_属性，目前仅支持两级节点
  const dataList = computed(() => {
    return treeData.value.reduce((list: any[], item: any) => {
      list.push(item);
      const nodes = item[f_children.value].map((ele) => {
        return {
          ...ele,
          _pid_: item.id,
        };
      });
      list.push(...nodes);
      return list;
    }, []);
  });

  const keyList = computed(() => {
    return treeData.value.map((i: any) => {
      const subKeys = i.children?.map((v) => v.id);
      return {
        id: i.id,
        subKeys,
      };
    });
  });

  watch(siderTab, (v) => {
    searchKey.value = '';
    reset();
  });

  /**
   * 左侧tab点击事件
   */
  const handleTabClick = (tab) => {
    if (tab.code === CategoryEnum.LABEL) {
      emit('tab-label-click', tab);
      return;
    }
    if (siderTab.value === tab.code) {
      return;
    }

    setSiderTab(tab.code);
    emit('tab-change', tab.code);
    initTreeData();
  };

  /**
   * 下拉菜单点击事件
   */
  const handleMenuClick = (data, key: MenuClickEvent) => {
    switch (key) {
      case MenuClickEvent.NEW:
        emit('menu-click', {
          key,
          data,
        });
        break;
      case MenuClickEvent.EDIT:
        // window.console.log(data);
        openCategoryModal(true, data);
        break;
      case MenuClickEvent.DELETE:
        Modal.confirm({
          title: t('sys.sureToDeleteCategoryWithName', { name: data[f_title.value] }),
          icon: createVNode(ExclamationCircleOutlined),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          async onOk() {
            await deleteCategory({ ids: data.id });
            initTreeData();
          },
          onCancel() {},
        });

        break;
      default:
        break;
    }
  };

  const openModelModal = (data, key: MenuClickEvent) => {
    emit('menu-click', {
      key,
      data,
    });
  };

  /**
   * 节点选中事件
   */
  const handleSelect = (sKeys, { node }) => {
    // 不可取消选中
    if (sKeys.length === 0) return;
    // 文件夹不可选中
    if (node.dataRef.children) {
      if (expandedKeys.value.includes(node.dataRef.id)) {
        expandedKeys.value = expandedKeys.value.filter((i) => i !== node.dataRef.id);
      } else {
        expandedKeys.value = expandedKeys.value.concat([node.dataRef.id]);
      }
      return;
    }
    if (!expandedKeys.value.includes(node.categoryId)) {
      expandedKeys.value.push(node.categoryId);
    }
    emit('node-change', node.dataRef);
    setTreeSelected(node.dataRef[f_key.value], node.dataRef);
  };

  const handleDragStart = ({ node }) => {
    // 仅支持分类拖拽 实际这么写没什么用
    // if (!node[f_children.value]) {
    //   return Promise.reject();
    // }
  };

  const onDrop = async (info) => {
    const dragInfo = info.dragNode.dataRef;
    const dropInfo = info.node.dataRef;

    const { dragNode, node } = info;
    const nodeParent: any = treeData.value.find((i: any) => {
      const keys = i.children?.map((v) => v.id);
      return keys.includes(node.id);
    });
    if (
      isFrontPrint.value &&
      (dragNode.parent.key === '_SYS_' || nodeParent?.id === '_SYS_' || node.id === '_SYS_')
    ) {
      return;
    }
    const dragIsLeaf = !!dataList.value.find((item) => item.id === dragInfo.id)?._pid_;
    const dropIsLeaf = !!dataList.value.find((item) => item.id === dropInfo.id)?._pid_;
    // 一级菜单直接拖拽或者在相同菜单下拖拽
    if (
      dragInfo[f_children.value] ||
      (dropInfo[f_children.value] && dragInfo.categoryId === dropInfo.id) ||
      dragInfo.categoryId === dropInfo.categoryId ||
      (info.dropToGap && !dropIsLeaf && dragIsLeaf)
    ) {
      return await handleDrop(info);
    }

    const tabInfo = props.tabs.find((tab: SiderTab) => tab.code === siderTab.value);
    // 模型拖拽需要二次确认
    Modal.confirm({
      title: t('sys.sureMoveSth', {
        sth: tabInfo?.label,
      }),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await handleDrop(info);
      },
      onCancel() {},
    });
  };

  const handleDrop = async (info) => {
    const dropKey = info.node.key; // 目标节点
    const dragKey = info.dragNode.key; // 拖拽节点
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const dragIsLeaf = !!dataList.value.find((item) => item.id === dragKey)?._pid_;
    const dropNode = dataList.value.find((item) => item.id === dropKey);
    // dropNode.sortNum = Number(dropNode.sortNum);
    const dropIsLeaf = !!dropNode?._pid_;

    // true代表拖拽到节点之间的缝隙中，false代表拖拽到节点上，即节点的内容区
    if (!info.dropToGap) {
      // 拖拽至非顶层第一项
      if (dragIsLeaf && !dropIsLeaf) {
        // 场景1 节点拖拽至分类第一项
        await postCategoryRelationDrag({
          relationId: dragKey,
          categoryId: dropKey,
          targetSortNum: (dropNode[f_children.value]?.[0]?.sortNum || 0) + 1,
        });
        initTreeData();
      } else if (dragIsLeaf && dropIsLeaf) {
        // 场景4 节点拖拽
        await postCategoryRelationDrag({
          relationId: dragKey,
          categoryId: dropNode._pid_,
          targetSortNum: dropNode.sortNum,
        });
        initTreeData();
      } else if (!dragIsLeaf && !dropIsLeaf) {
        // 场景3 分类拖拽
        await postCategoryDrag({ id: dragKey, targetSortNum: dropNode.sortNum });
        initTreeData();
      }
    } else {
      if (dropPosition === -1) {
        // 拖拽至顶层第一项
        if (!dragIsLeaf && !dropIsLeaf) {
          // 场景2 分类拖拽至最前
          await postCategoryDrag({ id: dragKey, targetSortNum: dropNode.sortNum + 1 });
          initTreeData();
        }
        // } else if (dropPosition === 1) {
        //   // 拖拽至最后
        //   if (dragIsLeaf && dropIsLeaf) {
        //     // 场景5 节点拖拽至最后
        //     await postCategoryrelationDrag({
        //       relationId: dragKey,
        //       categoryId: dropNode._pid_,
        //       targetSortNum: dropNode.sortNum,
        //     });
        //     initTreeData();
        //   }
      } else {
        if (!dragIsLeaf && !dropIsLeaf) {
          // 场景3 分类拖拽
          await postCategoryDrag({ id: dragKey, targetSortNum: dropNode.sortNum });
          initTreeData();
        } else if (dragIsLeaf && dropIsLeaf) {
          // 场景4 节点拖拽
          await postCategoryRelationDrag({
            relationId: dragKey,
            categoryId: dropNode._pid_,
            targetSortNum: dropNode.sortNum,
          });
          initTreeData();
        }
      }
    }
  };

  /**
   * TODO 会出现点击以后 tooltip先变更 再动画的问题
   */
  const handleTreeToggle = async () => {
    treeToggleTooltipVisible.value = false;
    await nextTick();
    setTimeout(() => {
      treeVisible.value = !treeVisible.value;
    }, 1);
  };

  const handleCategoryOk = async (data) => {
    !data.id
      ? await postCategory({ name: data.name, module: siderTab.value })
      : await putCategoryById({ id: data.id }, { name: data.name, module: siderTab.value });
    initTreeData();
  };

  const onVisibleChange = (visible: boolean, treeId: string) => {
    highlightId.value = visible ? treeId : '';
  };

  const expand = async (node) => {
    if (!expandedKeys.value.includes(node.id)) {
      expandedKeys.value = [...expandedKeys.value, node.id];
      await nextTick();
    }
  };

  defineExpose({
    expand,
    handleTabClick,
  });
</script>

<style scoped lang="less">
  .tree-sider-page {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;

    &.front-print-box {
      padding: 0 16px;
    }
  }

  .tabs {
    flex: none;
    width: 56px;
    border: 1px solid #e0e3ea;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    background: #fff;

    .tab {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 82px;
      transition: all 0.3s;
      color: #767f92;
      font-size: 12px;
      cursor: pointer;

      &:first-child {
        border-top-left-radius: 3px;
      }

      .iconfont {
        margin-bottom: 4px;
        color: #767f92;
        font-size: var(--tab-icon-size, 20px);
        line-height: 1em;
      }

      &:hover {
        background-color: rgba(from var(--ant-primary-color) r g b / 8%);
        color: var(--ant-primary-color);

        .iconfont {
          color: var(--ant-primary-color);
        }
      }

      &-active,
      &-active:hover {
        background: var(--ant-primary-color);
        color: #fff;

        .iconfont {
          color: #fff;
        }
      }
    }
  }

  .front-print-box {
    .tree-sider-page__tree,
    .content {
      border-top: none;
    }
  }

  .tree-sider-page__tree {
    @tree-width: 222px;

    position: relative;
    flex: none;
    width: @tree-width;
    height: 100%;
    transition: all 0.3s;
    border: 1px solid #e0e3ea;
    border-left: 0;
    background: #fff;

    &.tree--hidden {
      width: 0;
      border-right: 0;

      .tree-sider-page__tree-toggle {
        transform: translate3d(50%, -50%, 0) rotate(180deg);
      }
    }

    &-toggle {
      display: flex;
      position: absolute;
      z-index: 999;
      top: 50%;
      right: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      transform: translate3d(50%, -50%, 0);
      transition: all 0.3s;
      border: 1px solid #d9d9d9;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;

      .iconfont {
        color: #666;
        font-size: 12px;
        line-height: 1em;
      }
    }

    &-box {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    &-content {
      display: flex;
      flex-direction: column;
      width: @tree-width;
      height: 100%;

      .tree-header {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        border-bottom: 1px solid #ddd;

        .tree-sider-page__btn {
          height: 34px;
          // line-height: 34px;
        }
      }

      .tree-content {
        display: flex;
        flex: 1;
        flex-flow: column;
        min-height: 10px;

        .tree-content-filter {
          display: flex;
          align-items: center;
          padding: 24px 16px 16px;

          :deep(.ant-input) {
            font-size: 13px;
          }

          .tree-node-count {
            flex: none;
            margin-left: 8px;
            font-size: 12px;
          }
        }

        .tree-content-body {
          flex: 1;
          padding: 0 16px;
          // overflow-y: auto;

          :deep(.ant-tree) {
            color: #6a717d;
          }
        }
      }

      .tree-node {
        display: flex;
        position: relative;
        align-items: center;

        .folder {
          flex: none;
          text-align: center;
        }

        &__title {
          flex: 1;
          width: 10px;
          margin-left: 8px;
          padding-right: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &__tag {
          padding: 0 6px;
          border-radius: 4px;
          background: #eff3fa;
          color: var(--ant-primary-color);

          &.custom-label {
            background: #def8e2;
            color: #309c41;
            font-size: 12px;
          }
        }

        .ant-dropdown-trigger {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
        }

        &__more {
          display: none;
        }
      }
    }
  }

  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 1px;
    border: 1px solid #e0e3ea;
    border-left: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    .content-wrapper {
      flex: 1;
      height: 100px;
      padding: 4px 20px 0;
      background-color: #fff;
    }
  }

  // 修改树样式
  :deep(.tree-instance) {
    .ant-tree-treenode {
      align-items: center;
      margin-bottom: 4px;
      padding: 6px 12px;
      transition: all 0.3s;
      border-radius: 4px;

      &:hover {
        background: #f5f5f5;

        .tree-node__more {
          display: block;
        }

        .tree-node__title.is-folder {
          padding-right: 28px;
        }
      }

      .ant-tree-node-content-wrapper {
        padding-right: 0;

        &:hover {
          background: transparent;
        }
      }

      .ant-tree-indent {
        .ant-tree-indent-unit {
          width: 0;
        }
      }

      .ant-tree-switcher {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 24px;
        padding-right: 4px;
        line-height: 24px;

        .ant-tree-switcher-icon {
          color: #797a7d;
          font-size: 16px;
        }
      }

      &:has(.tree-node.is-highlight) {
        background: #f5f5f5;

        .tree-node__more {
          display: block;
        }
      }

      &-selected {
        background-color: rgba(from var(--ant-primary-color) r g b / 8%) !important;
        color: var(--ant-primary-color) !important;

        .ant-tree-node-selected {
          background-color: transparent;
        }
      }
    }
  }

  :deep(.ant-dropdown-menu-item) {
    padding: 5px 20px;
  }
</style>
