<template>
  <SelectLayout
    class="export-tmpl"
    :title="$t('sys.onlineForm.mySelectedForms')"
    :is-empty="!selectedData.length"
  >
    <template #left>
      <SelectTable
        ref="selectTable"
        :selected="selectedData"
        @update:selected="onSelectedChange"
        :moduleType="CategoryModuleEnum.ONLINE_FORM"
        :multiple="true"
        :checkStrictly="false"
        :showColumns="['name', 'description']"
        :queryParams="{
          operatingState: undefined,
        }"
      />
    </template>
    <template #right>
      <TreeEx
        class="export-tmpl__list"
        ref="treeExRef"
        :data="rightTreeData"
        v-model:expanded-keys="treeExpandKeys"
        :selected-keys="[]"
        defaultExpandAll
      >
        <template #title="{ node }">
          <span class="export-tmpl__node" :key="node.id">
            <span class="export-tmpl__node-title">
              <span class="ell" :title="node.title">
                {{ node.title }}
              </span>
              <span v-if="node.isSelectedAll" class="select-all-icon">{{ $t('sys.all') }}</span>
            </span>
            <i
              v-if="!node.children || !treeExpandKeys.includes(node.key)"
              class="gct-iconfont icon-guanbi-danchuang export-tmpl__remove-icon"
              @click.stop="onRemove(node)"
            ></i>
          </span>
        </template>
      </TreeEx>
    </template>
  </SelectLayout>
</template>

<script lang="ts" setup name="export-tmpl">
  import SelectLayout from './select-layout.vue';
  import { ref, watch, computed, onMounted, watchEffect } from 'vue';
  import { isEqual } from 'lodash-es';
  import SelectTable from '/@page-designer/components/widgets/web/field/tmpl-tree-select/component/select-table.vue';
  import { CategoryModuleEnum } from '/@online-form/views/web-render/constant';
  import { ITreeNode, TreeEx } from '/@/components/TreeEx';
  import { modalConfirm } from '/@/components/ui';

  const props = withDefaults(
    defineProps<{
      hasSelected: boolean;
    }>(),
    {
      hasSelected: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:hasSelected', val: boolean): void;
  }>();

  const checkedKeys = ref<string[]>([]);
  const selectedData = ref<Array<any>>([]);
  const selectTable = ref();
  const rightTreeData = ref<ITreeNode[]>();
  const treeExpandKeys = ref<string[]>([]);

  // 抛出是否选中数据
  watchEffect(() => {
    const map: Record<string, ITreeNode> = {};
    const allSelectedKeys: string[] = selectedData.value.map((item) => item.id);
    selectedData.value.forEach((item) => {
      const key = item.children ? item.id : item.baseId;
      let parent = map[key];
      if (!parent) {
        map[key] = {
          key: key,
          title: item.name,
          isSelectedAll: false,
          children: [],
        };
        parent = map[key];
      }
      if (item.children) {
        // 父存在,且所有子节点都被选中时显示全部
        parent.isSelectedAll = item.children.every((item) => allSelectedKeys.includes(item.id));
      } else {
        parent.children!.push({
          key: item.refId,
          title: item.version,
          default: item.default,
          _origin: item,
        });
      }
    });
    rightTreeData.value = Object.values(map);
    console.log('rightTreeData', map);

    emit('update:hasSelected', !!selectedData.value.length);
  });

  const onSelectedChange = (arr) => {
    console.log('onSelectedChange', arr);
    selectedData.value = arr;
  };

  /** 删除选中的分类 */
  const onRemove = async (item) => {
    if (item.children) {
      const isPass = await modalConfirm({
        title: $t('sys.edhr.txnWithWork.deleteConfirm'),
        content: $t('sys.onlineForm.deletingFormTemplateConfirmTip'),
      });
      if (!isPass) {
        return;
      }
    }
    let rows = selectedData.value.filter((row) => row.refId === item.key);
    if (item.children) {
      // 删除父的时候把所有的子过滤出来去删除
      const childrenIds = item.children.map((child) => child.key);
      rows = selectedData.value.filter((row) => childrenIds.includes(row.refId));
    }
    selectTable.value.doRemove(rows);
  };

  /** 获取选中的标识集合 */
  function getSelectedIds() {
    return selectedData.value.filter((item) => !item.children).map((i) => i.refId.split(':')[1]);
  }

  defineExpose({
    getSelectedIds,
  });
</script>

<style lang="less" scoped>
  .export-tmpl {
    :deep(.select-layout__right-body) {
      padding: 14px 16px;
    }
    :deep(.select-layout__left) {
      border-width: 0;
    }
    &__list {
      padding: 16px;
      &-item {
        display: flex;
        justify-content: space-between;
        font-weight: 400;
        font-size: 14px;
        color: #1a1d23;
        & ~ & {
          margin-top: 16px;
        }
      }
    }

    &__remove-icon {
      cursor: pointer;
      font-size: 16px;
      color: #a6a6a6;
    }

    &__node {
      display: flex;
      align-items: center;
      &-title {
        display: flex;
        align-items: center;
        flex-shrink: 1;
        flex-grow: 1;
        width: 1px;
        margin-right: 20px;
      }
    }

    .select-all-icon {
      background: rgba(121, 105, 246, 0.1);
      border-radius: 3px 3px 3px 3px;
      border: 1px solid rgba(121, 105, 246, 0.5);
      font-weight: 400;
      font-size: 12px;
      color: #7969f6;
      padding: 0 6px;
      flex-shrink: 0;
      line-height: 18px;
      margin-left: 4px;
    }
  }
</style>
