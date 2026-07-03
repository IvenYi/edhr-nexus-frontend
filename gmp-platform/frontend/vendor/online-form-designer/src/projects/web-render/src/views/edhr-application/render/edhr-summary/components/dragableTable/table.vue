<template>
  <a-table
    ref="dragableTableRef"
    rowKey="id_"
    :class="[tableClass]"
    :data-source="tableData"
    :columns="tableColumns"
    :loading="loadingRight"
    :pagination="false"
    :key="data.length"
    :scroll="{
      y: `${(height || 600) - 45}px`,
      x: tableData?.length > 0 ? true : undefined,
    }"
    :rowClassName="rowClassName"
    size="middle"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'sort'">
        <i class="iconfont icon-tuozhuai1"></i>
      </template>
      <template v-if="column.dataIndex === 'operation'">
        <a-button type="link" @click.stop="onView(record)">{{
          $t('sys.process.formView')
        }}</a-button>
      </template>
      <template v-if="column.dataIndex === 'instance_status_'">
        <InstanceStatusLabel :instance-status="record.instance_status_" />
      </template>
      <template v-if="column.dataIndex === 'materialNo'">
        {{
          record.businessType === 'LOT_SN_APPEND'
            ? record.materialNo || '--'
            : record.sourceMaterialNo || '--'
        }}
      </template>
      <template v-else-if="column.dataIndex === 'formAttr'">
        <span
          v-if="record.businessType === 'LOT_RELATION'"
          class="gct-custom-tag"
          :style="{ '--ant-primary-color': '#8274FF' }"
          >{{ $t('sys.pageDesigner.refForm') }}</span
        >
        <span
          v-else-if="record.businessType === 'LOT_SN_APPEND'"
          class="gct-custom-tag"
          :style="{ '--ant-primary-color': '#247BFF' }"
          >{{ $t('sys.newSth', { sth: $t('sys.edhr.printTypeEnum.FORM') }) }}</span
        >
      </template>
    </template>
    <template #emptyText>
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </template>
  </a-table>
</template>
<script setup lang="ts">
  import { useEdhrSummary } from '../../hook/useEdhrSummary';
  import {
    InstanceStatusLabel,
    InstanceStatusValues,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/hooks/index';
  import { Empty, Modal } from 'ant-design-vue';
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import Sortable from 'sortablejs';
  import { Fixed_Btns_Keys } from '../constant';
  import WikiModal from '../modals/wiki-modal.vue';

  const props = defineProps<{
    data: any[];
    height?: number;
    tableClass?: string;
    columns: any[];
  }>();

  const relateTreeId = ref<any>();
  const dragItemOldIndex = ref(-1);
  const isBefore = ref<boolean>(false);
  const { openSingleDrawer } = useApaasEbr();

  const {
    selectedTreeId,
    selectedTreeNode,
    setSelectedTreeNode,
    choosedFormInst,
    formInstTransfer,
    formInstData,
    findTreeNode,
    notAllowToList,
    loadingRight,
    readonlySummary,
    getFormInstDataById,
    catalogTreeData,
    updateTreeData,
    edhrInfo,
  } = useEdhrSummary();

  const tableData = computed(() => {
    return props.data;
  });

  const tableColumns = computed(() => {
    const cls = [...(props.columns || [])];
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
    return cls.map((e) => {
      return {
        ...e,
        resizable: false,
        customRender: ({ text }) => {
          if (text == null || text === '' || text == undefined) return '--';
          return text;
        },
      };
    });
  });

  watch(
    () => props.data.length,
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
    init();
  });

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
        const dragTr = e.to.querySelector('.ant-table-row');
        const isTree = classList.contains('ant-tree-list-holder-inner');
        const isList = classList.contains('inst-list-wrap');
        if (isTree || isList) {
          const data = formInstTransfer(choosedFormInst.value, isTree ? 'tree' : 'list');
          dragTr?.remove();
          deleteTableItem();
          if (isList) {
            formInstData.value.unshift(data);
          } else {
            await onDragEndInTree(data);
          }
          // 重置一下拖拽
          init();
        }
      },
      onMove: (e) => {
        notAllowToList.value = false;
        isBefore.value = e.draggedRect?.top > e.relatedRect?.top;
        const classList = e.to.classList;
        if (classList.contains('inst-list-wrap')) {
          // 绑定的模板是父，则，同一个父下的模板都可以拖入；绑定的模板是带版本的子，则，只有同一个版本的模板实例才可以拖入
          const stedId = selectedTreeId.value[0];
          const stedTreeTmpl = selectedTreeNode.value?.form_tmpl_id_;
          // 被拖拽的模板 Id
          const { form_tmpl_id_ } = choosedFormInst.value;
          if (
            !stedId ||
            (stedTreeTmpl !== form_tmpl_id_ && form_tmpl_id_.split(':')[0] !== stedTreeTmpl)
          ) {
            notAllowToList.value = true;
            return false;
          }
        } else if (classList.contains('ant-tree-list-holder-inner')) {
          // wiki中的Id
          relateTreeId.value = e.related
            ?.querySelector('.node-title-item')
            ?.getAttribute('data-id');
        }
      },
      onChoose: function (evt) {
        const dragId = evt.item?.getAttribute('data-row-key');
        // console.log('table-onChoose', evt, dragId);
        choosedFormInst.value = props.data.find((e) => e.id_ === dragId);
        dragItemOldIndex.value = props.data.findIndex((e) => e.id_ === dragId);
      },
    });
  }

  function deleteTableItem() {
    const idx = props.data.findIndex((e) => e.id_ === choosedFormInst.value?.id_);
    if (idx > -1) props.data.splice(idx, 1);
  }

  async function onDragEndInTree(data) {
    const tmplId = choosedFormInst.value.form_tmpl_id_;
    const node = findTreeNode(
      tmplId,
      (n) =>
        tmplId &&
        n.source_edhr_inst_id_ === edhrInfo.value.edhrInstId &&
        (n.form_tmpl_id_ === tmplId || tmplId.startsWith(`${n.form_tmpl_id_}:`)),
    );
    if (node) {
      return new Promise((resolve): void => {
        Modal.confirm({
          content: $t('sys.edhr.formExistedInWiki'),
          okText: $t('sys.okText'),
          async onOk() {
            if (!node.instData) {
              node.instData = (await getFormInstDataById(node)) || [];
            }
            const dragItem = data.instData[0];
            dragItem.summary_outline_id_ = node.id_;
            node.instData.push(dragItem);
            setSelectedTreeNode(node);
            resolve(true);
          },
          onCancel() {
            if (dragItemOldIndex.value > -1) {
              props.data.splice(dragItemOldIndex.value, 0, choosedFormInst.value);
            }
            resolve(true);
          },
        });
      });
    } else {
      const { inst_from, form_inst_name_, form_tmpl_name_ } = choosedFormInst.value;
      const res: any = await gct.openUtil.modal(
        WikiModal,
        {
          name: inst_from === Fixed_Btns_Keys.Txn ? form_tmpl_name_ : form_inst_name_,
          optionLabel: inst_from === Fixed_Btns_Keys.Txn ? $t('sys.onlineForm.formName') : '',
        },
        {
          title: $t('sys.tip'),
          width: 640,
          okText: $t('sys.okText'),
        },
      );
      if (res.ok) {
        data.name_ = res.params?.name;
        setSelectedTreeNode(data);
        updateTreeData(relateTreeId.value, catalogTreeData.value, data, isBefore.value);
      } else {
        if (dragItemOldIndex.value > -1) {
          props.data.splice(dragItemOldIndex.value, 0, choosedFormInst.value);
        }
      }
    }
  }

  function rowClassName(record) {
    return record.instance_status_ !== InstanceStatusValues.COMPLETED ? 'no-drag' : '';
  }

  function onView(row) {
    // console.log('row', row);
    openSingleDrawer({
      selfId: row.form_inst_id_,
      keep: false,
      title: $t('sys.onlineForm.formDetail'),
      isViewPage: true,
    });
  }
</script>
<style lang="less" scoped></style>
