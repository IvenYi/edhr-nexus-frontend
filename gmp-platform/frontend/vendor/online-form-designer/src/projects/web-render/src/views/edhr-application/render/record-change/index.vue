<template>
  <basic-page-render>
    <div :class="[ns.b()]">
      <leftContainer
        :class="[ns.e('left')]"
        v-model:value="formData"
        :showRecordChange="showRecordChange"
        @query-click-callback="updateCallback"
      />
      <record-change-container
        ref="containerRef"
        :materialNo="formData.instanceId || formData.recordId"
        :recordType="formData.recordType"
        :instanceStatus="formData.instanceStatus"
      />
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import RecordChangeContainer from './record-change-container.vue';
  import leftContainer from './left-container.vue';

  const ns = useNamespace('record-change-index');
  const props = withDefaults(
    defineProps<{
      showRecordChange: boolean;
      recordType?: string;
    }>(),
    {
      showRecordChange: true,
      recordType: 'eDHR',
    },
  );
  const formData = ref({
    recordType: undefined,
    recordId: undefined,
    instanceId: undefined,
    instanceStatus: undefined,
  });

  watch(
    () => props.recordType,
    (recordType) => {
      formData.value.recordType = recordType;
    },
    { immediate: true },
  );

  const containerRef = ref();

  const updateCallback = () => {
    containerRef.value?.updateEdhrCounter();
  };
</script>

<style lang="less" scoped>
  .gct-record-change-index {
    display: flex;
    height: 100%;
    width: 100%;

    &__right {
      position: relative;
      flex: 1;
      height: 100%;
      overflow: hidden;

      .edhr-filling-area {
        display: flex;
        flex-direction: column;
        position: relative;
        // padding: 16px 16px 16px 20px;
        background-color: #fff;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .edhr-filling-empty-area {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        height: 100%;
      }

      .edhr-filling-loading-area {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
      }
    }
  }
</style>
