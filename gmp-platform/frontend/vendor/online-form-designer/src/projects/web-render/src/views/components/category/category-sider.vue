<template>
  <div :class="[ns.b()]">
    <div v-if="hasTitle || !readonly" :class="[ns.e('title-container')]">
      <span :class="[ns.e('title')]">{{ siderTitle }}</span>
      <a-button
        v-if="!readonly && hasPerBtns.includes(BasicAction.Insert)"
        type="link"
        :class="[ns.e('add')]"
        @click="newCategory"
      >
        <i class="iconfont icon-chuangjian"></i>
        {{ $t('sys.newCategory') }}
      </a-button>
    </div>
    <div :class="[ns.e('search-container')]">
      <a-input
        :class="[ns.e('search-input')]"
        v-model:value="searchKey"
        :placeholder="t('sys.onlineForm.searchCategory')"
        allowClear
      >
        <template #prefix>
          <i class="iconfont icon-sousuo1"></i>
        </template>
      </a-input>
    </div>
    <div :class="[ns.e('tree-container')]">
      <TreeEx
        v-if="treeData.length"
        :class="[ns.e('tree'), draggable && 'draggable-tree']"
        ref="treeExRef"
        :draggable="draggable"
        :animationKey="animationKey"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="selfExpandedKeys"
        :data="treeData"
        :height="treeHeight"
        @drop="onDrop"
        last-selection-locked
        :filter="searchKey ? searchKey.trim() : ''"
        :ignoreCase="ignoreCase"
        @select="handleSelect"
      >
        <template #title="{ node }">
          <div
            :class="[
              ns.b('tree-node'),
              ns.is('highlight', highlightId === node.key),
              `node-key-${node.key}`,
            ]"
          >
            <!-- <SvgIcon
              :class="[ns.be('tree-node', 'icon')]"
              v-if="node.showFolder"
              class="folder"
              size="20"
              name="folder"
            /> -->
            <span :class="[ns.be('tree-node', 'title')]" :title="node.title">{{ node.title }}</span>
            <a-dropdown
              v-if="
                !readonly &&
                (hasPerBtns.includes(BasicAction.Update) || hasPerBtns.includes(BasicAction.Delete))
              "
              :class="[ns.be('tree-node', 'more')]"
              @visible-change="(visible) => onVisibleChange(visible, node.key)"
            >
              <ellipsis-outlined />
              <template #overlay>
                <a-menu
                  style="width: 102px"
                  @click="({ key }) => handleMenuClick(node, key as string)"
                >
                  <a-menu-item
                    v-if="hasPerBtns.includes(BasicAction.Update)"
                    :key="MenuClickEvent.EDIT"
                    >{{ $t('sys.component.dataConnection.rename') }}</a-menu-item
                  >
                  <a-menu-item
                    v-if="hasPerBtns.includes(BasicAction.Delete)"
                    :key="MenuClickEvent.DELETE"
                    >{{ $t('sys.delText') }}</a-menu-item
                  >
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </TreeEx>
    </div>
  </div>
</template>

<script lang="ts" setup name="category-sider">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { useCategory } from './hooks/useCategory';
  import { CategoryModuleEnum } from './type';
  import { onMounted, computed, ref, watch, onUnmounted } from 'vue';
  import { TreeExDropEvent, TreeEx, TreeExInstance, ITreeNode } from '/@/components/TreeEx';
  import { recursiveTransfer } from '/@/utils/recursive';
  import { SvgIcon } from '/@/components/Icon';
  import { BasicAction } from '/@/enums/authActionEnum';

  enum MenuClickEvent {
    EDIT = 'edit',
    DELETE = 'delete',
  }

  const ns = useNamespace('category-sider');

  const props = withDefaults(
    defineProps<{
      module: CategoryModuleEnum;
      value?: string;
      siderTitle: string;
      readonly: boolean;
      isTree: boolean;
      needFolderIcon: boolean; // 是否需要文件夹图标
      customDelFunc?: any; // 自定义删除函数
      customDelTips?: string; // 自定义删除提示
      hasTitle?: boolean; // 是否隐藏标题
      draggable?: boolean;
      ignoreCase?: number; // 0,1是否忽略大小写
      hasPerBtns: Array<BasicAction>; // 有权限的按钮
    }>(),
    {
      hasTitle: true,
      draggable: true,
      hasPerBtns: [BasicAction.Insert, BasicAction.Update, BasicAction.Delete],
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'changeValue', value?: object): void;
    (e: 'changeCategory', value?: string): void;
  }>();

  const selectedKeys = computed({
    get() {
      return props.value ? [props.value] : undefined;
    },
    set(v) {
      emit('update:value', v?.[0]);
    },
  });
  const selfExpandedKeys = ref<string[]>([]);
  const searchKey = ref();
  const treeExRef = ref<TreeExInstance>();
  const treeHeight = ref();
  const animationKey = ref();
  const { t } = useI18n() as any;
  const {
    load,
    createCategory,
    editCategory,
    deleteCategoryAPI,
    dragCategory,
    categoryTreeData,
    isFormDesign,
  } = useCategory({
    module: props.module,
  });

  const highlightId = ref<string>('');
  const onVisibleChange = (visible: boolean, treeId: string) => {
    highlightId.value = visible ? treeId : '';
  };

  /**
   * 节点选中事件
   */
  const handleSelect = (sKeys, { node }) => {
    // 不可取消选中
    if (sKeys.length === 0) return;
    // 文件夹不可选中
    if (node.dataRef?.children?.length && !isFormDesign) return;
    if (!selfExpandedKeys.value.includes(node.categoryId)) {
      selfExpandedKeys.value.push(node.categoryId);
    }
    emit('changeValue', node.dataRef);
  };

  const treeData = computed(() => {
    return recursiveTransfer(categoryTreeData.value || [], (item, resolveChild) => {
      const node: ITreeNode = {
        key: item.id!,
        title: item.name!,
        sortNum: item.sortNum!,
        showFolder: (item.children && props.isTree) || props.needFolderIcon,
        sysBuiltin: item.sysBuiltin,
      };
      if ((item.children || item.child) && props.isTree) {
        node.children = resolveChild(item.children || item.child);
      }

      return node;
    });
  });

  onMounted(async () => {
    getTreeHeight();
    await load();
    // 没有选中分类的时候，默认抛出第一个分类
    if (!props.value) {
      emit('update:value', treeData.value[0]?.key);
      if (treeData.value[0]) {
        emit('changeValue', treeData.value[0]);
      }
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', getTreeHeight);
  });

  watch(
    treeExRef,
    () => {
      // 第一次的时候展开所有
      treeExRef.value?.expandAll();
    },
    { immediate: true },
  );

  /**
   * 拖拽事件处理
   * @param dragNode
   * @param after
   */
  const onDrop = async ({ dragNode, after }: TreeExDropEvent) => {
    let targetSortNum = 1;
    if (after.nextNode) {
      targetSortNum = after.nextNode.sortNum! + 1;
    } else if (after.prevNode) {
      targetSortNum = after.prevNode.sortNum!;
    }
    await dragCategory({
      id: dragNode.key,
      targetParentId: after.parent?.key,
      targetSortNum: targetSortNum,
    });
  };

  const handleMenuClick = async (node: ITreeNode, key: string) => {
    switch (key) {
      case MenuClickEvent.EDIT:
        await editCategory(node);
        onVisibleChange(false, node.key);
        break;
      case MenuClickEvent.DELETE:
        const currentSelectedKey = selectedKeys.value![0];
        const res = await deleteCategoryAPI(node, props.customDelFunc, props.customDelTips);
        onVisibleChange(false, node.key);
        if (res && currentSelectedKey === node.key) {
          // 删除的是现在选中的节点时，删除成功后选中第一个节点
          selectedKeys.value = treeData.value.length ? [treeData.value[0].key] : [];
          emit('changeValue', treeData.value[0]);
        }
        break;
    }
  };

  const newCategory = async () => {
    const data = await createCategory();
    onVisibleChange(false, '');
    if (data?.parentId) {
      selfExpandedKeys.value.push(data.parentId);
    }
    selectedKeys.value = treeData.value.length ? [treeData.value[0].key] : [];
    emit('changeValue', treeData.value[0]);
    if (!data?.id) {
      return;
    }
    animationKey.value = data.id;
  };

  const getCategoryData = () => {
    return treeData.value;
  };

  function getTreeHeight() {
    const wrapperDiv = document.querySelector(`.${ns.e('tree-container')}`);
    if (wrapperDiv) {
      treeHeight.value = wrapperDiv.clientHeight - 16;
    }
  }

  defineExpose({
    getCategoryData,
  });
</script>

<style lang="scss" scoped>
  $category-sider: (
    height: 100%,
    width: 222px,
  );

  @include b(category-sider) {
    @include set-component-css-var(category-sider, $category-sider);

    @include e(search-container) {
      padding: 12px;
      border-top: 1px solid #eaedf1;
    }

    @include e(search-input) {
      padding-left: 16px;
      line-height: 22px;
    }

    @include e(title-container) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px 0;
    }

    @include e(tree-container) {
      flex-grow: 1;
      padding: 8px 0;
      overflow: auto;
    }

    @include e(title) {
      color: #000;
      font-size: 16px;
      font-weight: 500;
    }

    @include e(add) {
      height: 36px;
      padding: 0;
      color: var(--ant-primary-color);
      line-height: 20px;

      > i {
        vertical-align: top;
      }

      > span {
        vertical-align: middle;
      }

      i {
        padding-right: 2px;
        font-size: 11px;
      }
    }

    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    width: getcssvar(category-sider, width);
    height: getcssvar(category-sider, height);
    border: 1px solid #eaedf1;

    :deep(.ant-dropdown-menu-item) {
      padding: 5px 20px;
    }

    :deep(.#{bem(category-sider, tree)}) {
      // 箭头样式
      .ant-tree-switcher {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        // padding-left: 4px;

        .ant-tree-switcher-icon {
          color: #797a7d;
          font-size: 16px;
        }
      }

      // 节点样式和悬浮，选中样式
      .ant-tree-treenode {
        // margin-bottom: 8px;
        padding-bottom: 0;
        padding-left: 16px;
        border-radius: 4px;
        color: #212528;

        &:hover,
        &:has(.is-highlight) {
          background: unquote('rgba(from var(--ant-primary-color) r g b / 8%)');
          .#{bem(category-sider-tree-node,more)} {
            display: block;
          }
        }

        &-selected {
          background: unquote('rgba(from var(--ant-primary-color) r g b / 8%)');
        }

        &:has(.is-folder) {
          color: #6a717d;
        }

        // 节点缩进调整
        .ant-tree-switcher-noop {
          display: none;
        }

        &:has(.is-folder) {
          .ant-tree-switcher-noop {
            // display: block;
          }
        }

        .ant-tree-indent-unit {
          width: 20px;
        }
      }

      // 去除原有的hover样式
      .ant-tree-node-content-wrapper {
        width: 100px;
        padding-right: 0;
        line-height: 36px;

        &:hover {
          background: transparent;
        }
      }

      .ant-tree-node-selected {
        background-color: transparent;
      }
    }
  }

  @include b(category-sider-tree-node) {
    // &::before {
    //   display: none;
    //   content: '\e810';
    //   position: absolute;
    //   top: 0px;
    //   left: -16px;
    //   color: #888 !important;
    //   font-family: iconfont !important;
    //   font-size: 16px;
    //   -webkit-font-smoothing: antialiased;
    //   font-style: normal;
    // }
    // &:hover::before {
    //   display: block;
    // }
    @include when(folder) {
      @include e(icon) {
        display: block;
        flex: none;
        text-align: center;
      }
    }

    @include e(icon) {
      display: none;
      margin-right: 8px;
    }

    @include e(title) {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }

    @include e(more) {
      display: none;

      &:hover {
        color: var(--ant-primary-color);
      }
    }

    display: flex;
    position: relative;
    flex: 0 0 auto;
    align-items: center;
    padding-right: 12px;
  }

  .draggable-tree {
    @include b(category-sider-tree-node) {
      position: relative;

      &::before {
        content: '\e810';
        display: none;
        position: absolute;
        top: 0;
        left: -16px;
        color: #888 !important;
        font-family: iconfont !important;
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        font-style: normal;
      }

      &:hover::before {
        display: block;
      }
    }
  }
</style>
