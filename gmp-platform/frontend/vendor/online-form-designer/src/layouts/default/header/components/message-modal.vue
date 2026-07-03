<template>
  <div class="px64px h100% ks-row message">
    <div class="info-btn">
      <span class="top-right-text text-[#797A7D]">{{ $t('sys.menu.messageTips') }}</span>
      <a-button type="link" @click="readAll">{{ $t('sys.menu.setMessageState') }}</a-button>
    </div>
    <div class="w168px message-aside">
      <div
        class="message-type-item"
        :class="[type === 'ALL' ? 'active' : '']"
        @click="type = 'ALL'"
      >
        {{ $t('sys.menu.allMessage') }}
      </div>
      <div
        class="message-type-item"
        :class="[type === 'UNREAD' ? 'active' : '']"
        @click="type = 'UNREAD'"
      >
        {{ $t('sys.menu.unReadMessage') }}
      </div>
    </div>
    <div class="message-content ks-col pl20px pb15px">
      <MessageList v-if="type === 'ALL'" :type="type" :appId="appId" :isFront="true" />
      <MessageList v-if="type === 'UNREAD'" :type="type" :appId="appId" :isFront="true" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import MessageList from '../../../../projects/portal/src/views/message/component/main.vue';
  import { putInternalMessageReadAll } from '/@/apis/gct-platform/InternalMessageController';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const props = defineProps({
    appId: {
      type: String,
      default: '',
    },
  });
  const type = ref('ALL');

  const { mitt } = useMitt();

  const readAll = () => {
    const config = props.appId
      ? {
          transferToConfig: { headers: { 'App-Tag': props.appId } },
        }
      : {};
    putInternalMessageReadAll(config).then(() => {
      mitt.emit('read-message-all');
    });
  };
</script>
<style lang="less" scoped>
  .message {
    &-aside {
      padding-top: 24px;
      border-right: 1px solid @gct-modal-border-color;
    }

    &-type-item {
      margin-bottom: 8px;
      padding: 7px;
      border-right: 2px solid transparent;
      color: #212528;
      text-align: center;
      cursor: pointer;

      &:hover {
        background-color: #f7f8fa;
      }

      &.active {
        border-color: var(--ant-primary-color);
        background-color: #f7f8fa;
        color: var(--ant-primary-color);
        font-weight: 500;
      }
    }
  }

  .info-btn {
    position: absolute;
    top: 12px;
    right: 90px;
  }

  :deep(.ant-empty) {
    margin-top: 20px;
  }
</style>
