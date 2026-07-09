<template>
  <opeButtons
    @runEvent="runEvent"
    showmore
    :buttonOptions="btnOptions"
    :visibleButtons="newVisiableButtons ?? operateColumn.props.visibleButtons"
  />
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { OperateTable, OperateButton } from '/@page-designer/types/web';
  import opeButtons from './opeButtons.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { operateSysEnums } from '/@page-designer/enum';
  import { cloneDeep } from 'lodash-es';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import { EntityModelTypeEnum } from '@gct/runtime';

  const emit = defineEmits(['deleteById', 'opeEdit']);
  const props = defineProps<{
    operateColumn: OperateTable;
    row: any;
    index: number;
    newVisiableButtons?: number;
  }>();
  const { row, index, operateColumn } = reactive(props);
  const children = ref(cloneDeep(operateColumn.children));
  const btnOptions = useDependencyToShowList(children.value, props.row);
  const Event = getPageEvent();
  /**内置事件 */
  const innerEventOptions = {
    [operateSysEnums.COLUMNDELETE]: async () => {
      emit('deleteById', row.id_);
    },
    [operateSysEnums.COLUMNLINK]: (value: OperateButton['props']) => {
      Event.context.$push!(value.linkPage, { id: row.id_ });
    },
    [operateSysEnums.COPY]: async (value: OperateButton['props']) => {
      const rowData = row.__DEFAULT__ || row;
      Event.context.$getModal(value.refModal).open({
        data: operateSysEnums.COPY,
        async onOpen(ctx) {
          const info = await getAllDataById(rowData, {
            model: value.model,
            modelType: value.modeldata?.modelType,
            modelCategory: value.modeldata?.modelCategory,
            excludeField: value.excludeField,
          });
          const form = await ctx.$asyncRef(value.refForm);
          form.copyData({ ...rowData, ...info });
        },
      });
    },
    [operateSysEnums.DETAILS]: async (value: OperateButton['props']) => {
      Event.context.$getModal(value.refModal).open({
        data: operateSysEnums.DETAILS,
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(value.refForm);
          ctx.$setPropsByKey(value.refForm, { readonly: true });
          form.setValue(row);
        },
      });
    },
    [operateSysEnums.EDIT]: async (value: OperateButton['props']) => {
      Event.context.$getModal(value.refModal).open({
        data: operateSysEnums.EDIT,
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(value.refForm);
          form.setValue(row);
        },

        onClose(arg) {
          emit('opeEdit', arg);
        },
      });
    },
    [operateSysEnums.VERSION_COPY]: async (value: OperateButton['props']) => {
      /**版本复制 */
      Event.context.$getModal(value.refModal).open({
        data: operateSysEnums.VERSION_COPY,
        async onOpen(ctx) {
          const info = await getAllDataById(row, {
            model: value.model,
            modelType: value.modeldata?.modelType,
            modelCategory: value.modeldata?.modelCategory,
            excludeField: value.excludeField,
          });
          const form = await ctx.$asyncRef(value.refForm);
          form.copyVersion({ ...row, ...info });
        },
      });
    },
    [operateSysEnums.VERSION_CREATE]: async (value: OperateButton['props']) => {
      /**版本创建 */
      Event.context.$getModal(value.refModal).open({
        data: operateSysEnums.VERSION_CREATE,
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(value.refForm);
          form.createVersion(row);
        },
      });
    },
    [operateSysEnums.USAGEINFORMATION]: async (value: OperateButton['props']) => {
      /**使用信息*/
      Event.context.$usageInformation!({
        id: row.id_,
        modelKey: value.model,
        row,
      });
    },
    [operateSysEnums.MODELINGTRACEABILITY]: async (value: OperateButton['props']) => {
      /**建模追溯*/
      Event.context.$modelingTraceability({ id: row.id_, modelKey: value.model }).open();
    },
    [operateSysEnums.DOCUMENT_PRINT]: async (value: any) => {
      /**单据打印 */
      const { documentKey, printMode, documentType, ruleConfig, printField, model, fieldList } =
        value;
      const fields = fieldList.map((i) => i.key);
      await Event.context.$documentPrint(row, {
        documentKey,
        fields,
        printMode,
        documentType,
        ruleConfig,
        printField,
        modelKey: model,
      });
    },
    [operateSysEnums.LABEL_PRINT]: async (value: any) => {
      /**标签打印 */
      const {
        printType,
        printVal,
        printField,
        printKey,
        serverKey,
        model,
        labelMode,
        printMode,
        ruleConfig,
        printRuleConfig,
        printRefType,
      } = value;
      await Event.context.$labelPrint(row, {
        printType,
        printVal,
        printKey,
        serverKey,
        modelKey: model,
        labelMode,
        printMode,
        ruleConfig,
        printRuleConfig,
        printRefType,
        printField,
      });
    },
  };

  /**
   * 执行操作按钮事件
   * @param value
   */
  function runEvent(value: OperateButton['props']) {
    if (value.innerEvent) {
      // 系统事件
      !!value.sysMethedType && innerEventOptions[value.sysMethedType](value);
    } else {
      /**兼容老版本按钮数据结构,新版本上不需要加 */
      if (value.eventName && !Object.keys(value?.events || {}).length) {
        value.events = {
          onClick: {
            name: value.eventName,
          },
        };
      }
      Event.runEventByName('onClick', value.events, row, index);
    }
  }

  /**更具id 获取完整的数据信息方便复制 */
  async function getAllDataById(row, { model, modelCategory, modelType, excludeField = [] }) {
    const formData = cloneDeep(row);
    const id = formData.id_;
    if (modelType === EntityModelTypeEnum.RDO || modelType === EntityModelTypeEnum.WORKFLOW) {
      let data = await Event.context.$httpBizService(
        {
          action: 'rdoGetVersionById',
          key: model,
          modelCategory: modelCategory,
        },
        {
          id,
          includeSubModel: 1,
        },
      );
      Object.assign(formData, data?.data || {});
    } else {
      let data = await Event.context.$httpBizService(
        {
          action: 'getOne',
          key: model,
          modelCategory: modelCategory,
        },
        {
          query: { 'id_.eq': id },
        },
        {
          includeSubModel: 1,
        },
      );
      Object.assign(formData, data?.data || {});
    }
    excludeField.forEach((i) => {
      formData[i.key] = undefined;
    });
    return formData;
  }
</script>
<style scoped lang="less"></style>
