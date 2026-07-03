<template>
  <div class="px12px py20px text-[12px]">
    <a-dropdown :trigger="['click']">
      <a-button type="primary" :ghost="!bpmnReadonly" block :disabled="bpmnReadonly" @click.prevent>
        {{ t('sys.pageDesigner.newEvents') }}
        <DownOutlined class="ml4px" />
      </a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item
            v-for="evt in eventOptions"
            :key="evt"
            :disabled="events.some((e) => e.key === evt)"
            @click="handleClick(evt)"
          >
            {{ t(`sys.process.events.${evt}`) }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <div
      v-for="(item, i) in events"
      :key="i"
      class="border border-[#E0E3EA] border-solid rounded-4px relative"
      :class="[i === 0 ? 'mt16px' : 'mt12px']"
    >
      <div class="ks-row-middle overflow-hidden p8px bg-[#F2F4F7]">
        <div class="ks-col ell">{{ t(`sys.process.events.${item.key}`) }}</div>
        <template v-if="!bpmnReadonly">
          <i
            class="iconfont icon-bianji text-[#797A7D] cursor-pointer lh-16px mr8px"
            @click="onEdit(item, i)"
          ></i>
          <a-popconfirm
            :title="t('sys.sureToDo')"
            :getPopupContainer="(trigger) => trigger.parentNode as HTMLElement"
            placement="topRight"
            @confirm="onDelete(i)"
          >
            <i
              class="iconfont icon-shanchu2 text-[#797A7D] cursor-pointer error-gct-hover lh-16px"
            ></i>
          </a-popconfirm>
        </template>
      </div>
      <div class="p8px ell text-[#8F8F8F]" :title="returnScriptName(item.executeResourceId)">
        {{ returnScriptName(item.executeResourceId) }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import type { IGctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, onMounted, ref } from 'vue';
  import { NodeEventsGroupByType } from '../constants';
  import { Global, useProcess } from '../hook/useProcess';
  import SelectScript from './select-script.vue';
  import { EventsTypeEnum } from '../../global-events/constants';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const props = defineProps<{
    node: IGctBpmnNode | Global;
  }>();

  const { bpmnReadonly } = useProcess();
  const { t } = useI18n();
  const scriptOptions = ref<any[]>([]);

  const events = computed(() => {
    return props.node.data?.events || [];
  });

  const eventOptions = computed(() => {
    const evts = NodeEventsGroupByType[props.node.type];
    if (props.node.type === 'global') return evts;
    const buttonConfig: any[] = props.node?.data?.buttonConfig || [];
    return evts
      .filter((e) => buttonConfig.some((f) => f.type === e.type && f.enable))
      .map((e) => e.value);
  });

  onMounted(() => {
    getScriptData();
  });

  const handleClick = async (key) => {
    const res = await openModal({
      key,
      executeResourceType: EventsTypeEnum.SCRIPT_SERVICE,
    });
    if (res.ok) {
      const params = {
        ...res.params,
        relationType: props.node.type === 'global' ? 'PROC_DEF' : 'PROC_NODE_DEF',
      };
      if (props.node?.data?.events) {
        props.node.data!['events']!.push(params);
      } else {
        props.node.data!['events'] = [params];
      }
    }
  };

  const onEdit = async (item, index) => {
    const res = await openModal({ ...item });
    if (res.ok) {
      props.node.data!['events']?.splice(index, 1, { ...res.params });
    }
  };

  const onDelete = (index) => {
    props.node.data!['events']?.splice(index, 1);
  };

  const getScriptData = async () => {
    scriptOptions.value = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
  };

  const returnScriptName = (id) => {
    const opts = scriptOptions.value.map((e) => e.children).flat();
    return opts.find((e) => e.id === id)?.name;
  };

  async function openModal(data) {
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
    if (res.refresh) {
      getScriptData();
    }
    return res;
  }
</script>
<style lang="less" scoped>
  .add-btn {
    line-height: 32px;
    height: 32px;
    text-align: center;
    border: 1px solid var(--ant-primary-color);
    border-radius: 4px;
    color: var(--ant-primary-color);
    cursor: pointer;
  }

  :deep(.ant-dropdown-menu-item) {
    text-align: center;
  }

  :deep(.ant-popconfirm) {
    left: 218px !important;
  }
</style>
