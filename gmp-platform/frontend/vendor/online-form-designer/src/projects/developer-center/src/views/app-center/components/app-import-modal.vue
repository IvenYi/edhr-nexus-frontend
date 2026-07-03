<template>
  <div class="app-import-modal">
    <div class="app-import-modal-content">
      <img :src="ImportLoading" class="loading-img" />
      <p>{{ t('sys.importing') }}</p>
    </div>
    <div class="app-import-modal-bottom">
      <span class="app-name">{{ appName }}</span>
      <span class="app-capacity">{{ appCapacity }}</span>
      <a-progress :percent="percent" status="active" />
    </div>
  </div>
</template>

<script setup lang="ts" name="app-import-modal">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postApp } from '/@/apis/gct-platform/AppController';
  import ImportLoading from '/@/assets/gif/import-loading.gif';

  const { t } = useI18n();

  const props = defineProps<{
    modal: IModal;
    file: IData;
    params: IParams;
    successFunc: IParams;
  }>();

  const percent = ref(0);
  const timer = ref(null);

  const appName = computed(() => {
    return props?.file?.name;
  });

  const appCapacity = computed(() => {
    const num = props?.file?.size / 1024 / 1024;
    return parseInt(num) + 'MB';
  });

  function countUp() {
    let count = 1;
    let intervalDuration;
    if (count < 50) {
      intervalDuration = 100 + parseInt(50 * Math.random());
    } else if (count > 50 && count < 90) {
      intervalDuration = 300 + parseInt(300 * Math.random());
    } else {
      intervalDuration = 1000 + parseInt(500 * Math.random());
    }

    timer.value = setInterval(() => {
      count++;
      if (count > 99) {
        clearInterval(timer.value);
      } else {
        percent.value = count;
      }
    }, intervalDuration);
  }

  countUp();

  setTimeout(async () => {
    await postApp(props.params, {
      transferToConfig: {
        timeout: 5 * 60 * 1000,
      },
    });
    percent.value = 100;
    timer.value && clearInterval(timer.value);
    props.successFunc();
    props.modal.dismiss();
  }, 100);
</script>

<style lang="less" scoped>
  .app-import-modal {
    padding: 0 60px;
    &-content {
      .loading-img {
        width: 240px;
        margin: 0 auto;
        display: block;
      }
      p {
        text-align: center;
        font-weight: 500;
        font-size: 16px;
        color: #212528;
      }
    }
    &-bottom {
      margin-top: 80px;
      margin-bottom: 50px;
      font-weight: 400;
      font-size: 14px;

      .app-name {
        color: #212528;
      }

      .app-capacity {
        margin-left: 16px;
        color: #c3c3c3;
      }
    }
  }
</style>
