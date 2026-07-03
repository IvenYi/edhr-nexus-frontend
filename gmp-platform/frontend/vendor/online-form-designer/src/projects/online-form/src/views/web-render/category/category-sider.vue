<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('title-container')]">
      <span :class="[ns.e('title')]">{{ siderTitle }}</span>
      <template v-if="showImport || canCreate">
        <div class="flex actions-toolbar">
          <IconButton
            v-if="canCreate"
            :tooltip="$t('sys.newCategory')"
            icon="icon-pad_icon_add_blue"
            @click="newCategory"
          />
          <IconButton
            v-if="showImport"
            :tooltip="$t('sys.import')"
            icon="gct-iconfont:icon-daochu"
            @click="() => onImport()"
          />
        </div>
      </template>
      <template v-else>
        <a-button v-if="canCreate" type="link" :class="[ns.e('add')]" @click="newCategory">
          <plus-outlined class="icon-plus" />
          {{ $t('sys.newCategory') }}
        </a-button>
      </template>
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
        :class="[ns.e('tree')]"
        ref="treeExRef"
        :draggable="true"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="selfExpandedKeys"
        :data="treeData"
        @drop="onDrop"
        :last-selection-locked="!valueEmpty"
        :filter="searchKey"
        :showLine="true"
        :height="treeHeight"
        :animationKey="animationKey"
      >
        <template #title="{ node }">
          <div
            :class="[
              `node-key-${node.key}`,
              ns.b('tree-node'),
              ns.is('highlight', highlightId === node.key),
              ns.is('folder', node.showFolder),
            ]"
          >
            <span :class="[ns.be('tree-node', 'title')]" :title="node.title">{{ node.title }}</span>
            <a-dropdown
              v-if="canRename || canDelete"
              :class="[ns.be('tree-node', 'more')]"
              @visible-change="(visible) => onVisibleChange(visible, node.key)"
            >
              <ellipsis-outlined />
              <template #overlay>
                <a-menu
                  style="width: 102px"
                  @click="({ key }) => handleMenuClick(node, key as string)"
                >
                  <a-menu-item v-if="canRename" :key="MenuClickEvent.EDIT">{{
                    $t('sys.component.dataConnection.rename')
                  }}</a-menu-item>
                  <a-menu-item v-if="canDelete" :key="MenuClickEvent.DELETE">{{
                    $t('sys.delText')
                  }}</a-menu-item>
                  <a-menu-item v-if="showImport && canDelete" :key="MenuClickEvent.IMPORT">{{
                    $t('sys.import')
                  }}</a-menu-item>
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
  import { useCategory } from '../hooks/useCategory';
  import { CategoryModuleEnum } from '../constant';
  import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue';
  import { TreeExDropEvent, TreeEx, TreeExInstance, ITreeNode } from '/@/components/TreeEx';
  import { recursiveTransfer } from '/@/utils/recursive';
  import { IconButton } from '/@online-form/components/ui';

  enum MenuClickEvent {
    EDIT = 'edit',
    DELETE = 'delete',
    IMPORT = 'import',
  }

  const ns = useNamespace('category-sider');

  const props = withDefaults(
    defineProps<{
      module: CategoryModuleEnum;
      value?: string;
      siderTitle: string;
      canCreate?: boolean;
      canRename?: boolean;
      canDelete?: boolean;
      deleteConfirm?: (node) => Promise<boolean>;
      /** 选中项可以为空 */
      valueEmpty?: boolean;
      /** 是否显示导入操作 */
      showImport?: boolean;
    }>(),
    {
      canCreate: true,
      canRename: true,
      canDelete: true,
      showImport: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'import', categoryKey?: string): void;
  }>();

  const onImport = (categoryKey?: string) => {
    emit('import', categoryKey);
  };

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
  const { load, createCategory, editCategory, deleteCategory, dragCategory, categoryTreeData } =
    useCategory({
      module: props.module,
    });

  const highlightId = ref<string>('');
  const onVisibleChange = (visible: boolean, treeId: string) => {
    highlightId.value = visible ? treeId : '';
  };

  const treeData = computed(() => {
    return recursiveTransfer(categoryTreeData.value || [], (item, resolveChild) => {
      const node: ITreeNode = {
        key: item.id!,
        title: item.name!,
        sortNum: item.sortNum!,
        showFolder: !item.parentId || item.parentId === 'ROOT',
      };
      if (item.child) {
        node.children = resolveChild(item.child);
      }
      return node;
    });
  });

  onMounted(async () => {
    getTreeHeight();
    await load();
    // 没有选中分类的时候，默认抛出第一个分类
    if (!props.value && !props.valueEmpty) {
      emit('update:value', treeData.value[0]?.key);
    }
    window.addEventListener('resize', getTreeHeight);
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
    if (after.prevNode) {
      targetSortNum = after.prevNode.sortNum! + 1;
    } else if (after.nextNode) {
      targetSortNum = after.nextNode.sortNum!;
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
        await editCategory(node.key);
        break;
      case MenuClickEvent.DELETE:
        if (props.deleteConfirm) {
          const allowDelete = await props.deleteConfirm(node);
          if (!allowDelete) {
            // 确认不删除时直接返回
            return;
          }
        }
        const currentSelectedKey = selectedKeys.value?.[0];
        const res = await deleteCategory(node.key);
        if (res && currentSelectedKey === node.key) {
          // 删除的是现在选中的节点时，删除成功后选中第一个节点
          selectedKeys.value = [treeData.value[0].key];
        }
        break;
      case MenuClickEvent.IMPORT:
        await onImport(node.key);
        break;
    }
  };

  const newCategory = async () => {
    const data = await createCategory({ parentId: selectedKeys.value?.[0] });
    if (data.parentId) {
      selfExpandedKeys.value.push(data.parentId);
    }
    if (!data?.id) {
      return;
    }
    animationKey.value = data.id;
  };

  const refresh = async () => {
    await load();
  };

  function getTreeHeight() {
    const wrapperDiv = document.querySelector(`.${ns.e('tree-container')}`);
    if (wrapperDiv) {
      treeHeight.value = wrapperDiv.clientHeight - 16;
    }
  }

  defineExpose({
    refresh,
  });
</script>

<style lang="scss" scoped>
  $category-sider: (
    height: 100%,
    width: 222px,
  );

  .actions-toolbar {
    margin-right: -5px;
  }

  @include b(category-sider) {
    @include set-component-css-var(category-sider, $category-sider);
    height: getCssVar(category-sider, height);
    width: getCssVar(category-sider, width);
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    border: 1px solid #eaedf1;

    :deep(.ant-dropdown-menu-item) {
      padding: 5px 20px;
    }

    @include e(search-container) {
      padding: 12px 12px 0 12px;
    }
    @include e(search-input) {
      line-height: 22px;
      padding-left: 16px;
    }

    @include e(title-container) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #eaedf1;
    }

    @include e(tree-container) {
      flex-grow: 1;

      padding: 8px 0;
      overflow: hidden;
    }

    @include e(title) {
      font-weight: 500;
      color: #000000;
      font-size: 16px;
    }

    @include e(add) {
      color: var(--ant-primary-color);
      line-height: 20px;
      padding: 0;
      height: 36px;
      > .icon-plus,
      > span {
        vertical-align: middle;
      }
      .icon-plus {
        font-size: 12px;
        margin-right: -4px;
      }
    }

    :deep(.#{bem(category-sider, tree)}) {
      // 箭头样式
      .ant-tree-switcher {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        padding-left: 4px;
        .ant-tree-switcher-icon {
          color: #797a7d;
          font-size: 16px;
        }
      }

      // 节点样式和悬浮，选中样式
      .ant-tree-treenode {
        padding-bottom: 0px;
        padding-left: 16px;
        color: #212528;
        position: relative;
        &::before {
          display: none;
          content: '\e810';
          position: absolute;
          top: 6px;
          left: 4px;
          color: #888 !important;
          font-family: iconfont !important;
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
          font-style: normal;
        }
        &:hover::before {
          display: block;
        }
        &:hover,
        &:has(.is-highlight) {
          // background: unquote('rgba(from var(--ant-primary-color) r g b / 4%)');
          background-color: #f2f5f8;
          .#{bem(category-sider-tree-node,more)} {
            display: block;
          }
        }
        &-selected {
          color: var(--ant-primary-color);
          background: unquote('rgba(from var(--ant-primary-color) r g b / 10%)');
        }
        &:has(.is-folder) {
          // color: #6a717d;
        }
        &-selected {
          .ant-tree-node-content-wrapper {
            // color: var(--ant-primary-color);
          }
        }

        // 节点缩进调整
        // .ant-tree-switcher-noop {
        //   display: none;
        // }
        // &:has(.is-folder) {
        //   .ant-tree-switcher-noop {
        //     display: block;
        //   }
        // }
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
    display: flex;
    position: relative;
    align-items: center;
    flex: 0 0 auto;
    padding-right: 12px;

    @include when(folder) {
      @include e(icon) {
        display: block;
      }
    }

    @include e(icon) {
      margin-right: 8px;
      display: none;
    }

    @include e(title) {
      flex-grow: 1;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @include e(more) {
      display: none;
    }
  }
  :deep(.anticon-caret-down) {
    // color: var(--ant-primary-color) !important;
    color: #8f8f8f !important;
  }
</style>
