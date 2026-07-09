<template>
  <a-tooltip
    placement="bottomLeft"
    color="#fff"
    v-if="userName && readonly"
    :overlayStyle="{ 'z-index': 100001 }"
  >
    <template #title>
      <div>
        <div>
          <span class="text-[#777]">{{ $t('sys.pageDesigner.verificationMethod') }}：</span>
          <span class="text-[#474747]">{{
            enableSignPassword == 1
              ? '签名密码'
              : enableSignPassword == 2
                ? '域账号密码'
                : '账号密码'
          }}</span>
        </div>
        <div>
          <span class="text-[#777]">{{ $t('sys.appDesigner.operatePerson') }}：</span>
          <span class="text-[#474747]">{{ userName }}</span>
        </div>
        <div>
          <span class="text-[#777]">{{ $t('sys.pageDesigner.signatureTimeatureTime') }}：</span>
          <span class="text-[#474747]">{{ dateTime }}</span>
        </div>
      </div>
    </template>
    <slot></slot>
  </a-tooltip>
  <slot v-else></slot>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  /**enableSignPassword 是否使用签名密码 */
  defineProps<{
    userName: string;
    dateTime: string;
    enableSignPassword: number;
    readonly: boolean;
  }>();
</script>
<style scoped lang="less"></style>
