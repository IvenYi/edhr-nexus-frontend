<template>
  <div class="pt56px laybox">
    <div class="text-center text-18px font-bold pt12px pb12px absolute title">{{ title }}</div>
    <div class="text-12px text-[#7F8695FF] ml16px mb5px">{{ context }}</div>
    <van-cell :title="i.label" @click="setVal(i.value)" v-for="(i, index) in options" :key="index">
      <template #right-icon>
        <div class="ks-row-middle">
          <van-icon name="success" class="text-18px primary-color" v-if="activeKey === i.key" />
        </div>
      </template>
    </van-cell>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    options: { label: string; key: string; value: any }[];
    activeKey: string;
    title: string;
    context: string;
  }>();
  const emit = defineEmits(['checked']);
  function setVal(value) {
    emit('checked', value);
  }
</script>
<style scoped lang="less">
  .title {
    z-index: 1;
    top: 0;
    width: 100%;
    background-color: #f6f6f6ff;
  }

  .laybox {
    height: 100%;
    overflow-y: auto;
    background-color: #f6f6f6ff;
  }
</style>
