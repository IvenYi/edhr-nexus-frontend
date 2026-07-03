<template>
  <div class="px50px pt20px pb25px flex justify-center">
    <div>
      <div class="color-[#8B8B8B]">{{ $t('sys.platform.writeInTheAreaBelow') }}</div>
      <WacomRender
        class="wacom"
        :widget="{ style: { width: '530', height: '312' } }"
        :username="username"
        :resetText="resetText"
        ref="wacomRef"
        style="z-index: 9"
      />
    </div>
  </div>
  <div class="footer">
    <a-button @click="cacncel">{{ t('sys.cancelText') }}</a-button>
    <a-button type="primary" @click="handleOk" class="ml8px">{{ t('sys.okText') }}</a-button>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted, nextTick } from 'vue';
  import WacomRender from '/@page-designer/components/widgets/web/other/wacom/wacom-render.vue';
  import { IModal } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postMinioFileBase64Upload } from '/@/apis/gct-platform/FileController';

  const defProps = defineProps<{
    modal: IModal;
    resetText: string;
    url?: string;
    username?: string;
  }>();
  const { t } = useI18n();

  const wacomRef = ref();

  function cacncel() {
    defProps.modal.dismiss();
  }
  const uploadBybase = async (base64file) => {
    const date = new Date().getTime();
    const url = await postMinioFileBase64Upload({
      fileContent: base64file,
      filename: `${$t('sys.pageDesigner.handwrittenSignature')}_${date}.png`,
    });
    return url;
  };

  const handleOk = async () => {
    const bas = wacomRef.value.getValue();
    const url = bas ? await uploadBybase(bas) : '';
    defProps.modal.dismiss({ ok: true, params: { url } });
  };
  onMounted(() => {
    wacomRef.value.setValue(defProps.url);
  });
</script>
<style lang="less" scoped>
  .footer {
    width: 100%;
    padding: 16px;
    border-top: 1px solid #e0e3ea;
    background-color: #fff;
    text-align: right;
  }

  .wacom {
    width: 530px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    background: #fdfdfd;
  }
</style>
