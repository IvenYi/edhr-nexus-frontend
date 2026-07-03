<template>
  <div class="bpmn-header pl24px ks-row-middle relative">
    <div class="text-[#FFFFFF] ks-col">
      {{ processInfo.categoryName }}
      <span class="mx8px">/</span>
      {{ processInfo.name }}
    </div>
    <div v-if="curVersionInfo.status === BpmnVersionStatusEnum.DRAFT" class="buttons">
      <div class="button ml-16px cursor-pointer btn-block" @click="saveProcess()">
        <i class="iconfont icon-baocun1"></i>
        {{ $t('sys.saveText') }}
      </div>
      <div class="button ml-16px cursor-pointer btn-block" @click="publishProcess()">
        <i class="iconfont icon-fasong"></i>
        {{ $t('sys.ipaas.saveAndPublish') }}
      </div>
    </div>
    <div v-if="isFrontPage && curVersionInfo.status === BpmnVersionStatusEnum.PUBLISHED">
      <div class="button mr-16px cursor-pointer btn-block" @click="saveUsers()">
        <i class="iconfont icon-baocun1"></i>
        {{ $t('sys.saveText') }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { BpmnVersionStatusEnum } from '../constants';
  import { useProcess } from '../hook/useProcess';

  const { processInfo, saveProcess, publishProcess, curVersionInfo, isFrontPage, saveUsers } =
    useProcess();
</script>
<style lang="less" scoped>
  .buttons {
    position: absolute;
    display: flex;
    align-items: center;
    height: 30px;
    margin: 12px 0;
    top: 0;
    right: 12px;
  }

  .button {
    height: 26px;
    background: transparent;
    // border: 1px solid #e8ebf0;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    line-height: 1em;
    transition: all 0.3s;
    i {
      margin-right: 6px;
      display: flex;
      font-size: 12px;
    }
    &:hover {
      border-color: #fff;
    }

    &.btn-block {
      background: #444444;
      border: 1px solid #444444;
      &:hover {
        background: var(--ant-primary-color-hover);
        border-color: var(--ant-primary-color-hover);
      }
    }
  }
</style>
