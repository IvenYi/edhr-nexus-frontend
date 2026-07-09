<template>
  <div class="pl16px pr16px pb40px pt10px">
    <div v-for="(app, index) in checkedMenus" :key="index" class="mb5">
      <div class="font-bold text-16px mt10px mb10px">{{ app.name }}</div>
      <div style="display: flex; flex-wrap: wrap">
        <appItem
          opeType="remove"
          v-for="(i, ci) in app.children"
          :key="i.menuId"
          :app="{
            ...i,
            color: '#FFFFFF',
            bgColor: i.color,
          }"
          @remove="removeApp(app.children!, ci, index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import appItem from '@mobile/components/appItem/index.vue';
  import type { AppMueus } from '@mobile/components/appItem/type';

  const props = defineProps<{
    checkedMenus: AppMueus[];
  }>();
  const checkedMenus = ref(props.checkedMenus);
  function removeApp(children: AppMueus[], ci: number, index: number) {
    children.splice(ci, 1);
    if (!children.length) {
      checkedMenus.value.splice(index, 1);
    }
  }
</script>
<style scoped lang="less"></style>
