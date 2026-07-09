<template>
  <a-spin :spinning="loading" size="default" :wrapperClassName="`${prefixCls}__loading-wrap`">
    <CardBox :cardExtraProps="{ title: compTitle, style: { height: '100%' } }">
      <template #card-body>
        <div class="scroll-wrap" ref="scrollWrapRef" style="height: 100%">
          <a-tabs v-model:activeKey="activeKey" @change="tabClick" class="h-full">
            <a-tab-pane key="todo" :tab="$t('sys.menu.myTodo')">
              <todo />
            </a-tab-pane>
            <a-tab-pane key="initiator" :tab="$t('sys.menu.myDone')">
              <initiated />
            </a-tab-pane>
          </a-tabs>
        </div>
      </template>
    </CardBox>
  </a-spin>
</template>

<script setup lang="ts" name="my-audit">
  import { ref, onMounted, reactive } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import CardBox from '../card-box.vue';
  import Todo from './todo.vue';
  import Initiated from './initiated.vue';

  const { prefixCls } = useDesign('my-audit');

  interface Props {
    /** 组件标题 */
    compTitle: string;
  }

  defineProps<Props>();

  const loading = ref<boolean>(false);

  const typesList = [
    {
      label: $t('sys.kit.edhr.waitHandle'),
      key: 'todo',
    },
    {
      label: $t('sys.kit.edhr.initiated'),
      key: 'initiator',
    },
  ];

  const activeKey = ref<string>('todo');
  const tabClick = () => {};
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-my-audit';

  .@{prefix-cls} {
    &__loading-wrap {
      display: flex;
      position: relative;
      flex: auto;
      // height: 0;
      flex-direction: column;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;

      .ant-spin-container {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
<style lang="less" scoped>
  :deep(.ant-tabs-content-top) {
    height: 100%;
  }
</style>
