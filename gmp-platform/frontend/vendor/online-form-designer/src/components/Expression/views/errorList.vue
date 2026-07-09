<template>
  <div class="overflow-y-auto h110px">
    <div v-for="i in errors" class="rows" @click="activeMarker(i)" @dblclick="dbActiveMarker(i)">
      <div> <close-circle-outlined :style="{ color: '#F54547' }" /></div>
      <div class="ks-col ml4px">
        <span class="text-[#474747]"> {{ i.message }}</span>
        <span class="text-[#8F8F8F] ml4px">[行{{ i.tipLine }},列{{ i.tipColumn - 1 }}]</span></div
      >
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  interface Errors {
    message: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }
  const emit = defineEmits(['onMarkerByEvent']);
  defineProps<{
    errors: Errors[];
  }>();

  let timer: any = null;

  function activeMarker(i) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      emit('onMarkerByEvent', i, 'activeMarker');
    }, 350);
  }
  function dbActiveMarker(i) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    emit('onMarkerByEvent', i, 'dbActiveMarker');
  }
  defineExpose({});
</script>

<style lang="less" scoped>
  .rows {
    display: flex;
    padding: 4px 12px;
    cursor: pointer;

    &:hover {
      background-color: #eff3fd;
    }

    .active {
      background-color: #3168ec;
    }
  }
</style>
