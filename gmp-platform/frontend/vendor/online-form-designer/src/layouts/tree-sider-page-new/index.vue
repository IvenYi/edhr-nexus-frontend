<template>
  <div class="tree-sider-page">
    <div class="tabs">
      <div
        class="tab"
        :class="{
          'tab-active': n.code === currrentTab,
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
          <div class="tree-header">
            <slot name="tree-header"></slot>
          </div>
          <div class="tree-content">
            <slot name="tree-content">
              <div class="tree-content-filter">
                <a-input
                  class="tree-search"
                  v-model:value="searchKey"
                  placeholder="请搜索"
                  allowClear
                >
                  <template #prefix>
                    <!-- <search-outlined /> -->
                    <i class="iconfont icon-sousuo1"></i>
                  </template>
                </a-input>
                <div class="tree-count">共{{ nodeCount }}个</div>
              </div>
              <a-tree
                class="tree-instance"
                v-if="treeSettings.data.length"
                :selectedKeys="selectedKeys"
                block-node
                draggable
                :expanded-keys="expandedKeys"
                :fieldNames="treeSettings.fieldNames"
                :tree-data="treeSettings.data"
                @dragstart="handleDragStart"
                @drop="handleDrop"
                @select="handleSelect"
                @expand="onExpand"
              >
                <template #title="{ data }">
                  <div class="tree-node">
                    <i v-if="data.children" class="iconfont folder icon-file"></i>
                    <span v-if="data[f_title].indexOf(searchKey) > -1">
                      {{ data[f_title].substr(0, data[f_title].indexOf(searchKey)) }}
                      <span style="color: #f50">{{ searchKey }}</span>
                      {{
                        data[f_title].substr(data[f_title].indexOf(searchKey) + searchKey.length)
                      }}
                    </span>
                    <span v-else>{{ data[f_title] }}</span>

                    <a-dropdown v-if="data.children" class="tree-node__more">
                      <ellipsis-outlined />
                      <template #overlay>
                        <a-menu @click="({ key }) => handleMenuClick(data, key)">
                          <a-menu-item :key="MenuClickEvent.NEW">新建</a-menu-item>
                          <template v-if="!data.isDefault">
                            <a-menu-item :key="MenuClickEvent.EDIT">编辑</a-menu-item>
                            <a-menu-item :key="MenuClickEvent.DELETE">删除</a-menu-item>
                          </template>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </div>
                </template>
              </a-tree>
            </slot>
          </div>
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
  import { Ref, ref, computed, watch, onMounted, nextTick } from 'vue';
  import { PlusOutlined, SearchOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
  import { MenuClickEvent } from './enum';
  import { useTreeSiderPage } from '../tree-sider-page/useTreeSiderPage';
  import type {
    AntTreeNodeDragEnterEvent,
    AntTreeNodeDropEvent,
    TreeDataItem,
    TreeProps,
  } from 'ant-design-vue/es/tree';
  import { useI18n } from '/@/hooks/web/useI18n';

  // import Sortablejs from 'sortablejs';
  const { t } = useI18n();

  const { setTreeSelected, setTreeSiderTab } = useTreeSiderPage();

  const props = defineProps({
    tabs: Array,
    treeProps: {
      type: Object,
    },
  });
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

  const treeVisible = ref<boolean>(true);
  const treeToggleTooltipVisible = ref<boolean>(false);

  const emit = defineEmits(['tab-change', 'node-change', 'menu-click', 'after-drop']);

  const currrentTab = ref(props.tabs[0].code);
  const selectedKeys = ref<Array<number | string>>([]);

  const searchKey = ref('');
  const expandedKeys = ref<(string | number)[]>([]);

  // 节点数量统计
  const nodeCount = computed(() => {
    return props.treeProps!.data.reduce((total, item) => {
      return total + item[treeSettings.value.fieldNames.children].length;
    }, 0);
  });

  // 平铺数据，并添加_pid_属性，目前仅支持两级节点
  const dataList = computed(() => {
    return props.treeProps!.data.reduce((list, item) => {
      list.push(item);
      const nodes = item[treeSettings.value.fieldNames.children].map((ele) => {
        return {
          ...ele,
          _pid_: item.id,
        };
      });
      list.push(...nodes);
      return list;
    }, []);
  });

  // watch(
  //   () => props.treeProps.data,
  //   async () => {
  //     await nextTick();
  //     var el = document.querySelector('.tree-sider-page__tree .ant-tree-list-holder-inner');
  //     var sortable = Sortablejs.create(el, {
  //       group: 'tree-folder',
  //     });
  //   },
  // );

  watch(searchKey, (value) => {
    const expanded = dataList.value
      .filter((item) => item[treeSettings.value.fieldNames.title].indexOf(value) > -1 && item._pid_)
      .map((item) => item._pid_);
    expandedKeys.value = expanded;
  });

  const onExpand = (keys: string[]) => {
    expandedKeys.value = keys;
  };

  /**
   * 左侧tab点击事件
   */
  const handleTabClick = (tab) => {
    if (currrentTab.value === tab.code) {
      return;
    }
    currrentTab.value = tab.code;

    setTreeSiderTab(tab.code);
    emit('tab-change', tab.code);
  };

  /**
   * 下拉菜单点击事件
   */
  const handleMenuClick = (data, key) => {
    window.console.log(data, key);
    emit('menu-click', {
      data,
      key,
    });
  };

  /**
   * 节点选中事件
   */
  const handleSelect = (sKeys, { node }) => {
    console.log(sKeys);
    // 不可取消选中
    if (sKeys.length === 0) return;
    selectedKeys.value = sKeys;
    // 点击文件夹
    // 点击节点
    emit('node-change', node);
    setTreeSelected(sKeys, node.dataRef);
  };

  const setSelected = (key, node) => {
    selectedKeys.value = ['number', 'string'].includes(typeof key) ? [key] : key;
    setTreeSelected(selectedKeys.value, node);
  };

  const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
    data?.forEach((item, index) => {
      if (item[f_key.value] === key) {
        return callback(item, index, data);
      }
      if (item.children) {
        return loop(item.children, key, callback);
      }
    });
  };

  const handleDragStart = ({ node }) => {
    // 仅支持分类拖拽 实际这么写没什么用
    // if (!node[f_children.value]) {
    //   return Promise.reject();
    // }
  };

  const handleDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const dragIsNode = dataList.value.find((item) => item.id === dragKey)?._pid_;
    const dropIsNode = dataList.value.find((item) => item.id === dropKey)?._pid_;

    if (dragIsNode || dropIsNode) return;

    if (!info.dropToGap) {
      // Drop on the content
      loop(props.treeProps.data, dropKey, (item: TreeDataItem) => {
        window.console.log('item xxxx', item);
      });
    } else {
      loop(props.treeProps.data, dropKey, (_item: TreeDataItem) => {
        window.console.log('_item', _item);
        if (dropPosition === -1) {
          emit('after-drop', { id: dragKey, targetSortNum: _item.sortNum + 1 });
        } else {
          emit('after-drop', { id: dragKey, targetSortNum: _item.sortNum });
        }
      });
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

  defineExpose({
    setSelected,
  });
</script>

<style scoped lang="less">
  @primary-theme-color: var(--ant-primary-color);
  .tree-sider-page {
    display: flex;
    height: 100%;
    width: 100%;
    background: #eff3f9;
    padding: 16px;
    box-sizing: border-box;
  }

  .tabs {
    width: 48px;
    border-right: 1px solid #ddd;
    flex: none;
    background: #fff;

    .tab {
      height: 60px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid #ddd;
      cursor: pointer;
      color: #333;
      transition: all 0.3s;

      &:hover {
        background: #efefef;
      }

      .iconfont {
        color: #7f8695;
        line-height: 1em;
      }

      &-active {
        background: #efefef;
        color: @primary-theme-color;
        .iconfont {
          color: @primary-theme-color;
        }
      }
    }
  }

  .tree-sider-page__tree {
    @tree-width: 260px;
    width: @tree-width;
    flex: none;
    background: #fff;
    margin-right: 10px;
    position: relative;
    transition: all 0.3s;

    &.tree--hidden {
      width: 0;

      .tree-sider-page__tree-toggle {
        transform: translate3d(50%, -50%, 0) rotate(180deg);
      }
    }

    &-toggle {
      height: 28px;
      width: 28px;
      border-radius: 50%;
      border: 1px solid #d9d9d9;
      position: absolute;
      top: 50%;
      right: 0;
      background: #fff;
      transform: translate3d(50%, -50%, 0);
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      .iconfont {
        line-height: 1em;
        font-size: 12px;
        color: #666;
      }
    }

    &-box {
      width: 100%;
      overflow: hidden;
    }

    &-content {
      width: @tree-width;
      .tree-header {
        height: 60px;
        border-bottom: 1px solid #ddd;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tree-node {
        position: relative;
        display: flex;

        .folder {
          height: 24px;
          width: 24px;
          display: block;
          color: #ffcc66;
        }

        .ant-dropdown-trigger {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
        }

        &__more {
          display: none;
        }
      }

      .tree-content-filter {
        padding: 16px;
        display: flex;
        align-items: center;
        .tree-count {
          font-size: 12px;
          margin-left: 8px;
          flex: none;
        }
      }
    }
  }

  .content {
    flex: 1;
    width: 1px;
    display: flex;
    flex-direction: column;
    .content-wrapper {
      height: 100px;
      flex: 1;
      background-color: #fff;
    }
  }

  // 修改树样式
  :deep(.tree-instance) {
    .ant-tree-treenode {
      padding: 8px 0;
      transition: all 0.3s;

      &:hover {
        background: #f5f5f5;
        .tree-node__more {
          display: block;
        }
      }

      &-selected {
        background: rgba(13, 170, 156, 0.08) !important;
        color: @primary-theme-color !important;
        .ant-tree-node-selected {
          background-color: transparent;
        }
      }
    }
  }
</style>
./enum
