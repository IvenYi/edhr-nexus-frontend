<template>
  <div class="operation-list-designer px-1">
    <div class="font-bold mb-2">{{ title }}</div>
    <a-input-search placeholder="搜索" enter-button style="margin-bottom: 10px" />
    <div v-for="item in demoList" :key="item.id">
      <div class="flex items-center justify-between p-2 my-2">
        <div style="color: var(--ant-primary-color)">{{ item.title }}</div>

        <slot name="rightExtra">
          <!-- <div class="flex items-center gap-2">
            <span type="primary" size="small">返</span>
            <span type="primary" size="small">报</span>
          </div> -->
        </slot>
      </div>
    </div>

    <slot name="footer"> </slot>
  </div>
</template>

<script setup lang="ts" name="operation-list-designer">
  import { ref, toRefs } from 'vue';
  import { IOperationList } from './schema';

  const demoList = ref<any[]>([
    {
      title: '示例工序1',
      id: '1',
    },
    {
      title: '示例工序2',
      id: '2',
    },
  ]);

  const props = defineProps<{
    widget: IOperationList;
  }>();

  const { title } = toRefs(props.widget.props);
  const activeStyle = {
    'box-shadow': '0px 0px 3px var(--ant-primary-color)',
  };
</script>

<style lang="less" scoped></style>
