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
            :title="$t('sys.pageDesigner.areYouSureToDelete')"
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
      {{ $t('sys.pageDesigner.addButton') }}
    </a-button>
  </div>
  <addButtonModal ref="addFieldModel" :model="widget?.props.model" :id="widget?.preLocation" />
</template>

<script setup lang="ts" name="button-list-editor">
  import { props } from '/@page-designer/hooks/usePropEditor';
  import addButtonModal from '../modals/add-button-table.vue';
  import { ref, reactive } from 'vue';
  import draggable from 'vuedraggable';

  import { OperateButton, OperateTable } from '/@page-designer/types/web';
  import { cloneDeep } from 'lodash-es';

  const defProps = defineProps(props);
  const widget = defProps.widget as OperateTable;
  const children = ref(widget.children);
  const propConfig = reactive(defProps.propConfig);
  const addFieldModel = ref<InstanceType<typeof addButtonModal> | null>(null);
  async function addButton() {
    let button: OperateButton = propConfig.createField!();
    const props = await addFieldModel.value!.open(button.props, '新增按钮');
    button.props = props;
    children.value.push(button);
  }
  async function editButton(value, index) {
    const props = await addFieldModel.value!.open(cloneDeep(value.props), '编辑按钮');
    value.props = props;
    children.value.splice(index, 1, value);
  }
  function deleteList(index) {
    children.value.splice(index, 1);
  }
</script>

<style lang="less" scoped>
  .fieldrow {
    padding: 4px 8px;
    background-color: #f7f7f7;
  }
</style>
