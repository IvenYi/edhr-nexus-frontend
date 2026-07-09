<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${t(`sys.platform.${mode?.label}`)}${t('sys.config')}`"
    centered
    width="680px"
    :minHeight="40"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item :label="relationtext[mode?.value]" name="appId" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.appId"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        v-if="mode?.value == LoginTypeEnum.QIYEWEIXIN"
        label="AgentId"
        name="agentId"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.agentId"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        v-if="mode?.value == LoginTypeEnum.MICROSOFT"
        label="客户端密码"
        name="secret"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.secret"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        v-if="mode?.value == LoginTypeEnum.MICROSOFT"
        label="目录（租户）ID"
        name="agentId"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.agentId"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        v-if="mode?.value != LoginTypeEnum.MICROSOFT"
        :label="`${relationPassword[mode?.value]} Secret`"
        name="secret"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.secret"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        :label="
          mode?.value == LoginTypeEnum.QIYEWEIXIN
            ? t('sys.platform.callbackDomain')
            : t('sys.platform.redirectURL')
        "
        name="redirectURL"
      >
        <a-input
          v-model:value="formState.redirectURL"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
          :disabled="true"
        />
        <CopyOutlined class="copy-btn ml-8px cursor-pointer" @click="handleCopy" />
      </a-form-item>
      <a-form-item v-if='mode?.value != LoginTypeEnum.MICROSOFT' name="boolDefaultLoginMethod" :label="t('sys.SignType')">
        <a-checkbox v-model:checked="formState.boolDefaultLoginMethod" :disabled="mode.isCurrent">
          {{ t('sys.platform.setDefaultLoginMethod') }}
        </a-checkbox>
      </a-form-item>
      <a-form-item
        v-if="mode?.value == LoginTypeEnum.QIYEWEIXIN"
        name="certFileName"
        :label="t('sys.platform.domainOwnershipVerification')"
      >
        <a-upload
          v-model:file-list="fileList"
          accept=".txt"
          name="file"
          :customRequest="customRequest"
          :showUploadList="false"
        >
          <a-button>
            <FolderAddOutlined />
            上传文件
          </a-button>
        </a-upload>
        <div v-show="formState.certFileName" class="flex bg-[#F2F9FE] mt-12px h38px w70% file-area">
          <span class="ell">{{ formState.certFileName }}</span>
          <a-popconfirm
            title="文件校验后不能删除，删除后有可能会影响使用，请谨慎操作哦！"
            ok-text="确认"
            @confirm="confirm"
            style="width: 100px"
          >
            <span>{{ t('sys.delete') }}</span>
          </a-popconfirm>
        </div>
        <div v-if="mode?.value == LoginTypeEnum.QIYEWEIXIN" class="help" @click="expand = !expand">
          <DownOutlined style="font-size: 12px" v-if="expand" />
          <RightOutlined style="font-size: 12px" v-else />
          {{ t('sys.platform.help') }}
        </div>
        <div v-show="expand">
          <div class="mb-12px">
            将图片中<span style="color: #dd1e20">红框内容</span>点击【下载文件】，提供给我们
          </div>
          <div class="mb-12px ml-8px">
            <div class="font-500 mb-8px"> 路径指引： </div>
            <div class="color-[#666666]">
              <a @click="toHelp">开发者中心</a> - 应用管理 - 应用详情 - 开发者接口（设置可信域名）
            </div>
          </div>
          <img src="/@/assets/images/qywx-help.png" style="width: 385px" />
        </div>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { FormInstance, message } from 'ant-design-vue';
  import { reactive, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  import { LoginTypeEnum } from '/@/hooks/platform/constants';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postLoginCheckApp } from '/@/apis/gct-platform/LoginController';
  import { postPlatUploadCertFile } from '/@/apis/gct-platform/PlatformConfigController';

  const { loginModeConfig, loginSetting, openIDOAuthAuthTypes } = useLoginSetting();
  const { t } = useI18n();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const expand = ref(false);
  const formRef = ref<FormInstance>();
  const mode = reactive({
    label: '',
    value: '',
    icon: '',
    isCurrent: false,
    type: '',
  });
  const formState = reactive({
    appId: '',
    secret: '',
    agentId: '',
    redirectURL: `${import.meta.env.DEV ? 'http://paas.paasdev.gct-paas.com' : location.origin}`,
    retryTimes: 0,
    boolDefaultLoginMethod: false,
    certFileName: '',
  });

  const relationtext = ref({
    QIYEWEIXIN: 'CorpId',
    FEISHU: 'App ID',
    DINGDING: 'Client ID',
    MICROSOFT: '应用程序（客户端）ID',
  });
  const relationPassword = ref({
    QIYEWEIXIN: '',
    FEISHU: 'App',
    DINGDING: 'Client',
  });

  const fileList = ref<any>([]);

  const onDeactivated = (data) => {
    const { label, icon, value, type } = data;
    console.log('data', data);
    mode.type = type || '';
    mode.value = value;
    mode.label = label;
    mode.icon = icon;
    mode.isCurrent = data.isCurrent;
    formState.appId = data.appId;
    formState.certFileName = data.certFileName;
    formState.secret = data.secret;
    data.agentId ? (formState.agentId = data.agentId) : '';
    formState.boolDefaultLoginMethod = data.defaultAuthType === value;
    if (value === LoginTypeEnum.QIYEWEIXIN) {
      formState.redirectURL = `${
        import.meta.env.DEV ? 'paas.paasdev.gct-paas.com' : location.host
      }`;
    } else if (value === LoginTypeEnum.MICROSOFT) {
      // formState.redirectURL = import.meta.env.VITE_MICROSOFT_REDIRECTURL;
      formState.redirectURL = `${window.location.origin}/auth`;

    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    fileList.value = [];
    expand.value = false;
    closeModal();
  };

  const toHelp = () => {
    window.open('https://developer.work.weixin.qq.com/');
  };

  const customRequest = async ({ file }) => {
    console.log('file', file);
    const nameArr = file.name.split('.');
    const type = nameArr[nameArr.length - 1];
    if (type !== 'txt') {
      message.warn(`【${file.name}】支持的扩展名为.txt`);
      return Promise.reject();
    }

    fileList.value = [
      {
        uid: file.uid,
        name: file.name,
        fileSize: file.size,
        path: '',
        percentNum: 0,
      },
    ];

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await postPlatUploadCertFile(formData, {
        transferToConfig: {
          timeout: 300 * 1000,
          headers: {
            'Content-Type': 'multipart/form-data;charset=UTF-8',
          },
        },
        errorMessageMode: 'none',
      });

      formState.certFileName = res;
    } catch (error) {}
  };

  const confirm = () => {
    formState.certFileName = '';
  };

  const handleOk = async () => {
    formRef.value?.validate().then(async () => {
      postLoginCheckApp({ ...formState, authType: mode.value }).then(() => {
        loginModeConfig.get(mode.value).appId = formState.appId;
        loginModeConfig.get(mode.value).secret = formState.secret;
        loginModeConfig.get(mode.value).redirectURL = formState.redirectURL;
        loginModeConfig.get(mode.value).certFileName = formState.certFileName;
        formState.agentId ? (loginModeConfig.get(mode.value).agentId = formState.agentId) : '';

        if (formState.boolDefaultLoginMethod && !mode.isCurrent) {
          loginSetting.defaultAuthType = mode.value;
          if (!openIDOAuthAuthTypes.value.includes(mode.value)) {
            openIDOAuthAuthTypes.value.push(mode.value);
          }
        }
        closeModal();
      });
    });
  };

  const handleCopy = () => {
    const { isSuccessRef } = useCopyToClipboard(formState.redirectURL);
    unref(isSuccessRef) && message.success(t('sys.copySuccess'));
  };
</script>

<style lang="less" scoped>
  .help {
    margin: 8px 0 0;

    &:hover {
      color: var(--ant-primary-color);
    }
  }

  .file-area {
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    color: #474747;
  }
</style>
