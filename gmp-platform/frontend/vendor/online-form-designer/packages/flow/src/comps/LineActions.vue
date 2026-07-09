<template>
  <a-popover trigger="click" placement="right" overlay-class-name="list-actions-overlay">
    <slot>
      <div class="line-actions"><div></div></div>
    </slot>
    <template #content>
      <div class="action-list">
        <div
          class="action-item"
          v-for="item in actions"
          :key="item.key"
          @click="handleMenuClick({ key: item.key, data: item.data })"
        >
          <div
            :style="{
              '--color': item.color,
            }"
          >
            <i v-if="item._iconNs_ === 'iconfont'" class="iconfont" :class="item._iconValue_"></i>
            <icon-park v-else-if="item._iconNs_ === 'iconpark'" :type="item._iconValue_" />
          </div>
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
  import { FlowNodeTypeEnum } from '../enums';
  import type { GctFlowNode } from '../types';
  import { useGctFlow } from '../hooks/useGctFlow';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import NodeGenerator from '../utils/NodeGenerator';
  import { computed, inject } from 'vue';
  import { merge } from 'lodash-es';

  const props = defineProps<{
    node?: GctFlowNode.Basic;
    prev?: GctFlowNode.Basic;
    next?: GctFlowNode.Basic;
    list: GctFlowNode.Basic[];
    isFlowStart?: boolean; // 非节点后的操作（可以理解成 FLow 初始的添加操作）
    parent?: GctFlowNode.Basic;
    flow: GctFlowNode.Flow;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { onNodeCreate, gctFlowOpts } = useGctFlow(uniqueFlowKey);

  const actions = computed(() => {
    const list = (
      gctFlowOpts.value!.actions ?? [
        {
          key: FlowNodeTypeEnum.App,
          name: 'sys.ipaas.connector',
          icon: 'iconpark:api-app',
          color: '#3168ec',
        },
        {
          key: FlowNodeTypeEnum.Switch,
          name: 'sys.ipaas.branch',
          icon: 'iconfont:icon-fenzhi',
          color: '#088c49',
        },
        {
          key: FlowNodeTypeEnum.Loop,
          name: 'sys.ipaas.loop',
          icon: 'iconfont:icon-xunhuan',
          color: '#f54547',
        },
        {
          key: FlowNodeTypeEnum.End,
          name: 'sys.ipaas.end',
          icon: 'iconfont:icon-jieshu',
          color: '#3168ec',
        },
      ]
    )
      .map((item) => {
        const [_iconNs_, _iconValue_] = item.icon.split(':');
        return {
          ...item,
          _iconNs_,
          _iconValue_,
        };
      })
      .filter((e) => !e.hide || (typeof e.hide == 'function' && !e.hide(props)));
    return list;
  });

  // 有些节点会同时加一些隐藏的节点，这个方法是找到新增的节点应该插入的正确的位置
  const findInsertId = (nextKey) => {
    const nextNode: any = props.list.find((item) => item.id === nextKey);
    if (nextNode.data?.nextKey) return findInsertId(nextNode.data.nextKey);
    return nextNode.id;
  };

  const handleMenuClick = ({ key, data = {} }) => {
    const node = NodeGenerator[key]();
    merge(node.data, data || {});
    if (props.isFlowStart) {
      // eslint-disable-next-line vue/no-mutating-props
      props.list.unshift(node);
    } else {
      let insertId = props.node?.id;
      const nextKey = props.node?.data?.nextKey;
      if (nextKey) insertId = findInsertId(nextKey);
      const index = props.list.findIndex((item) => item.id === insertId);
      if (index === -1) return;
      // eslint-disable-next-line vue/no-mutating-props
      props.list.splice(index + 1, 0, node);
    }
    onNodeCreate(node, props.parent, props.flow);
  };
</script>

<style lang="less">
  .action-list {
    display: flex;
    // display: grid;
    // grid-template-columns: 1fr 1fr;
    grid-gap: 8px 10px;
    flex-wrap: wrap;
    max-width: 210px;
  }

  .action-item {
    display: flex;
    align-items: center;
    width: 100px;
    height: 30px;
    padding: 0 4px;
    border: 1px solid #e8ecf0;
    border-radius: 4px;
    color: #212528;
    cursor: pointer;

    &:hover {
    }

    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-right: 6px;
      border-radius: 4px;
      background: rgba(from var(--color) r g b / 10%);
      color: var(--color);
    }

    .i-icon,
    .iconfont {
      display: inline-flex;
      font-size: 16px;
      line-height: 1em;
    }
  }
</style>

<style lang="less">
  .list-actions-overlay {
    .ant-popover-inner-content {
      padding: 12px 8px;
    }
  }
</style>
