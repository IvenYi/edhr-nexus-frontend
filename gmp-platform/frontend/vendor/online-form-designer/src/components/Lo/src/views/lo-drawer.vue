<template>
  <a-drawer
    width="90vw"
    :bodyStyle="{
      padding: '0px',
    }"
    :closable="false"
    v-model:visible="visible"
  >
    <lo-designer />
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, provide } from 'vue';
  import LoDesigner from './lo-designer.vue';
  import { useLo } from '../hooks/useLo';
  import { LoDataObject } from '../types';

  // interface Options {
  //   callback: (value: string) => void;
  // }

  // interface Options {
  //   data: string;
  //   callback: (value: string) => void;
  // }

  // const props = defineProps<InitOptions>();

  interface InitOptions {
    data: LoDataObject;
    callback: (value: string) => void;
  }

  const { setLoData } = useLo();
  let options: Partial<InitOptions> = {};

  const visible = ref<boolean>(false);
  const setVisible = (data = true) => {
    visible.value = data;
  };

  const drawerCloseCallback = (data) => {
    data && options.callback && options.callback(data);
    setVisible(false);
  };

  // todo 循环依赖
  provide('drawerCloseCallback', drawerCloseCallback);

  const initLoEditor = (payload: InitOptions) => {
    options = payload;
    setLoData(payload.data, true);
    setVisible(true);
  };

  defineExpose({
    initLoEditor,
  });
</script>

<style></style>
