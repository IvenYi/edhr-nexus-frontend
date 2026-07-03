<template>
  <div class="node-tools" @click.stop>
    <div
      :title="i18nDeleteTitle"
      @click="() => handleMenuClick({ key: 'delete' })"
      v-if="node.allowDelete !== false"
      class="node-tool__item"
    >
      <i class="iconfont icon-shanchu1 lh-1em important-text-12px"></i>
    </div>
    <!-- <a-dropdown :trigger="['click']" placement="bottom" overlay-class-name="list-actions-overlay">
      <i class="iconfont icon-gengduo"></i>
      <template #overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item
            key="delete"
            :class="[node.allowDelete && 'error-gct-hover']"
            :disabled="node.allowDelete === false"
          >
            <i class="iconfont icon-shanchu2 mr6px"></i>
            {{ $t('sys.delete') }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown> -->
  </div>
</template>
<script setup lang="ts">
  import { computed, inject, createVNode } from 'vue';

  import type { GctFlowNode } from '../types';
  import { useGctFlow } from '../hooks/useGctFlow';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from 'vue-i18n';
  import { BpmnNodeTypeEnum } from '../plugins/ipaas-bpmn/enums';
  const props = defineProps<{
    node: GctFlowNode.Basic;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { deleteNodeById } = useGctFlow(uniqueFlowKey);
  const { t } = useI18n();

  const i18nDeleteTitle = computed(() => $t('sys.delete'));

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'delete':
        if (!props.node.allowDelete) {
          if (
            props.node.type == BpmnNodeTypeEnum.BpmnConnector ||
            props.node.type == BpmnNodeTypeEnum.BpmnScript
          ) {
            Modal.confirm({
              title: t('sys.ipaas.confirmDelete'),
              icon: createVNode(ExclamationCircleOutlined),
              okText: t('sys.ok'),
              cancelText: t('sys.cancel'),
              async onOk() {
                deleteNodeById(props.node.id);
              },
              onCancel() {},
            });
          } else {
            deleteNodeById(props.node.id);
          }
        }

        break;
    }
  };
</script>
<style lang="less" scoped>
  .node-tool__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background-color: var(--ant-error-color);
    color: white;
    cursor: pointer;
  }
</style>
