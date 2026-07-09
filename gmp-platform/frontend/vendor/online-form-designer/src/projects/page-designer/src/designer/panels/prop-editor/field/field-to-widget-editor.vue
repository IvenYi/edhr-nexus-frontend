<template>
  <div class="content-center">
    <draggable
      :list="propValue"
      handle=".mover"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
      @update="updateCallback"
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

          <drag-outlined class="mover primary-gct cursor-pointer ml5px" />
        </div>
      </template>
    </draggable>
    <a-button type="primary" @click="addFiled" ghost style="line-height: 1" block>
      <span class="iconfont icon-tianjia"></span>
      {{ t('sys.pageDesigner.addField') }}
    </a-button>
    <field-to-widget-modal @register="register" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts" name="field-to-widget-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldToWidgetModal from '../modals/field-to-widget-modal.vue';
  import draggable from 'vuedraggable';
  import { useModal } from '/@/components/Modal';
  import { deleteAndInsertArr } from '/@/utils';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const [register, { openModal }] = useModal();
  async function addFiled() {
    openModal(true, {
      modelKey: defProps.widget?.props.bindModelKey,
      disabledIds: propValue.value.map((schema) => schema.props.fieldId),
    });
  }
  function deleteList(index) {
    propValue.value.splice(index, 1);
    defProps.widget?.props.columns.splice(index, 1);
  }
  const handleOk = ({ schema, field }) => {
    const { FieldToWidget, columnField } = defProps.propConfig.createField?.(schema, field);
    propValue.value.push(FieldToWidget);
    defProps.widget?.props.columns.push(columnField);
  };

  const updateCallback = (evt, a) => {
    deleteAndInsertArr(defProps.widget?.props.columns, evt.oldIndex, evt.newIndex);
    // console.log(propValue.value, defProps.widget?.props.columns);
  };
</script>

<style lang="less" scoped>
  .fieldrow {
    padding: 4px 8px;
    background-color: #f7f7f7;
  }
</style>
