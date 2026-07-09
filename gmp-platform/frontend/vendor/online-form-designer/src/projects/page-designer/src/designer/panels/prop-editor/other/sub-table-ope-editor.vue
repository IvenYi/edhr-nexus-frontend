<template>
  <div class="content-center">
    <draggable
      :list="children"
      handle=".mover"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
    >
      <template #item="{ element, index }">
        <div class="ks-row-middle fieldrow mb5px">
          <div class="ks-col"> {{ element.props.label }}</div>
          <a-popconfirm
            placement="topLeft"
            :title="t('sys.pageDesigner.areYouSureToDelete')"
            @confirm="deleteList(index)"
          >
            <delete-outlined class="error-gct cursor-pointer" />
          </a-popconfirm>
          <form-outlined
            class="primary-gct cursor-pointer ml5px"
            @click="editButton(element, index)"
          />
          <drag-outlined class="mover primary-gct cursor-pointer ml5px" />
        </div>
      </template>
    </draggable>
    <a-button type="primary" @click="addButton" ghost style="line-height: 1" block>
      <span class="iconfont icon-tianjia"></span>
      {{ t('sys.pageDesigner.addButton') }}
    </a-button>
  </div>
  <add-sub-table-ope-modal @register="register" @ok="handleOk"></add-sub-table-ope-modal>
</template>

<script setup lang="ts" name="sub-table-ope-editor">
  import { props } from '/@page-designer/hooks/usePropEditor';
  import draggable from 'vuedraggable';
  import { cloneDeep } from 'lodash-es';
  import { widget as operateButton } from '/@page-designer/schema/web/data/data-table/ope-button';
  import { buildShortUUID } from '/@/utils/uuid';
  import AddSubTableOpeModal from '../modals/add-sub-table-ope-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SUB_TABLE_OPE_EVENT_TYPE } from '/@page-designer/enum';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { ref } from 'vue';
  import { OperateTable } from '/@page-designer/types/web';
  import { findNode } from '/@/utils/helper/treeHelper';
  import { useDesigner } from '../../../../hooks/useDesigner';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const [register, { openModal }] = useModal();
  const { pageJson } = useDesigner();
  const { mitt } = useMitt();
  const children = ref((defProps.widget as OperateTable).children);
  const subatable = findNode(pageJson.widgets, (node) => {
    return node.id === (defProps.widget as OperateTable).preLocation;
  });
  async function addButton() {
    let button = cloneDeep(operateButton);
    openModal(true, {
      button,
      bindModelKey: defProps.widget?.props.bindModelKey,
      widget: subatable,
    });
  }
  async function editButton(value, index) {
    openModal(true, {
      button: cloneDeep(value),
      bindModelKey: defProps.widget?.props.bindModelKey,
      widget: subatable,
    });
  }
  function deleteList(index) {
    children.value.splice(index, 1);
  }
  const handleOk = (button) => {
    if (button.id) {
      const index = children.value.findIndex((b) => button.id === b.id);
      children.value.splice(index, 1, button);
    } else {
      button.id = buildShortUUID(button.type);
      children.value.push(button);
    }
    if (button.props.subTableEventType === SUB_TABLE_OPE_EVENT_TYPE.CUSTOM) {
      mitt.emit('new-event', {
        methodName: button.props.eventName,
        params: 'rowData,index',
      });
      mitt.emit('get-schema-code');
    }
  };
</script>

<style lang="less" scoped>
  .fieldrow {
    padding: 4px 8px;
    background-color: #f7f7f7;
  }
</style>
