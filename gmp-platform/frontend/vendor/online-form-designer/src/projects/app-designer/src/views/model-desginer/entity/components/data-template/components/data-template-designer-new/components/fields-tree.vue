<template>
  <div class="p16px ks-col ks-column overflow-hidden">
    <a-input
      v-model:value="searchVal"
      :placeholder="t('sys.searchField')"
      class="search-input-wrap"
    >
      <template #suffix>
        <i class="iconfont icon-sousuoMedpro"></i>
      </template>
    </a-input>
    <div class="ks-col mt13px overflow-auto border">
      <div class="field-wrap bg-[#FFFFFF]">
        <a-spin :spinning="spinning">
          <a-tree
            v-model:expandedKeys="expandedIds"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedIds"
            checkable
            :tree-data="filterTreeData"
            :block-node="true"
            :fieldNames="{ key: 'id' }"
            :selectable="false"
            @check="onTreeCheck"
          >
            <template #title="{ name, subModel, type, class: clsName, bindField }">
              <div class="ks-row-middle">
                <i class="iconfont mr4px text-[#8F8F8F]" :class="FieldIconMap[type]"></i>
                <span
                  class="text-[#242424] ks-col ell"
                  :title="subModel ? `${bindField.name}(${name})` : name"
                >
                  {{ subModel ? `${bindField.name}(${name})` : name }}
                </span>
                <span
                  v-if="clsName"
                  class="text-[12px] px6px"
                  :class="[!subModel ? 'primary-gct' : 'success-gct']"
                >
                  {{ !subModel ? t('sys.model.viewMainModel') : t('sys.pageDesigner.subTable') }}
                </span>
              </div>
            </template>
          </a-tree>
        </a-spin>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { FieldIconMap } from '/@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    treeData: any[];
    checkedKeys: any[];
    expandedKeys: any[];
    spinning: boolean;
  }>();

  const emit = defineEmits(['on-tree-check', 'update:expandedKeys']);
  const { t } = useI18n();
  const searchVal = ref();
  const selectedKeys = ref([]);

  const spinning = computed(() => {
    return props.spinning;
  });

  const checkedIds = computed(() => {
    return props.checkedKeys;
  });

  const expandedIds = computed({
    get() {
      return props.expandedKeys;
    },
    set(value) {
      emit('update:expandedKeys', value);
    },
  });

  const filterTreeData = computed(() => {
    const search = searchVal.value ? searchVal.value.trim() : '';
    if (!search) return props.treeData;
    else {
      const list: any[] = [];
      props.treeData.forEach((e: any) => {
        const childs = e.children?.filter((e) => e.name.includes(search)) || [];
        if (childs.length) {
          list.push({ ...e, children: childs });
        } else if (e.name.includes(search)) {
          list.push({ ...e, children: [] });
        }
      });
      return list;
    }
  });

  const onTreeCheck = (ckeys, e) => {
    emit('on-tree-check', ckeys, e);
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
  :deep(.tree-level-1) {
    .ant-tree-indent {
      width: 0;
    }
  }
  :deep(.ant-tree-indent) {
    width: 12px;
  }
</style>
