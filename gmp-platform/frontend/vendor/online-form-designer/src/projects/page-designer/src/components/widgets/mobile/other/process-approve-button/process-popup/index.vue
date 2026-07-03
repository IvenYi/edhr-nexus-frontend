<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    closeable
    :style="{ height: '100%' }"
    @closed="onClosed"
  >
    <div class="ks-column h100%">
      <div class="text-16px text-[#212528] text-center px32px py11px relative">
        <div class="absolute left-16px" @click="show = false">
          <van-icon name="arrow-left" />
        </div>
        <div class="w100% ell font-500">{{ config.title }}</div>
      </div>
      <div class="py6px ks-col">
        <van-form ref="formRef" :colon="true" required="auto" validate-trigger="onSubmit">
          <van-field
            v-if="config.user?.show"
            v-model="userName"
            is-link
            :border="false"
            :label="config.user?.label"
            :placeholder="t('sys.chooseText')"
            :rules="[
              { required: true, message: t('sys.chooseTextTip', { name: config.user?.label }) },
            ]"
            @click="openView"
          />
          <van-field
            v-if="config.signature && config.signatureTypes?.length === 2"
            :label="t('sys.pageDesigner.getSignature')"
            :border="false"
          >
            <template #input>
              <van-radio-group v-show="false" v-model="signatureType" direction="horizontal">
                <!-- <van-radio name="handwrite">
                  {{ t('sys.appDesigner.approval.signatureType.Handwritten') }}
                </van-radio> -->
                <van-radio name="account">
                  {{ t('sys.appDesigner.approval.signatureType.Account') }}
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-if="config.signature"
            v-model="form.signature"
            :border="false"
            :rules="[{ required: true, message: '请绘制签名' }]"
          >
            <template #input>
              <div
                class="bg-[#FBFBFC] min-h192px rounded-2px ks-row-center-middle border-1 border-dashed border-[#F0F0F0] relative w100%"
                @click="!form.signature && onSignature()"
              >
                <template v-if="form.signature">
                  <img
                    :src="MOBILE_MINIO_PATH + JSON.parse(form.signature).url"
                    style="width: 100%"
                  />
                  <div
                    class="absolute right-0px bottom-0px lh-16px text-[14px] primary-gct px8px py4px z-9"
                    @click.stop="form.signature = ''"
                  >
                    {{ t('sys.reset') }}
                  </div>
                </template>
                <template v-else>
                  <div class="text-16px text-[#8F8F8F]">
                    <div class="iconfont icon-qianming1 text-20px mb8px text-center lh-20px"></div>
                    {{ t('sys.pageDesigner.drawSignature') }}
                  </div>
                </template>
              </div>
            </template>
          </van-field>

          <van-field
            v-if="config.opinion?.show"
            v-model.trim="form.opinion"
            type="textarea"
            rows="4"
            maxlength="120"
            show-word-limit
            label-align="top"
            clearable
            :border="false"
            :label="t('sys.appDesigner.approval.opinion')"
            :placeholder="t('sys.appDesigner.placeEnterDesc')"
            :rules="[{ required: config.opinion?.required, message: '请输入审批意见' }]"
          />
        </van-form>
      </div>
      <div class="ks-row p16px">
        <div style="flex: 1">
          <van-button block @click="onReset">
            {{ t('sys.reset') }}
          </van-button>
        </div>
        <div class="pl16px" style="flex: 2">
          <van-button block type="primary" @click="onSubmit">
            {{ t('sys.pageDesigner.submit') }}
          </van-button>
        </div>
      </div>
    </div>
  </van-popup>

  <write-modal v-if="showWrite" v-model:value="showWrite" @on-confirm="handleComfirm" />
  <get-signature v-if="showAccount" v-model:value="showAccount" @on-confirm="handleComfirm" />
</template>
<script setup lang="ts">
  import writeModal from '../../../field/signature/component/writeModal.vue';
  import getSignature from '../../../field/signature/component/getSignature.vue';
  import { createListPopup } from '../../../__components__/listPopup';
  import { useI18n } from '@mobile/utils/useI18n';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { OPTIONS, FormData } from './index';
  import { cloneDeep } from 'lodash-es';
  import { getOrgUserPickerTenantManagementOrgUserPageList } from '@mobile/apis/gct-platform/OrgUserPickerController';
  import { ref, computed } from 'vue';
  import { createUserSelectPopup } from '../../../__components__/userSelectPopup';

  const { t } = useI18n();
  const formRef = ref();
  const show = ref(false);
  const form = ref<FormData>({
    signature: '',
    opinion: '',
  });
  const showWrite = ref(false);
  const showAccount = ref(false);
  const signatureType = ref();
  const config = ref<OPTIONS>({
    title: '',
  });
  const userName = ref();
  const userOptions = ref<any[]>([]);
  const userCheckeOpts = ref<any[]>([]);

  const searchVal = ref();
  async function getUserData(params = { pageNo: 1, keyword: '' }) {
    const { keyword, pageNo } = params;
    if (searchVal.value !== keyword) {
      searchVal.value = keyword;
      userOptions.value = [];
    }
    const res: any =
      (await getOrgUserPickerTenantManagementOrgUserPageList({ pageNo, pageSize: 20, keyword })) ||
      [];
    const data = (res.data || []).map((e: any) => {
      return {
        value: e.id,
        id: e.id,
        label: e.fullname,
      };
    });
    userOptions.value.push(...data);
    return res.pageNo * res.pageSize >= res.totalCount;
  }
  let openUserPopup;
  const open = (options: OPTIONS) => {
    show.value = true;
    config.value = cloneDeep(options);
    config.value.signatureTypes = options.signatureTypes ?? ['handwrite', 'account'];
    signatureType.value = 'account';

    openUserPopup = createUserSelectPopup({
      // api: getUserData,
      // options: userOptions,
      multiple: config.value.user?.multiple || false,
      title: config.value.user?.label || t('sys.chooseText'),
      // optionLabelProp: 'showTitle',
      // remote: true,
      // lazy: true,
      // showSearch: true,
      selectValues: userCheckeOpts,
    })?.openUserSelectPopup;
  };

  const onSignature = () => {
    if (signatureType.value === 'handwrite') {
      showWrite.value = true;
    } else if (signatureType.value === 'account') {
      showAccount.value = true;
    }
  };

  const handleComfirm = (file) => {
    form.value.signature = JSON.stringify(file);
  };

  const signatureUrl = computed(() => {
    try {
      const signature = JSON.parse(form.value.signature!);
      return signature?.url;
    } catch {
      return form.value.signature;
    }
  });

  function openView() {
    userOptions.value = [];
    openUserPopup &&
      openUserPopup({
        ids: form.value.user,
        callback({ a, checkOptions }) {
          form.value.user = a;
          userName.value = checkOptions.map((e) => e.fullname).join(',');
          userCheckeOpts.value = [...checkOptions];
        },
      });
  }

  const onSubmit = async () => {
    await formRef.value?.validate();
    show.value = false;
    if (config.value?.callback && typeof config.value.callback === 'function') {
      config.value.callback(form.value);
    }
  };

  const onClosed = () => {
    if (config.value?.reject && typeof config.value.reject === 'function') {
      config.value.reject();
    }
  };

  const onReset = () => {
    formRef.value?.resetValidation();
    form.value = {
      signature: '',
      opinion: '',
    };
  };

  defineExpose({
    show,
    form,
    open,
    onSubmit,
  });
</script>
<style lang="less" scoped>
  :deep(.van-popup__close-icon) {
    position: absolute;
    right: 16px;
    color: #212528;
    font-size: 16px;
  }

  :deep(.van-icon-arrow) {
    line-height: 24px;
  }
</style>
