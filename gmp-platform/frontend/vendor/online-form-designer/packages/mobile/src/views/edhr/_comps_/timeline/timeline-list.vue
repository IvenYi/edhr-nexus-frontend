<template>
  <div class="relative">
    <div class="b-1px b-dashed b-[#E0E3EA] absolute top-0px left-4px h-full"> </div>
    <div>
      <div class="relative pl-20px not-last-mb-24px" v-for="(item, index) in list" :key="index">
        <i
          class="bg-[#3168EC] rounded-50% absolute h-10px w-10px b-2px b-solid b-[#C1D2FF] left-0px top-8px"
        ></i>
        <div class="flex justify-between items-center">
          <div class="color-[#666]">
            <slot name="time" :record="item"></slot>
          </div>
          <div class="color-[#1E314F]">
            <slot name="title" :record="item"></slot>
          </div>
        </div>
        <div class="bg-[#FBFBFC] mt-8px">
          <slot :record="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    list: any[];
  }>();
</script>
<style scoped lang="less"></style>
