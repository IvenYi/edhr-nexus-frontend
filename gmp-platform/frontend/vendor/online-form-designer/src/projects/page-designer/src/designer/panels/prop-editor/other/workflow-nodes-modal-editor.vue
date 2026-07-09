<template>
  <div>
    <!-- <a-button block @click="handleOpen" :type="!!propValue ? 'primary' : 'default'">
      <template #icon>
        <setting-outlined />
      </template>
      {{ t('sys.pageDesigner.editModal') }}
    </a-button> -->
    <a-button type="link" @click="handleOpen(NodesConfigTypeEnum.SPEC)">{{
      t('节点配置模态框')
    }}</a-button>
    <a-button type="link" @click="handleOpen(NodesConfigTypeEnum.SUB_WORKFLOW)">{{
      t('子流程节点配置模态框')
    }}</a-button>
  </div>
</template>

<script setup lang="ts" name="workflow-nodes-modal-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { FormComponents } from '/@page-designer/enum';
  import { NodesConfigTypeEnum } from '/@/enums/appEnum';
  // import { watch } from 'vue';
  // import { cloneDeep } from 'lodash-es';
  // import { widget as modal } from '/@page-designer/schema/modal/workflow-node-modal';
  import { createWidgetByType, setChildrenId } from '/@page-designer/schema/utils';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const { setSelectedWidget } = useSelectedWidget();
  const { t } = useI18n();
  const { setWorkflowNodesModalDesignState, setWfNodesModalDesignState } = useDesigner();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  //如果字段设置发生改变则模态框需要同步变化
  // watch(
  //   () => defProps.widget?.props.fieldToWidgetList,
  //   (val) => {
  //     //modal->modalbody->form->
  //     const formWidgets = defProps.widget?.props.modalInfo?.children[0].children[0].children;
  //     if (propValue.value && formWidgets.length !== val.length) {
  //       //新增
  //       if (formWidgets.length < val.length) {
  //         let addWidget;
  //         val.forEach((schema) => {
  //           if (!formWidgets.find((w) => w.id === schema.id)) {
  //             addWidget = schema;
  //           }
  //         });
  //         formWidgets.push(addWidget);
  //       } else {
  //         //删除
  //         let delIndex;
  //         formWidgets.forEach((w, index) => {
  //           if (!val.find((schema) => w.id === schema.id)) {
  //             delIndex = index;
  //           }
  //         });
  //         formWidgets.splice(delIndex, 1);
  //       }
  //     }
  //   },
  //   {
  //     deep: true,
  //   },
  // );
  const handleOpen = (type) => {
    _initModalInfo(type);
  };
  const _initModalInfo = (type) => {
    const modalSchema =
      type === NodesConfigTypeEnum.SUB_WORKFLOW
        ? propValue.value.workflowModal
        : propValue.value.specModal;
    setChildrenId(modalSchema);
    const formSchme = modalSchema.children[0].children[0];
    const form = createWidgetByType(FormComponents.Form);
    //清除绑定事件
    form.children = (formSchme && formSchme.children) || [];
    // const keyList = defProps.widget?.props.modelKey.split('_');
    // keyList.splice(keyList.length - 1, 0, 'step');
    // const modelKey = keyList.join('_');
    form.props.model = defProps.widget?.props.bindModelKey;
    modalSchema.children[0].children[0] = form;
    modalSchema.props.model = defProps.widget?.props.bindModelKey;
    modalSchema.props.nodeType = type;
    modalSchema.alias = modalSchema.props.modalTitle;

    // setModalInfo(modalSchema);
    // console.log('modalSchema', modalSchema, defProps?.widget);
    if (type === NodesConfigTypeEnum.SUB_WORKFLOW) {
      setWfNodesModalDesignState(true, defProps?.widget?.id);
    } else {
      setWorkflowNodesModalDesignState(true, defProps?.widget?.id);
    }
    setSelectedWidget(modalSchema);
  };
</script>

<style lang="less" scoped></style>
