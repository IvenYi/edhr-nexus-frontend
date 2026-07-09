<template>
  <div>
    <slot name="insertFooter"></slot>
    <a-button v-bind="cancelButtonProps" @click="handleCancel" v-if="showCancelBtn">
      {{ t(cancelText) }}
    </a-button>
    <slot name="centerFooter"></slot>
    <a-button
      :type="okType"
      @click="handleOk"
      :loading="confirmLoading"
      v-bind="okButtonProps"
      v-if="showOkBtn"
    >
      {{ t(okText) }}
    </a-button>
    <slot name="appendFooter"></slot>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Button } from 'ant-design-vue';
  import { basicProps } from '../props';
  import { useI18n } from '/@/hooks/web/useI18n';

  export default defineComponent({
    name: 'BasicModalFooter',
    props: basicProps,
    components: {
      'a-button': Button,
    },
    emits: ['ok', 'cancel'],
    setup(_, { emit }) {
      const { t } = useI18n();
      function handleOk(e: Event) {
        emit('ok', e);
      }

      function handleCancel(e: Event) {
        emit('cancel', e);
      }

      return { handleOk, handleCancel, t };
    },
  });
</script>
