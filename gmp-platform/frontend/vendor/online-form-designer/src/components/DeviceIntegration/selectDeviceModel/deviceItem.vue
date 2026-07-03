<template>
  <div class="device mx-auto mb8px p12px" :class="{ 'device-active': selected }">
    <div class="ks-row-middle">
      <div class="ks-col ell title">{{ item.name }}</div>
      <div class="mqtt px8px py4px ks-row-middle" v-if="item.type === 'MQTT'">
        <span class="icon-dot mr4px"></span>
        <span>MQTT</span>
      </div>
    </div>
    <div class="text-12px text-[#8B8B8B]"> 编码:{{ item.key }} </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';

  const props = defineProps<{
    item: any;
    selected?: boolean;
  }>();
</script>
<style scoped lang="less">
  .device {
    width: 232px;
    height: 64px;
    border: 1px solid #e0e3eb;
    border-radius: 4px;
    background: #fff;

    &:hover {
      background-color: #f2f5f8;
    }

    .mqtt {
      display: inline-flex;
      border: 1px solid #a6a6a6;
      border-radius: 20px;
      background: rgb(166 166 166 / 10%);
      font-size: 12px;
      line-height: 1;
      text-align: center;
    }

    .icon-dot {
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #a6a6a6;
    }
  }

  .device-active {
    border: 1px solid rgb(2 106 200 / 30%);
    background: rgb(2 106 200 / 8%);

    .title {
      font-weight: 500;
    }

    .mqtt {
      border: 1px solid rgb(72 198 92 / 50%);
      background: rgb(72 198 92 / 10%);
      color: #48c65c;

      .icon-dot {
        background-color: #48c65c;
      }
    }
  }
</style>
