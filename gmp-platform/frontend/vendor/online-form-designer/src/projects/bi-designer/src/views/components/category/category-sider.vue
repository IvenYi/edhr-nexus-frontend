<template>
  <div :class="[ns.b()]">
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
    <div :class="[ns.e('title-container')]">
      <span :class="[ns.e('title')]">{{ siderTitle }}</span>
      <a-button v-if="!readonly" type="link" :class="[ns.e('add')]" @click="newCategory">
        <i class="iconfont icon-chuangjian"></i>
        {{ $t('sys.newCategory') }}
      </a-button>
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
        last-selection-locked
        :filter="searchKey ? searchKey.trim() : ''"
        @select="handleSelect"
      >
        <template #title="{ node }">
          <div
            :class="[
              ns.b('tree-node'),
              ns.is('highlight', highlightId === node.key),
              ns.is('folder', node.showFolder),
            ]"
          >
            <SvgIcon
              :class="[ns.be('tree-node', 'icon')]"
              v-if="node.showFolder"
              class="folder"
              size="20"
              name="folder"
            />
            <span :class="[ns.be('tree-node', 'title')]" :title="node.title">{{ node.title }}</span>
            <a-dropdown
              v-if="!readonly && !node.sysBuiltin"
              :class="[ns.be('tree-node', 'more')]"
              @visible-change="(visible) => onVisibleChange(visible, node.key)"
            >
              <ellipsis-outlined />
              <template #overlay>
                <a-menu
                  style="width: 102px"
                  @click="({ key }) => handleMenuClick(node, key as string)"
                >
                  <a-menu-item :key="MenuClickEvent.EDIT">{{
                    $t('sys.component.dataConnection.rename')
                  }}</a-menu-item>
                  <a-menu-item :key="MenuClickEvent.DELETE">{{ $t('sys.delText') }}</a-menu-item>
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
  import { onMounted, computed, ref, watch } from 'vue';
  import { TreeExDropEvent, TreeEx, TreeExInstance, ITreeNode } from '/@/components/TreeEx';
  import { recursiveTransfer } from '/@/utils/recursive';
  import { SvgIcon } from '/@/components/Icon';
  // import { CategoryEnum } from '/@/layouts/tree-sider-page/enum';

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
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'changeValue', value?: string): void;
    (e: 'changeCategory', value?: string): void;
  }>();

  const selectedKeys = ref<any>([]);
  const selfExpandedKeys = ref<string[]>([]);
  const searchKey = ref();
  const treeExRef = ref<TreeExInstance>();

  const { t } = useI18n() as any;
  const { load, createCategory, editCategory, deleteCategoryAPI, dragCategory, categoryTreeData } =
    useCategory({
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
    if (node.dataRef?.children?.length) return;
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
      if (item.children && props.isTree) {
        node.children = resolveChild(item.children);
      }
      return node;
    });
  });

  onMounted(async () => {
    await load();
    // 没有选中分类的时候，默认抛出第一个分类
    if (!selectedKeys.value.length) {
      selectedKeys.value = treeData.value.length ? [treeData.value[0].key] : [];
      emit('update:value', treeData.value[0]?.key);
      if (treeData.value[0]) {
        emit('changeValue', treeData.value[0]);
      }
    }
  });

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
        emit('changeCategory');
        break;
      case MenuClickEvent.DELETE:
        const currentSelectedKey = selectedKeys.value![0];
        const res = await deleteCategoryAPI(node, props.customDelFunc, props.customDelTips);
        if (res && currentSelectedKey === node.key) {
          // 删除的是现在选中的节点时，删除成功后选中第一个节点
          selectedKeys.value = treeData.value.length ? [treeData.value[0].key] : [];
        }
        emit('changeCategory');
        break;
    }
  };

  const newCategory = async () => {
    const data = await createCategory({ parentId: selectedKeys.value?.[0] });
    if (data.parentId) {
      selfExpandedKeys.value.push(data.parentId);
    }
    emit('changeCategory');
  };

  const getCategoryData = () => {
    return treeData.value;
  };

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
      padding: 16px;
    }
    @include e(search-input) {
      line-height: 22px;
      padding-left: 16px;
    }

    @include e(title-container) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px 16px;
    }

    @include e(tree-container) {
      flex-grow: 1;
      border-top: 1px solid #eaedf1;
      padding: 8px 16px 0;
      overflow: auto;
    }

    @include e(title) {
      font-weight: 500;
      color: #000000;
    }

    @include e(add) {
      color: var(--ant-primary-color);
      line-height: 20px;
      padding: 0;
      height: 36px;
      > i {
        vertical-align: top;
      }
      > span {
        vertical-align: middle;
      }
      i {
        font-size: 11px;
        padding-right: 2px;
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
        margin-bottom: 8px;
        color: #212528;
        border-radius: 4px;
        &:hover,
        &-selected,
        &:has(.is-highlight) {
          background: unquote('rgba(from var(--ant-primary-color) r g b / 8%)');
          .#{bem(category-sider-tree-node,more)} {
            display: block;
          }
        }
        &:has(.is-folder) {
          color: #6a717d;
        }
        &-selected {
          .ant-tree-node-content-wrapper {
            color: var(--ant-primary-color);
          }
        }

        // 节点缩进调整
        .ant-tree-switcher-noop {
          display: none;
        }
        &:has(.is-folder) {
          .ant-tree-switcher-noop {
            display: block;
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
</style>
