<template>
  <template v-if="widget">
    <basicButton
      v-if="Object.prototype.hasOwnProperty.call(widget?.props, 'basic')"
      type="primary"
      @click="handleOpen"
      :loading="loading"
      v-bind="basic"
    >
      {{ title }}
    </basicButton>
    <!-- 新版本的BaseButton -->
    <baseButton v-else v-bind="widget?.props" :loading="loading" @click="handleOpen" />
  </template>

  <TableSelectModal
    :widget="tableSelectWidget"
    @register="register"
    ref="tableSelectModalRef"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts" name="gct-table-select-button">
  import basicButton from '/@page-designer/components/widgets/web/__components__/basic_button.vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import TableSelectModal from './components/table-select-modal.vue';
  import { ref, toRefs, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ITableSelectButton } from './schema';
  import { useModal } from '/@/components/Modal';

  const Event = getPageEvent();
  const defProps = defineProps<{ widget: ITableSelectButton; destroyVm?: Function }>();
  const { title, basic, assignmentRule } = toRefs(defProps.widget?.props);
  const [register, { openModal }] = useModal();
  const loading = ref(false);
  const tableSelectModalRef = ref();
  const regSubTable = /^master_slave_/;
  const selectList = ref();
  // const ruleFormFeild = ref();

  const tableSelectWidget = computed(() => {
    return defProps.widget;
  });

  const handleOpen = () => {
    openModal(true, { edit: false });
  };

  const handleRefresh = async (data) => {
    let list = getTableData(data);
    const { noRepeatId, enableNoRepeat, refTable } = assignmentRule.value;
    if (!refTable) {
      selectList.value = list;
      return;
    }
    const isSubTable = regSubTable.test(refTable);
    const refTableRef = await Event.context.$asyncRef(refTable!);
    const arr: any = isSubTable ? refTableRef?.getValue!() : refTableRef?.getDataSource!();
    if (enableNoRepeat && noRepeatId && arr.length) {
      const arrKeys = arr?.map((i) => i['NO_REP_' + noRepeatId]).filter(Boolean);
      list = list.filter((v) => !arrKeys.includes(v[noRepeatId]));
    }
    if (isSubTable) {
      refTableRef?.addValue!(list);
    } else {
      refTableRef?.addDataSource!(list);
    }
    selectList.value = list;
  };

  // 数据赋值
  const getTableData = (data) => {
    let list = data;
    const { noRepeatId, enableNoRepeat } = assignmentRule.value;
    if (assignmentRule.value.rules?.length) {
      list = list.map((i) => {
        let item = { _OPCT: {}, _DICT: {} };
        for (let rule of assignmentRule.value.rules!) {
          item[rule.from] = i[rule.to];
          item['_DICT'] = i._DICT;
          if (enableNoRepeat && noRepeatId && noRepeatId === rule.from) {
            item['NO_REP_' + noRepeatId] = i[rule.to];
          }
          if (rule.to === 'id_') {
            // ruleFormFeild.value = rule.to;
            item['_OPCT'][rule.from] = i;
          }
        }
        return item;
      });
    }
    return list;
  };

  defineExpose({
    getValue: () => {
      return selectList.value;
    },
  });
</script>
<style scoped lang="less"></style>
