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
    <div :class="[ns.e('tree-container')]">
      <TreeEx
        v-if="treeData.length"
        :class="[ns.e('tree')]"
        ref="treeExRef"
        :draggable="true"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="selfExpandedKeys"
        :data="treeData"
        last-selection-locked
        :filter="searchKey"
      >
        <template #title="{ node }">
          <div :class="[ns.b('tree-node')]">
            <span :class="[ns.be('tree-node', 'title')]" :title="node.title">{{ node.title }}</span>
          </div>
        </template>
      </TreeEx>
    </div>
  </div>
</template>

<script lang="ts" setup name="product-family-sider">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { onMounted, computed, ref, watch } from 'vue';
  import { TreeEx, TreeExInstance, ITreeNode } from '/@/components/TreeEx';
  import { getProductFamily } from '../logic/use-model-service';

  const ns = useNamespace('product-family-sider');
  const AllKey = '__All__' as const;

  const props = withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
  }>();

  const selectedKeys = computed({
    get() {
      return props.value ? [props.value] : [AllKey];
    },
    set(v) {
      let value = v?.[0];
      if (value === AllKey) {
        value = undefined;
      }
      emit('update:value', value);
    },
  });
  const selfExpandedKeys = ref<string[]>([AllKey]);
  const searchKey = ref();
  const treeExRef = ref<TreeExInstance>();

  const { t } = useI18n() as any;

  const treeData = ref<ITreeNode[]>([]);

  const load = async () => {
    const rootNode: ITreeNode = {
      key: AllKey,
      title: '全部',
      children: [],
    };
    const res = await getProductFamily();
    if (res?.data) {
      rootNode.children = res.data.map((item: any) => {
        return {
          key: item.id_,
          title: item.name_,
        };
      });
    }
    treeData.value = [rootNode];
  };

  onMounted(async () => {
    await load();
  });

  watch(
    treeExRef,
    () => {
      // 第一次的时候展开所有
      treeExRef.value?.expandAll();
    },
    { immediate: true },
  );
</script>

<style lang="scss" scoped>
  $product-family-sider: (
    height: 100%,
    width: 222px,
  );

  @include b(product-family-sider) {
    @include set-component-css-var(product-family-sider, $product-family-sider);
    height: getCssVar(product-family-sider, height);
    width: getCssVar(product-family-sider, width);
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

    @include e(title) {
      font-weight: 500;
      color: #000000;
    }

    @include e(add) {
      color: var(--ant-primary-color);
      line-height: 20px;
      padding: 0;
      height: 36px;
      > i,
      > span {
        vertical-align: middle;
      }
      i {
        font-size: 9px;
        padding-right: 2px;
      }
    }

    :deep(.#{bem(product-family-sider, tree)}) {
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
        &:hover,
        &-selected,
        &:has(.is-highlight) {
          background: rgba(from var(--ant-primary-color) r g b / 8%);
          .#{bem(product-family-sider-tree-node,more)} {
            display: block;
          }
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

  @include b(product-family-sider-tree-node) {
    display: flex;
    position: relative;
    align-items: center;
    flex: 0 0 auto;
    padding-right: 12px;

    @include e(title) {
      flex-grow: 1;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
