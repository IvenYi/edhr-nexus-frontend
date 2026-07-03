<template>
  <div class="pl50px pr50px pt24px pb24px">
    <a-form ref="formRef" :model="formState" autocomplete="off" colon layout="vertical">
      <div v-if="signature" class="mb8px">
        <span class="mr8px"> {{ $t('sys.pageDesigner.getSignature') }} </span>
        <!-- <a-radio-group
          v-if="signatureOptions?.length === 2"
          v-model:value="signatureType"
          @change="handleSignatureTypeChange"
        >
          <a-radio value="handwrite">
            {{ $t('sys.appDesigner.approval.signatureType.Handwritten') }}
          </a-radio>
          <a-radio value="account">
            {{ $t('sys.appDesigner.approval.signatureType.Account') }}
          </a-radio>
        </a-radio-group> -->
      </div>
      <a-form-item
        v-if="signature && signatureType === 'handwrite'"
        name="signature"
        :rules="[
          {
            required: true,
            message: $t('请添加签名确认'),
          },
        ]"
      >
        <div
          class="electronic-signature-container ks-row-middle-center"
          style="border: 1px dashed #dcdfe6"
        >
          <WacomRender
            :widget="{ style: { width: '538', height: '240' } }"
            :resetText="$t('sys.reset')"
            ref="wacomRef"
            style="z-index: 9"
          />
        </div>
      </a-form-item>

      <div class="account-signature" v-if="signature && signatureType === 'account'">
        <a-form-item name="account" :label="$t('sys.userName')" required>
          <a-input
            v-model:value="formState.account"
            :placeholder="$t('sys.pleaseInputSth', { sth: $t('sys.userName') })"
          />
        </a-form-item>
        <a-form-item
          name="password"
          :label="$t(`sys.platform.signWay.${getSignWay()}`)"
          :rules="[{ required: true }]"
        >
          <a-input-password
            v-model:value="formState.password"
            :placeholder="
              $t('sys.pleaseInputSth', {
                sth: $t(`sys.platform.signWay.${getSignWay()}`),
              })
            "
            autocomplete="new-password"
          />
        </a-form-item>
      </div>
      <a-form-item
        v-if="user?.show"
        :label="user.label"
        name="user"
        :rules="[
          {
            required: true,
            message: $t('sys.chooseTextTip', { name: user.label }),
          },
        ]"
      >
        <a-select
          v-model:value="formState.user"
          :options="userOptions"
          :mode="user.multiple ? 'multiple' : ''"
          :placeholder="$t('sys.chooseText')"
          style="width: 100%"
          :open="false"
          @click.stop="handleAdd"
        />
      </a-form-item>

      <a-form-item
        v-if="opinion?.show"
        :label="$t('sys.appDesigner.approval.opinion')"
        name="opinion"
        :rules="[
          {
            required: opinion?.required,
            message: $t('sys.pleaseInputSth', { sth: $t('sys.appDesigner.approval.opinion') }),
          },
        ]"
      >
        <a-textarea
          v-model:value.trim="formState.opinion"
          show-count
          :maxlength="120"
          :placeholder="$t('sys.pleaseInputSth', { sth: $t('sys.appDesigner.approval.opinion') })"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="process-modal">
  import { ref, reactive, computed, toRaw } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { postFileResourceBase64Upload } from '/@/apis/gct-apaas/FileResourceController';
  import {
    postSignatureGetSignatureImage,
    postSignatureGetSignatureUploadOrWriteImage,
  } from '/@/apis/gct-apaas/SignatureController';
  import WacomRender from '/@page-designer/components/widgets/web/other/wacom/wacom-render.vue';
  import { useModalPicker } from '/@/components/UserPick';
  import CryptoJS from 'crypto-js';
  import { message as Message } from 'ant-design-vue';
  import { openUserSlectModal } from '/@/projects/app-designer/src/components/user-select';
  import { postSignHistory } from '/@/apis/gct-apaas/SignHistoryController';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  export interface FormState {
    opinion?: string;
    signature?: string;
    user?: string | string[];
    account: string;
    password: string;
    historyId?: string;
  }

  interface OpinionOptions {
    show: boolean;
    required: boolean;
  }

  const props = defineProps<{
    modal: any;
    title: string; // 弹窗的标题
    signatureTypes?: Array<'handwrite' | 'account'>;
    signature?: boolean;
    opinion?: OpinionOptions;
    user?: {
      show: boolean;
      multiple: boolean;
      label: string;
    };
  }>();

  const { getSignWay } = useRootSetting();

  const emit = defineEmits(['ok', 'register']);

  const formRef = ref<FormInstance>();

  const wacomRef = ref();

  const formState = reactive<FormState>({
    opinion: undefined,
    signature: undefined,
    account: '',
    password: '',
    user: [],
  });

  const userOptions = ref<any[]>([]);

  // eslint-disable-next-line vue/no-mutating-props
  props.modal.ok = async () => {
    if (props.signature) {
      if (signatureType.value === 'handwrite') {
        const bas = wacomRef.value.getValue();
        formState.signature = bas ? await uploadBybase(bas) : '';
      } else {
        const { url, signHistoryId, username, currentTime } = await getSignature();
        formState.signature = JSON.stringify({
          url,
          historyId: signHistoryId,
          username,
          currentTime,
        });
      }
    }

    await formRef.value?.validate();

    return { ok: true, data: { ...formState } };
  };

  const signatureOptions = computed(() => {
    return props.signatureTypes ?? ['handwrite', 'account'];
  });
  const signatureType = ref('account');

  // 处理签名类型变化
  const handleSignatureTypeChange = () => {
    // 清空签名
    formState.signature = undefined;
    // 清空wacom签名
    wacomRef.value?.clear();
    // 清空账户表单
    formState.account = '';
    formState.password = '';
    formRef.value?.resetFields('signature');
  };

  const { openPickerByUser } = useModalPicker();
  const handleAdd = async () => {
    // openPickerByUser({
    //   multiple: props.user?.multiple ?? false,
    //   userIds: props.user?.multiple ? formState.user || [] : formState.user,
    //   callback: async (value, rows) => {
    //     formState.user = props.user?.multiple ? value : value[0];
    //     formRef.value?.validate(['user']);
    //     rows.forEach((e: any) => {
    //       if (!userOptions.value.some((f) => f.value === e.id)) {
    //         userOptions.value.push({
    //           value: e.id,
    //           label: e.fullname,
    //         });
    //       }
    //     });
    //   },
    // });
    const res = await openUserSlectModal({
      selectKeys: props.user?.multiple ? formState.user || [] : formState.user,
      multiple: props.user?.multiple ?? false,
    });
    formState.user = res.selectKeys;
    formRef.value?.validate(['user']);
    userOptions.value = res.selectOptions.map((e) => {
      return {
        value: e.id,
        label: e.fullname,
      };
    });
  };

  const uploadBybase = async (base64file) => {
    const date = new Date().getTime();
    const url = await postFileResourceBase64Upload({
      fileContent: base64file,
      filename: `${$t('sys.pageDesigner.handwrittenSignature')}_${date}.png`,
    });
    return url;
  };

  const getSignature = async () => {
    await formRef.value?.validate();
    const { signatureImage, username, currentTime, signHistoryId } =
      await postSignatureGetSignatureUploadOrWriteImage({
        username: formState.account,
        password: getSignWay() === 'DOMAIN' ? formState.password : sha256(formState.password),
        type: getSignWay(),
      });
    return { url: signatureImage, signHistoryId, username, currentTime };
  };

  function sha256(password) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }
</script>
<style lang="less" scoped>
  .account-signature {
    padding: 12px 16px;
    border: 1px dashed #dcdfe6;
  }

  .electronic-signature-container {
    position: relative;
    background-color: #fcfcfc;

    &::after {
      content: '绘制签名';
      position: absolute;
      z-index: 0;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ccc;
      font-size: 24px;
      font-weight: 500;
    }
  }
</style>
