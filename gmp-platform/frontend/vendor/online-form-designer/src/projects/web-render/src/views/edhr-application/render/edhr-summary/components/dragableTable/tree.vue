<template>
  <a-table
    ref="dragableTableRef"
    rowKey="uuid"
    :class="[tableClass]"
    :data-source="tableData"
    :columns="tableColumns"
    :loading="loadingRight"
    :pagination="false"
    :key="draggableRows.length"
    :expandIconColumnIndex="1"
    :scroll="{
      y: `${(height || 600) - 45}px`,
      x: tableData?.length > 0 ? 1100 : undefined,
    }"
    :rowClassName="rowClassName"
    size="middle"
    @resizeColumn="handleResizeColumn"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'sort'">
        <i
          v-show="!record.associated && record.instanceStatus === InstanceStatusValues.SUMMARIZED"
          class="iconfont icon-tuozhuai1"
        ></i>
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <a type="link" @click.stop="onView(record)">{{ $t('sys.viewSth', { sth: 'DHR' }) }}</a>
      </template>
      <template v-if="column.dataIndex === 'instanceStatus'">
        <EnumTagLabel :value="record.instanceStatus" model="EdhrInstanceStatusEnum" />
      </template>
    </template>
    <template #emptyText>
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </template>
  </a-table>
</template>
<script setup lang="ts">
  import { useEdhrSummary } from '../../hook/useEdhrSummary';
  import { InstanceStatusValues } from '/@online-form/views/integration/apaas_ebr/index';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/hooks/index';
  import { Empty } from 'ant-design-vue';
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import Sortable from 'sortablejs';
  import { cloneDeep } from 'lodash-es';
  import EnumTagLabel from '/@app-designer/components/collapse-detail/components/enum-tag-label.vue';

  const props = defineProps<{
    data: any[];
    height?: number;
    tableClass?: string;
    columns: any[];
  }>();

  const relateTreeId = ref<any>();
  const isBefore = ref<boolean>(false);
  const { openFillWikiFullScreenModal } = useApaasEbr();
  const dragNode = ref<any>({});

  const {
    findTreeNode,
    notAllowToList,
    loadingRight,
    readonlySummary,
    catalogTreeData,
    updateTreeData,
    OutlineType,
    getEdhrOutlineData,
    newOutLine,
    edhrInfo,
    updateTreeNode,
    curStatistics,
  } = useEdhrSummary();

  const tableData = computed(() => {
    return props.data;
  });

  const draggableRows = computed(() => {
    return getDraggableRows(props.data);
  });

  const tableColumns = ref<any[]>(props.columns);
  // const tableColumns = computed(() => {
  //   const cls = [...(props.columns || [])];
  //   cls.push({
  //     title: '操作',
  //     key: 'operation',
  //     dataIndex: 'operation',
  //     width: 90,
  //     align: 'center',
  //     fixed: 'right',
  //   });
  //   if (!readonlySummary.value) {
  //     cls.unshift({
  //       width: 40,
  //       key: 'sort',
  //       dataIndex: 'sort',
  //       align: 'center',
  //       fixed: 'left',
  //     });
  //   }
  //   console.log('com---', cls)
  //   return cls.map((e) => {
  //     return {
  //       ...e,
  //       width: e.width || 100,
  //       customRender: ({ text }) => {
  //         if (text == null || text === '' || text == undefined) return '--';
  //         return text;
  //       },
  //     };
  //   });
  // });

  watch(
    () => draggableRows.value.length,
    () => {
      nextTick(() => {
        init();
      });
    },
    // {
    //   immediate: true,
    // },
  );

  onMounted(() => {
    // console.log('omMounted------')
    initColumns();
    init();
  });

  function initColumns() {
    const cls = cloneDeep(props.columns);
    cls.push({
      title: $t('sys.operation'),
      key: 'operation',
      dataIndex: 'operation',
      width: 90,
      align: 'center',
      fixed: 'right',
    });
    if (!readonlySummary.value) {
      cls.unshift({
        width: 40,
        key: 'sort',
        dataIndex: 'sort',
        align: 'center',
        fixed: 'left',
      });
    }
    tableColumns.value = cls.map((e) => {
      return {
        ...e,
        width: e.width || 100,
        customRender: ({ text }) => {
          if (text == null || text === '' || text == undefined) return '--';
          return text;
        },
      };
    });
  }

  function init() {
    if (readonlySummary.value) return;
    const cls = `.${props.tableClass || 'draggable-table'} tbody.ant-table-tbody`;
    const rows = document.querySelector(cls) as HTMLElement;
    if (!rows) return;
    new Sortable(rows, {
      group: {
        name: 'edhrSummaryGroup',
        pull: 'clone',
        put: false,
      },
      filter: '.no-drag,.ant-table-placeholder',
      sort: false,
      animation: 150,
      forceFallback: true,
      handle: '.ant-table-tbody',
      dragClass: 'inst-list-dragged',
      onStart: () => {
        // console.log('table--onStart');
      },
      onAdd: (e) => {
        // console.log('table-onAdd', e.to.classList);
      },
      onEnd: async (e) => {
        notAllowToList.value = false;
        const classList = e.to.classList;
        const isTree = classList.contains('ant-tree-list-holder-inner');
        if (isTree) {
          const dragTr = e.to.querySelector('.ant-table-row');
          dragTr?.remove();
          onDragEnd(relateTreeId.value);
          // 重置一下拖拽
          init();
        }
      },
      onMove: (e) => {
        notAllowToList.value = false;
        isBefore.value = e.draggedRect?.top > e.relatedRect?.top;
        const classList = e.to.classList;
        if (classList.contains('inst-list-wrap')) {
          notAllowToList.value = true;
          return false;
        } else if (classList.contains('ant-tree-list-holder-inner')) {
          const relatedItem = e.related?.querySelector('.node-title-item');
          const sourceRoot = relatedItem?.getAttribute('data-sourceRoot');
          const sourceEdhr = relatedItem?.getAttribute('data-sourceEdhr');
          // wiki中的Id
          relateTreeId.value = e.related
            ?.querySelector('.node-title-item')
            ?.getAttribute('data-id');
          if (sourceRoot !== '1' && sourceEdhr && sourceEdhr !== edhrInfo.value.edhrInstId) {
            const rootNode = findTreeNode(
              '',
              (n) => sourceEdhr === n.source_edhr_inst_id_ && n.source_root_,
            );
            relateTreeId.value = rootNode?.id_;
            isBefore.value = false;
            curStatistics.value.expandedIds = curStatistics.value.expandedIds.filter(
              (e) => e !== relateTreeId.value,
            );
          }
          if (sourceRoot === '1') {
            curStatistics.value.expandedIds = curStatistics.value.expandedIds.filter(
              (e) => e !== relateTreeId.value,
            );
          }
        }
      },
      onChoose: function (evt) {
        const uuid = evt.item?.getAttribute('data-row-key');
        dragNode.value = findTreeNode(uuid, (n) => n.uuid === uuid, props.data) || {};
      },
    });
  }

  function rowClassName(record) {
    return record.instanceStatus !== InstanceStatusValues.SUMMARIZED || record.associated
      ? 'no-drag'
      : '';
  }

  async function onDragEnd(relatedId) {
    if (!relatedId) return;
    const node = findTreeNode(relatedId);
    // 如果是单据，则添加到单据的父节点的末端；如果是目录，isBefore 添加到目录的前一个兄弟节点，否则添加到目录的子节点首位；
    // const updateId = node.type_ === OutlineType.DOC ? node.parent_id_ : node.id_;
    // const isBef = node.type_ === OutlineType.DOC ? false : isBefore.value;
    const children = await getEdhrOutlineData(dragNode.value.id);
    // TODO 验证拿到的 children 数据格式对不对
    const obj = newOutLine({
      parent_id_: edhrInfo.value.edhrInstId,
      name_: dragNode.value.tmplName,
      source_edhr_inst_id_: dragNode.value.id,
      source_root_: 1,
      isEdit: false,
      children: [],
      class: 'no-put',
    });
    obj.children = children.map((e) => {
      return {
        ...e,
        parent_id_: obj.id_,
      };
    });
    updateTreeNode({ id: dragNode.value.id, params: { associated: true } });
    updateTreeData(node.id_, catalogTreeData.value, obj, isBefore.value);
  }

  function getDraggableRows(list) {
    return list.reduce((arr, e) => {
      if (!e.associated) {
        arr.push(e);
      }
      if (e.children?.length) {
        arr.push(...getDraggableRows(e.children));
      }
      return arr;
    }, []);
  }

  function onView(record) {
    openFillWikiFullScreenModal({
      materialNo: record.materialNo,
      isViewPage: true,
      needAutoSave: false,
    });
  }

  function handleResizeColumn(w, col) {
    col.width = w;
  }
</script>
<style lang="less" scoped></style>
