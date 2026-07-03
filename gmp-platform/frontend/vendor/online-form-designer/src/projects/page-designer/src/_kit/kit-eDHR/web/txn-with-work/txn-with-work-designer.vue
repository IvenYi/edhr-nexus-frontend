<template>
  <div class="online-form-list-designer">
    <a-list item-layout="horizontal" :data-source="demoList">
      <template #header>
        <div class="font-bold">{{ title }}</div>
      </template>
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a>{{ item.title }}</a>
            </template>
            <template #avatar>
              <a-avatar src="/src/assets/icons/platform/document.svg" />
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>

    <!-- <slot name="footer">
      <div class="flex justify-center items-center mt-4" v-if="showAction">
        <a-button type="primary" class="w-full" v-if="operationType === E_OPERATION_TYPE.START"
          >开工</a-button
        >
        <a-button type="primary" danger class="w-full" v-else>完工</a-button>
      </div>
    </slot> -->
  </div>
</template>

<script setup lang="ts" name="online-form-list-designer">
  import { ref, toRefs } from 'vue';
  // import { E_OPERATION_TYPE, ITxnWithWork } from './schema';

  const demoList = ref<any[]>([
    {
      title: '示例表单1',
      id: '1',
    },
    {
      title: '示例表单2',
      id: '2',
    },
  ]);

  const props = defineProps<{
    widget: any;
  }>();

  const { title, showAction, operationType } = toRefs(props.widget.props);
</script>

<style lang="less" scoped></style>
