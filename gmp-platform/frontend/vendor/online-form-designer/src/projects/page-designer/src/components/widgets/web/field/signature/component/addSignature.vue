<template>
  <div class="pt32px pb32px pl50px pr50px">
    <a-form :model="formState" autocomplete="off">
      <!-- <a-form-item :label="t('sys.pageDesigner.signatureType')" name="type">
        <a-radio-group v-model:value="formState.type" name="radioGroup">
          <a-radio value="1">{{ t('sys.pageDesigner.handwrittenSignature') }}</a-radio>
          <a-radio value="2">{{ t('sys.platform.ACCOUNT') }}</a-radio>
        </a-radio-group>
      </a-form-item> -->
      <component ref="compRef" :is="components[formState.type]" v-bind="$props" />
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import getSignature from './getSignature.vue';
  import writeModal from './writeModal.vue';
  import { Uploader } from '@/utils/uploader';
  import { useModal } from '@gct/runtime';
  import { postSignHistory } from '/@/apis/gct-apaas/SignHistoryController';
  import { postSignatureGetSignatureUploadOrWriteImage } from '/@/apis/gct-apaas/SignatureController';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  const userStore = useUserStoreWithOut();
  const compRef = ref();
  const formState = ref({ type: '2' });
  const components = {
    '1': writeModal,
    '2': getSignature,
  };

  /**
   * 添加签名记录并返回id
   * @export
   * @param opts
   * @return {*}
   */
  async function addSignHistory(opts: { url: string }): Promise<string> {
    const id = await postSignHistory(opts);
    return id!;
  }

  const getSignatureData = async (data) => {
    const { signatureImage, username, currentTime, signHistoryId } =
      await postSignatureGetSignatureUploadOrWriteImage(data);
    return {
      ok: true,
      params: {
        historyId: signHistoryId,
        url: signatureImage,
        time: currentTime,
        enableSignPassword: data.enableSignPassword,
        username,
        signatureName: userStore.getUserInfo?.fullname,
      },
    };
  };

  const onSave = async () => {
    if (formState.value.type === '1') {
      const fileObj = compRef.value?.getValue();
      try {
        const url = await Uploader.uploadByFile(fileObj.file, true);
        return {
          ok: true,
          params: {
            url,
            time: new Date().getTime(),
          },
        };
      } catch (error) {
        console.warn(error);
        return {
          ok: false,
        };
      }
    } else {
      const formData = await compRef.value?.save();
      return await getSignatureData(formData);
    }
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
