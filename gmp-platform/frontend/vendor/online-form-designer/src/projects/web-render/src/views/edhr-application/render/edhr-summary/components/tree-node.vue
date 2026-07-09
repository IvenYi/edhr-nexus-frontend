<template>
  <div>
    <a-input
      v-click-outside="onNameBlur"
      ref="inputRef"
      v-if="nodeData.isEdit"
      v-model:value="nodeData.name_"
      size="small"
      :allowClear="false"
      @blur="onNameBlur"
      @click.stop
    />
    <div v-else class="ks-row overflow-hidden" :class="[data.source_root_ && 'related-outline']">
      <div
        class="ks-col ell overflow-hidden node-title"
        :class="[
          data.type_ === OutlineType.DOC && 'node-doc',
          `level-${outlineMaps[data.id_]?.split('-')?.length}`,
        ]"
        :title="data.name_"
      >
        <span v-if="data.type_ === OutlineType.DOC" class="dot-doc"></span>
        <span v-else>{{ outlineMaps[data.id_] }}.</span>
        {{ data.name_ }}
      </div>
      <div class="edit-icon" @click.stop>
        <i
          v-if="data.type_ === OutlineType.DOC"
          class="iconfont icon-Frame mr8px text-[var(--ant-primary-color)]"
          :title="$t('sys.edhr.instList')"
          @click.stop="changeInstanceVisible(!instanceVisible)"
        ></i>
        <template v-if="!disabled">
          <Dropdown
            v-if="data.type_ === OutlineType.OUTLINE"
            :trigger="['click']"
            :drop-menu-list="NodeAddMenus"
            @menu-event="(e) => doAction(e.event)"
          >
            <i class="iconfont icon-pad_icon_add_blue mx8px text-14px! text-[#1A1D23]"></i>
          </Dropdown>
          <Dropdown
            overlayClassName="edhr-summary-more-dropdown"
            :trigger="['click']"
            :drop-menu-list="NodeMoreMenus"
            @menu-event="(e) => doAction(e.event)"
          >
            <i class="iconfont icon-gengduo2 text-14px! text-[#1A1D23]"></i>
          </Dropdown>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { message, Modal } from 'ant-design-vue';
  import { ref, computed, nextTick } from 'vue';
  import { useEdhrSummary } from '../hook/useEdhrSummary';
  import { OutlineType } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { NodeAddMenus, NodeMoreMenus, OutlineActionType } from './constant';
  import { Dropdown } from '/@/components/Dropdown/index';
  import vClickOutside from '/@/directives/clickOutside';

  const props = defineProps<{
    data: any;
    disabled: boolean;
  }>();

  const {
    newOutLine,
    catalogTreeData,
    findTreeNode,
    deleteTreeNode,
    curStatistics,
    instanceVisible,
    changeInstanceVisible,
  } = useEdhrSummary();

  const inputRef = ref();

  const nodeData: any = computed(() => {
    const obj = findTreeNode(props.data.id_);
    return obj;
  });

  const outlineMaps = computed(() => {
    const m = getOutlineMaps(catalogTreeData.value, []);
    return m;
  });

  function getOutlineMaps(data, maps = {}, idxPath: number[] = []) {
    let i = 0;
    data.forEach((e) => {
      if (e.type_ === OutlineType.OUTLINE) {
        i++;
        maps[e.id_] = [...idxPath, i].join('-');
        if (e.children?.length) {
          getOutlineMaps(e.children, maps, [...idxPath, i]);
        }
      }
    });
    return maps;
  }

  const onNameBlur = () => {
    if (!nodeData.value.name_ || !nodeData.value.name_.trim()) {
      message.warning('名称不能为空');
      inputRef.value.focus();
      return;
    }
    if (hasSameName(nodeData.value.name_, nodeData.value.id_)) {
      message.warning('名称不能重复');
      inputRef.value.focus();
      return;
    }
    nodeData.value.isEdit = false;
  };

  function hasSameName(name, id, data = catalogTreeData.value) {
    return data.some((e) => {
      if (e.id_ !== id && e.name_ && name && e.name_ === name) return true;
      if (e.children && e.children.length) return hasSameName(name, id, e.children);
      return false;
    });
  }

  function hasEmptyName(data = catalogTreeData.value) {
    return data.some((e) => {
      if (e.isEdit) return true;
      if (e.children && e.children.length) return hasEmptyName(e.children);
      return false;
    });
  }

  const doAction = async (actionKey: OutlineActionType) => {
    if (hasEmptyName()) return;
    switch (actionKey) {
      case OutlineActionType.NEW_OUTLINE:
        onNewOutline();
        break;
      case OutlineActionType.NEW_DOC:
        // emit('new-doc');
        onNewFormTmpl();
        break;
      case OutlineActionType.RENAME:
        nodeData.value.isEdit = true;
        nextTick(() => {
          inputRef.value?.focus();
        });
        if (!nodeData.value.id_.includes('tmpl_')) {
          nodeData.value.isUpdate = true;
        }
        break;
      case OutlineActionType.DELETE:
        Modal.confirm({
          title: $t('sys.edhr.confirmToDelete'),
          // content: '是否确认删除？',
          okText: $t('sys.okText'),
          onOk: () => {
            deleteTreeNode([props.data]);
          },
        });
        break;
      default:
        break;
    }
  };

  function onNewOutline() {
    const newOne = newOutLine({
      parent_id_: nodeData.value.id_,
    });
    if (!newOne) return;
    if (!nodeData.value.children) nodeData.value.children = [];
    nodeData.value.children.push(newOne);
    if (!curStatistics.value.expandedIds.includes(nodeData.value.id_)) {
      curStatistics.value.expandedIds.push(nodeData.value.id_);
    }
  }

  function onNewFormTmpl() {
    // form_tmpl_id_
  }
  // function deleteDatasetLog(data = catalogTreeData.value) {
  //   data.forEach((item, idx) => {
  //     if (item.id_ === nodeData.value.id_) {
  //       data.splice(idx, 1);
  //       const childIds = findChildIds(item.children);
  //       summaryDeletedIds.value.push(...childIds);
  //       if (!item.id_.includes('tmpl_')) summaryDeletedIds.value.push(item.id_);
  //     } else if (item.children && item.children.length) {
  //       deleteDatasetLog(item.children);
  //     }
  //   });
  //   console.log('summaryDeletedIds', summaryDeletedIds.value);
  // }

  // function findChildIds(data) {
  //   if (!data) return [];
  //   return data.reduce((list, cur) => {
  //     if (!cur.id_.includes('tmpl_')) list.push(cur.id_);
  //     if (cur.children && cur.children.length) list.push(...findChildIds(cur.children));
  //     return list;
  //   }, []);
  // }
</script>
<style lang="less" scoped>
  .node-title.node-doc {
    color: #5a5f6b;
  }

  .selected .node-title {
    color: var(--ant-primary-color);
  }

  .selected .dot-doc {
    background-color: var(--ant-primary-color);
    font-weight: 500;
  }

  .level-1 {
    color: #1a1d23;
    font-weight: bold;
  }

  .level-2 {
    color: #1a1d23;
    font-weight: 500;
  }

  .dot-doc {
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-right: 4px;
    border-radius: 50%;
    background-color: #5a5f6b;
    vertical-align: middle;
  }
</style>
<style lang="less">
  .edhr-summary-more-dropdown {
    .delete-icon .iconfont {
      color: var(--ant-error-color) !important;
    }
  }
</style>
