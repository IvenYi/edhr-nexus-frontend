<template>
  <div class="ks-col ks-column overflow-hidden">
    <a-input
      v-model:value="searchVal"
      :placeholder="$t('sys.searchField')"
      class="search-input-wrap"
    >
      <template #suffix>
        <i class="iconfont icon-sousuoMedpro"></i>
      </template>
    </a-input>
    <div class="ks-col mt13px overflow-auto">
      <div class="field-wrap bg-[#FFFFFF]">
        <a-tree
          v-if="filterTreeData.length"
          v-model:selectedKeys="selectedKeys"
          v-model:checkedKeys="checkedKeys"
          defaultExpandAll
          checkable
          :tree-data="filterTreeData"
          :block-node="true"
          :selectable="false"
          @check="handleCheck"
        >
          <template #title="{ title, key }">
            <div class="ks-row-middle">
              <span class="text-[#242424] ks-col ell" :title="title">
                {{ title }}
              </span>
            </div>
          </template>
        </a-tree>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';

  const props = defineProps<{
    treeData: any[];
    checkedKeys: any[];
  }>();

  const emit = defineEmits(['update:checkedKeys', 'setCheckedNodes']);
  const searchVal = ref();
  const selectedKeys = ref([]);

  const checkedKeys = computed({
    get() {
      return props.checkedKeys;
    },
    set(value) {
      emit('update:checkedKeys', value);
    },
  });

  const filterTreeData = computed(() => {
    const search = searchVal.value ? searchVal.value.trim() : '';
    if (!search) return props.treeData;
    else {
      const list: any[] = [];
      props.treeData.forEach((e: any) => {
        const childs = e.children?.filter((e) => e.title.includes(search)) || [];
        if (childs.length) {
          list.push({ ...e, children: childs });
        } else if (e.title.includes(search)) {
          list.push({ ...e, children: [] });
        }
      });
      return list;
    }
  });

  const handleCheck = (checkedKeys, e) => {
    console.log('handleCheck', checkedKeys, e);
    emit('setCheckedNodes', e);
  };
</script>
<style lang="less" scoped>
  .border {
    border: 1px solid #f0f0f0;
  }
  .field-wrap {
    border-radius: 4px;
    overflow: auto;
  }
  :deep(.ant-tree .ant-tree-node-content-wrapper) {
    padding-left: 0;
  }
  :deep(.ant-tree-checkbox) {
    margin-right: 4px;
  }
  :deep(.ant-tree-treenode) {
    padding: 4px 0;
    &:hover {
      background-color: hsl(from var(--ant-primary-color) h s 95%);
    }

    &.tree-level-1 {
      background-color: #f7f8fa;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      border-top: 1px solid #f0f0f0;

      &:first-child {
        border-top: 0;
      }
    }
    .ant-tree-node-content-wrapper {
      display: block;
      overflow: hidden;
    }
  }
  :deep(.ant-input-affix-wrapper.search-input-wrap) {
    .ant-input,
    .ant-input-suffix {
      line-height: 22px;
    }
    .ant-input::placeholder {
      font-size: 12px;
    }
    .ant-input-suffix {
      .icon-sousuoMedpro {
        font-size: 14px;
        color: #8f8f8f;
      }
    }
  }
  // :deep(.tree-level-1) {
  //   .ant-tree-indent {
  //     width: 0;
  //   }
  // }
  // :deep(.ant-tree-indent) {
  //   width: 12px;
  // }
</style>
