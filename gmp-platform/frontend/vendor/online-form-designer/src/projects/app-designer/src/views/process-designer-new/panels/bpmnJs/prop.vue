<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="props.node.data" />
      <form-item :label="t('sys.script')" :rules="[{ required: true }]" :inline="false">
        <a-button
          type="primary"
          :ghost="!formState?.events?.length"
          block
          size="small"
          :disabled="paasBpmnReadonly"
          @click="openModal"
        >
          {{ t('sys.addScript') }}
        </a-button>
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { computed, inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import FormItem from '../../components/form-item.vue';
  import SelectScript from '../../components/select-script.vue';
  import { EventsTypeEnum } from '../../../global-events/constants';
  import { useProcess } from '../../hook/useProcess';

  const props = defineProps<{
    node: GctBpmnNode.BpmnJs;
  }>();

  const { validNodeData } = useProcess();
  const { t } = useI18n();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const openModal = async () => {
    const events = formState.value?.events || [];
    let data: object = {
      executeResourceType: EventsTypeEnum.SCRIPT_SERVICE,
    };
    if (events.length) {
      data = { ...events[0] };
    }
    const res = await gct.openUtil.modal(
      SelectScript,
      {
        data,
      },
      {
        title: t('sys.newSth', { sth: t('sys.appDesigner.events') }),
        width: 640,
        height: 400,
        okText: t('sys.okText'),
      },
    );
    if (res.ok) {
      formState.value!['events'] = [{ ...res.params, relationType: 'PROC_NODE_DEF' }];
      validNodeData(props.node?.id);
    }
  };
</script>
<style lang="less" scoped></style>
