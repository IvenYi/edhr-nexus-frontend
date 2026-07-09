<template>
  <div :class="['tree-sider-page', isFrontPrint ? 'front-print-box' : '']">
    <div
      class="tabs select-none"
      v-if="!(siderTab == CategoryEnum.RECEIPT && isFrontPrint) && showTab"
    >
      <div
        class="tab"
        :class="{
          'tab-active': n.code === siderTab,
        }"
        v-for="n in tabs"
        :key="n.code"
        @click="handleTabClick(n)"
      >
        <i :class="n.icon" style="font-size: 24px"></i>
        <div class="mt-1">{{ n.label }}</div>
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
                :style="{
                  '--hover-color': isThemeBlue ? '#025AAA' : '#078378',
                }"
                @click="(e) => openModelModal({}, MenuClickEvent.NEW, e)"
              >
                <template #icon>
                  <plus-outlined />
                </template>
                {{ t(createPageButtonLabel) }}
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
                  :maxlength="100"
                  @change="handleSearchKeyChange"
                  @pressEnter="getFilterTree"
                >
                  <template #prefix>
                    <i class="iconfont icon-sousuo1"></i>
                  </template>
                </a-input>
              </div>
              <div v-if="siderTab !== CategoryEnum.GLOBAL_METHOD">
                <a-button type="link" @click.stop="handleCreateCategoryClick">
                  <template #icon>
                    <i class="gct-iconfont icon-a-btn_add mr6px" style="font-size: 14px"></i>
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
                  :draggable="!isEditing"
                  :fieldNames="treeSettings.fieldNames"
                  :tree-data="filteredTreeData"
                  v-model:expanded-keys="expandedKeys"
                  @expand="handleExpand"
                  @dragstart="handleDragStart"
                  @dragend="isDraggingFolder = false"
                  @drop="handleDrop"
                  @select="handleSelect"
                >
                  <template #switcherIcon="{ switcherCls }">
                    <span class="text-[14px] w16px" style="display: inline-block">
                      <!-- <holder-outlined class="sort" /> -->
                    </span>

                    <caret-down-outlined :class="switcherCls" class="" />
                  </template>

                  <template #title="{ data }">
                    <div
                      :class="['tree-node', highlightId === data.id ? 'is-highlight' : '']"
                      :ref="(el) => setMenuRef(el, data.index)"
                    >
                      <!-- 遮挡 drag-handler 以屏蔽点击触发展开收起 -->
                      <mask
                        class="absolute z-10 top-1/2 -left-10 w-4 h-4 -translate-y-1/2 _bg-red-100"
                        @click.stop
                      />

                      <img v-if="data.children" class="folder w20px h20px" :src="floder" />

                      <span
                        v-if="!data.isEdit"
                        class="tree-node__title"
                        :class="{
                          'is-folder': data.children,
                        }"
                        v-ellipsis-title="treeMap[data.id] || data[f_title]"
                      >
                        {{ treeMap[data.id] || data[f_title] }}
                      </span>

                      <!-- 在位编辑输入框 -->
                      <div v-else class="relative z-0" @click.stop>
                        <a-input
                          v-model:value="editName"
                          size="small"
                          placeholder="请输入"
                          :class="INPUT_CLASS"
                          :maxlength="100"
                          @blur="handleInPlaceInputBlur(data)"
                        />
                        <div
                          v-if="isLoading"
                          class="absolute z-10 top-0 right-1 bottom-0 flex items-center"
                        >
                          <a-spin :indicator="indicator" />
                        </div>
                      </div>

                      <span
                        v-if="isFrontPrint && !data.children"
                        :class="['tree-node__tag', !isSYS(data.id) ? 'custom-label' : '']"
                      >
                        {{ isSYS(data.id) ? '系统' : '自定义' }}
                      </span>
                      <span
                        v-if="data.sysBuiltin && !data.children && data.id == 'enu_SsMmtFHB'"
                        class="tree-node__tag custom-label"
                      >
                        系统
                      </span>
                      <a-dropdown
                        v-if="
                          data.children &&
                          siderTab !== CategoryEnum.GLOBAL_METHOD &&
                          sysHide(data) &&
                          !data.isEdit
                        "
                        class="tree-node__more"
                        @click.stop
                        @visible-change="(visible) => onVisibleChange(visible, data.id)"
                      >
                        <div class="w24px h24px flex items-center justify-center text-center">
                          <ellipsis-outlined class="h14px" />
                        </div>

                        <template #overlay>
                          <a-menu
                            style="width: 102px"
                            @click="({ key }) => handleMenuClick(data, key)"
                          >
                            <a-menu-item :key="MenuClickEvent.EDIT">重命名</a-menu-item>
                            <a-menu-item v-if="!data.sysBuiltin" :key="MenuClickEvent.DELETE">
                              <span class="text-red-500">删除</span>
                            </a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                      <a-dropdown
                        v-if="!data.children"
                        class="tree-node__more"
                        @click.stop
                        @visible-change="(visible) => onVisibleChange(visible, data.id)"
                      >
                        <div class="w24px h24px flex items-center justify-center text-center">
                          <ellipsis-outlined class="h14px" />
                        </div>
                        <template #overlay>
                          <a-menu
                            style="width: 102px"
                            @click="({ key }) => handleMenuClick(data, key)"
                          >
                            <a-menu-item :key="MenuClickEvent.COPY">复制</a-menu-item>
                            <a-menu-item :key="MenuClickEvent.DELETEPAGE">
                              <span class="text-red-500">删除</span>
                            </a-menu-item>
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
    h,
  } from 'vue';
  import {
    PlusOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined,
    ExclamationCircleFilled,
    LoadingOutlined,
  } from '@ant-design/icons-vue';
  import { MenuClickEvent } from './enum';
  import { useTreeSiderPage } from '../tree-sider-page/useTreeSiderPage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    postCategory,
    putCategoryById,
    deleteCategory,
    postCategoryDrag,
  } from '/@/apis/gct-apaas/CategoryController';
  import { postCategoryRelationDrag } from '/@/apis/gct-apaas/CategoryRelationController';
  import { Modal, message } from 'ant-design-vue';
  import { moduleTabLabelEnum, moduleTabSearchEnum } from '/@/layouts/tree-sider-page/constant';
  import { CategoryEnum } from '/@/layouts/tree-sider-page/enum';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { cloneDeep } from 'lodash-es';
  import { SiderTab } from './index.d';
  import { useRoute } from 'vue-router';
  import { useQuickNext } from '/@/hooks/web/useQuickSearch';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import floder from '/@/assets/svg/icon_folder.svg';
  import { SvgIcon } from '@gct/runtime-web';

  const INPUT_CLASS = 'in-place-edit-input';
  const INPUT_DEFAULT_VALUE = '新分类';
  const MOCK_NEW_ID = 'MOCK_NEW_ID';

  const indicator = h(LoadingOutlined, {
    style: {
      fontSize: '12px',
    },
    spin: true,
  });

  const { t } = useI18n();
  const route = useRoute();
  const { themeSetting } = useThemeSetting();

  const {
    setTreeSelected,
    setSiderTab,
    siderTab,
    initTreeData,
    treeData,
    treeMap,
    selectedTreeKey,
    selectedTreeNode,
    reset,
  } = useTreeSiderPage(props.pageName);

  const emit = defineEmits(['tab-change', 'node-change', 'menu-click', 'tab-label-click']);

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

  const searchKey = ref('');
  const searchKeyCache = ref('');
  const expandedKeys = ref<(string | number)[]>([]);
  const treeVisible = ref<boolean>(true);
  const treeToggleTooltipVisible = ref<boolean>(false);
  const highlightId = ref<string>('');
  const filteredTreeData = ref();
  const categoryMenu = ref([]);
  const isLoading = ref(false);
  const isEditing = ref(false);
  const editName = ref('');
  const editNameCache = ref('');
  const isDraggingFolder = ref(false);

  const setMenuRef = (el, index) => {
    if (el) {
      categoryMenu.value[index] = el;
    }
  };

  const isThemeBlue = computed(() => themeSetting.themeColor === '#026AC8');

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

  const createPageButtonLabel = computed(() => {
    return moduleTabLabelEnum[siderTab.value!] || moduleTabLabelEnum[props.tabs[0].code];
  });

  const getTabSearch = computed(() => {
    return moduleTabSearchEnum[siderTab.value!] || moduleTabSearchEnum[props.tabs[0].code];
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

  const handleSelectInput = () => {
    setTimeout(() => {
      const inputElement = document.querySelector(`.${INPUT_CLASS} input`) as HTMLInputElement;
      inputElement?.select();
    }, 100);

    isEditing.value = true;
  };

  const getFilterTree = () => {
    const key = searchKey.value.trim().toLowerCase();
    if (key) {
      filteredTreeData.value = cloneDeep(
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
      filteredTreeData.value = cloneDeep(treeData.value);
    }
  };

  const handleSearchKeyChange = (e: any) => {
    const { value } = e.target;

    if (value.length < searchKeyCache.value.length) {
      getFilterTree();
    }

    searchKeyCache.value = value;
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
        filteredTreeData.value = cloneDeep(treeData.value);
      }
    },
  );

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

  const handleCreateCategoryClick = () => {
    editName.value = INPUT_DEFAULT_VALUE;
    editNameCache.value = INPUT_DEFAULT_VALUE;
    treeMap.value[MOCK_NEW_ID] = INPUT_DEFAULT_VALUE;

    filteredTreeData.value.unshift({
      id: MOCK_NEW_ID,
      name: INPUT_DEFAULT_VALUE,
      index: 0,
      isEdit: true,
      children: [],
    });

    handleSelectInput();
  };

  const handleInPlaceInputBlur = async (node: any) => {
    const { id } = node;
    const name = editName.value.trim();
    const formData = { name, module: siderTab.value };
    const isCreate = id === MOCK_NEW_ID;

    // 编辑时未修改，不走接口
    if (!isCreate && (!name || name === editNameCache.value)) {
      node.isEdit = false;
      isEditing.value = false;
      return;
    }

    // 新建时若清空输入框，要求继续创建
    if (isCreate && !name) {
      formData.name = '新分类';
    }

    try {
      isLoading.value = true;
      if (isCreate) {
        await postCategory(formData);
      } else {
        await putCategoryById({ id }, formData);
      }
      treeMap.value[id] = name;
      node.isEdit = false;
      isLoading.value = false;
      isEditing.value = false;
      initTreeData();
    } catch (error) {
      isLoading.value = false;
    }
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
        filteredTreeData.value.forEach((i) => {
          if (i.id === data.id) {
            const { name } = data;
            treeMap[data.id] = name;
            editName.value = name;
            editNameCache.value = name;
            i.isEdit = true;
            handleSelectInput();
          } else {
            i.isEdit = false;
          }
        });
        break;
      case MenuClickEvent.DELETE:
        if (data.children?.length) {
          Modal.warning({
            icon: h(ExclamationCircleOutlined),
            content: t('sys.pageDesigner.deleteNotEmpty'),
            okText: t('sys.org.iKnow'),
          });
          return;
        }

        Modal.confirm({
          title: t('sys.sureToDeleteCategoryWithName', { name: ` ${data[f_title.value]} ` }),
          icon: h(SvgIcon, {
            src: '/assets/card-design/exclamation-circle.svg',
            class: 'anticon',
          }), // 使用h函数
          class: 'delete-page-modal',
          okText: t('sys.ok2'),
          centered: true,
          cancelText: t('sys.cancel'),
          async onOk() {
            await deleteCategory({ ids: data.id });
            initTreeData();
            message.success(t('sys.delSuccess'));
          },
          onCancel() {},
        });

        break;
      case MenuClickEvent.COPY:
        emit('menu-click', {
          key,
          data,
        });
        break;
      case MenuClickEvent.DELETEPAGE:
        emit('menu-click', {
          key: 'delete',
          data,
        });
        break;
      default:
        break;
    }
  };

  const openModelModal = (data, key: MenuClickEvent, event: PointerEvent) => {
    emit('menu-click', { key, data, event });
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
    isDraggingFolder.value = !!node.children;
  };

  const handleExpand = (id, { node }) => {
    if (isDraggingFolder.value && node.children.length) {
      expandedKeys.value = expandedKeys.value.filter((k) => k !== node.id);
    }
  };

  const handleDrop = async (info) => {
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
      return await handleDropConfirm(info);
    }

    const tabInfo = props.tabs.find((tab: SiderTab) => tab.code === siderTab.value);

    if ([CategoryEnum.WEB, CategoryEnum.MOBILE, CategoryEnum.PAD].includes(siderTab.value)) {
      await handleDropConfirm(info);
      return;
    }

    // 模型拖拽需要二次确认
    Modal.confirm({
      title: t('sys.sureMoveSth', {
        sth: tabInfo?.label,
      }),

      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await handleDropConfirm(info);
      },
      onCancel() {},
    });
  };

  const handleDropConfirm = async (info) => {
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

  const onVisibleChange = (visible: boolean, treeId: string) => {
    highlightId.value = visible ? treeId : '';
  };

  const expand = async (node) => {
    if (!expandedKeys.value.includes(node.id)) {
      expandedKeys.value = [...expandedKeys.value, node.id];
      await nextTick();
    }
  };

  function getSelectTreeNode() {
    return selectedTreeNode.node;
  }

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

  onUnmounted(() => {
    reset();
  });

  defineExpose({
    expand,
    handleTabClick,
    getSelectTreeNode,
    initTreeData,
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
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    background: #fff;
    padding: 1px;

    .tab {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      margin-bottom: 1px;
      width: 100%;
      height: 76px;
      transition: all 0.3s;
      color: #5a5f6b;
      font-size: 12px;
      cursor: pointer;

      &:first-child {
        border-top-left-radius: 7px;
      }

      .iconfont {
        margin-bottom: 4px;
        color: #767f92;
        font-size: var(--tab-icon-size, 20px);
        line-height: 1em;
      }

      &:hover {
        background: #f2f5f8;
      }

      &-active,
      &-active:hover {
        background: rgba(from var(--ant-primary-color) r g b / 8%);
        color: var(--ant-primary-color);
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
      padding: 0 12px;

      .tree-header {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: center;
        padding: 16px 4px;
        border-bottom: 1px solid #ddd;

        .tree-sider-page__btn {
          height: 34px;
          color: white;
          border: none;
          background-color: var(--ant-primary-color) !important;
          &:hover {
            background-color: hsl(from var(--ant-primary-color) h s l / 80%) !important;
          }
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
          padding: 16px 4px;

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
          // padding: 0 16px;
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
          color: #1a1d23;
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

        // .ant-dropdown-trigger {
        //   position: absolute;
        //   top: 50%;
        //   right: 5px;
        //   transform: translateY(-50%);
        // }

        &__more {
          border-radius: 4px;
          display: none;
          &:hover {
            background: #fff;
            display: flex;
          }
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
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
    // background-color: rgba(232, 235, 240, 1);
    // background-image: radial-gradient(
    //   circle at center,
    //   rgba(221, 223, 230, 1) 1px,
    //   transparent 1px
    // );
    // background-size: 12px 12px;

    .content-wrapper {
      flex: 1;
      height: 100px;
      background-color: rgba(232, 235, 240, 1);
      background-image: radial-gradient(
        circle at center,
        rgba(221, 223, 230, 1) 1px,
        transparent 1px
      );
      background-size: 12px 12px;
      // padding: 4px 20px 0;
      // background-color: #fff;
    }
  }
  .sort {
    display: none;
  }

  // 修改树样式
  :deep(.tree-instance) {
    .ant-tree-treenode {
      position: relative;
      align-items: center;
      margin-bottom: 4px;
      padding: 6px 8px 6px 4px;
      transition: all 0.3s;
      border-radius: 4px;
      &::before {
        content: ' ';
        position: absolute;
        left: 4px;
        top: 18px;
        transform: translateY(-50%);
        width: 14px;
        height: 14px;
        opacity: 0;
        background-image: url('@/assets/svg/icon_move.svg');
        background-repeat: no-repeat;
      }

      &:hover {
        &::before {
          opacity: 1;
        }
        background: #f5f5f5;
        .sort {
          display: block;
        }
        .tree-node__more {
          display: flex;
        }

        .tree-node__title {
          padding-right: 12px;
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
        width: 34px;
        height: 24px;
        padding-right: 4px;
        line-height: 24px;

        .ant-tree-switcher-icon {
          color: #5a5f6b;
          font-size: 14px;
        }
      }

      // &:has(.tree-node.is-highlight) {
      //   background: #f5f5f5;
      // }

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
