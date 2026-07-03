<template>
  <van-dialog
    v-model:show="show"
    :title="$t('sys.tip')"
    @confirm="close()"
    @cancel="close()"
    className="gct-dialog"
  >
    <van-count-down
      v-if="deadline"
      :time="deadline"
      @finish="close()"
      class="mt-8px pb15px text-center"
    >
      <template #default="timeData">
        密码错误次数已到限制，账号被锁定，请在
        <span v-if="hour"> {{ timeData.hours }} 时</span>
        <span v-if="hour || minute"> {{ timeData.minutes }} 分</span>
        <span> {{ timeData.seconds }} 秒</span>
        后重试
      </template>
    </van-count-down>
  </van-dialog>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const props = defineProps<{
    time?: string;
  }>();
  const emit = defineEmits(['closeModalEvent']);
  const hour = ref();
  const minute = ref();

  const close = () => {
    emit('closeModalEvent');
  };

  const deadline = ref();

  const show = ref(false);

  function setTimer() {
    const second = +props.time.slice(-2);
    hour.value = +props.time.slice(0, 2);
    minute.value = +props.time.slice(2, 4);

    deadline.value = (hour.value * 60 * 60 + minute.value * 60 + second) * 1000;
  }
  setTimer();

  defineExpose({
    show,
  });
</script>
<style lang="less">
  .gct-dialog {
    color: #1a1d23;

    .van-dialog__header {
      padding-top: 15px;
      font-size: 16px;
    }

    .van-dialog__footer {
      border-top: 1px solid rgb(128 128 128 / 55%);
    }

    .van-dialog__content {
      padding: 0 24px;
      font-size: 12px;
    }
  }
</style>
