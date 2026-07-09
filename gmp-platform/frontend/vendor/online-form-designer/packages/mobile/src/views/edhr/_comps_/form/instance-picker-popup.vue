<template>
  <basic-popup
    v-model:show="show"
    title="绑定表单实例"
    :popup-props="popupProps"
    :extra-style="{
      left: 'auto',
      right: 0,
      height: 'auto',
      width: '480px',
    }"
  >
    <div class="p-8px">
      <van-form ref="FormRef">
        <van-field
          required
          v-model="formData.no"
          label="表单流水码"
          placeholder="请输入表单流水码"
          input-align="right"
          :rules="[
            {
              required: true,
              message: '请输入表单流水码',
            },
          ]"
          right-icon="scan"
          :right-icon-size="19"
          @click-right-icon="onScanClick"
        />
        <van-field
          :model-value="formData.tmplName"
          label="表单模板名称"
          disabled
          input-align="right"
        />
        <van-field
          :model-value="formData.ofCode"
          label="表单模板编码"
          disabled
          input-align="right"
        />
        <van-field
          :model-value="
            formData.materialStatus ? t(`sys.edhr.materialStatus.${formData.materialStatus}`) : ''
          "
          label="表单类型"
          disabled
          input-align="right"
        />
        <van-field
          :model-value="
            formData.instanceStatus
              ? t(`sys.edhr.instanceStatus2FormEnum.${formData.instanceStatus}`)
              : ''
          "
          label="表单状态"
          disabled
          input-align="right"
        />
      </van-form>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleCreate">确认</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { getOnlineFormInstanceGetOne } from '/@/apis/gct-apaas/FormInstanceController';
  import { debounce } from 'lodash-es';
  import { showFailToast } from 'vant';
  import { i18n } from '@mobile/locales/setupI18n';
  import { GctNative } from '@native/index';

  const { t } = i18n.global;

  interface ICreateInstance {
    no: string;
  }

  const props = defineProps<{
    popupProps: any;
    context: {
      materialNo: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const formData = ref<Partial<ICreateInstance>>({});
  const FormRef = ref();

  watch(
    () => formData.value.no,
    (value) => {
      loadFormInstByNoDebounce(value);
    },
  );

  const loadFormInstByNo = async (no?: string) => {
    if (!no || !no.trim()) {
      formData.value = {};
    }
    const res = await getOnlineFormInstanceGetOne({
      materialStatus: 'FORM,LOT,SN',
      serialNo: no,
    });
    if (!res) {
      showFailToast('表单实例不存在，请重新输入');
      return;
    }
    Object.assign(formData.value, res);
  };

  const loadFormInstByNoDebounce = debounce(loadFormInstByNo, 300);

  const done = () => {
    show.value = false;
  };

  const handleCreate = async () => {
    try {
      await FormRef.value?.validate();
      const { id: instId } = formData.value;
      if (!instId) {
        showFailToast('表单实例不存在，请重新输入');
        return;
      }
      if (props.onOk && typeof props.onOk === 'function') {
        props.onOk(
          {
            instId,
          },
          done,
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  /** 扫码输入 */
  const onScanClick = () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        console.log('扫码结果', value);
        formData.value.no = value.result;
      },
    });
  };
</script>

<style scoped lang="less"></style>
