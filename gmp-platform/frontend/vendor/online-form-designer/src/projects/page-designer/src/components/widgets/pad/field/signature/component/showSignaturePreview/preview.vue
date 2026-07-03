<template>
  <van-image-preview
    v-model:show="showPreview"
    :images="propsData.images"
    :startPosition="propsData.startPosition"
    className="gct-signature-overlay"
    closeable
    closeIcon="arrow-left"
    closeIconPosition="top-left"
    :overlayStyle="{
      backgroundColor: 'rgba(0,0,0, 1)',
    }"
  >
    <template #index>
      <div class="text-center pt18px"> 查看签名 </div>
    </template>
    <template #cover>
      <div class="image-preview-cover text-[#fff]">
        <div>
          <span>{{ t('sys.pageDesigner.verificationMethod') }}：</span>
          <span>{{
            propsData.enableSignPassword == 1
              ? '签名密码'
              : propsData.enableSignPassword == 2
              ? '域账号密码'
              : '账号密码'
          }}</span>
        </div>
        <div>
          <span>{{ t('sys.appDesigner.operatePerson') }}：</span>
          <span>{{ propsData.username }}</span>
        </div>
        <div>
          <span>{{ t('sys.pageDesigner.signatureTimeatureTime') }}：</span>
          <span>{{ propsData.dateTime }}</span>
        </div>
      </div>
    </template>
  </van-image-preview>
</template>

<script setup lang="ts" name="gct-custom-code">
  import { toRefs, computed, reactive } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';

  const { t } = useI18n();
  const showPreview = ref(false);
  const propsData = reactive({
    startPosition: 0,
    images: [],
    enableSignPassword: 0,
    username: '',
    dateTime: undefined,
  });
  function openPreview(props) {
    Object.assign(propsData, props);
    showPreview.value = true;
    console.log(props);
  }
  function closePreview() {
    console.log('xxxxx');
    showPreview.value = false;
  }
  defineExpose({ openPreview });
</script>

<style lang="less">
  .gct-signature-overlay {
    .van-image-preview__index {
      top: 0;
      width: 100%;
    }

    .van-image-preview__cover,
    .image-preview-cover {
      position: absolute;
      bottom: 0;
      width: 100%;
    }

    .van-image-preview__swipe {
      position: absolute;
      top: 0;
      width: 100%;
    }

    .image-preview-cover {
      padding: 12px 8px;
      background-color: rgb(0 0 0 / 10%);
      color: #fff;
    }

    .van-image__img {
      background-color: #fff;
    }
  }
</style>
