<template>
  <div class="pb40px main leading-none">
    <van-cell
      v-for="(i, index) in infolist"
      :key="index"
      :title="i.label"
      :value="UserData[i.key]"
      is-link
      @click="editInfo(i)"
      :border="false"
    >
      <template #value>
        <span v-if="i.type === 'avatar'">
          <vImage
            v-if="UserData.avatar"
            fit="cover"
            :size="24"
            round
            class="bg-[#FFFFFF] border-1px border-[#FFFFFF] border-solid ml4px mr12px flex-none"
            :src="UserData.avatar"
            :key="UserData.avatar"
          />
        </span>
        <span v-else-if="i.key === 'signatureImage'">
          <img
            v-if="
              UserData.signType === 'UPLOAD'
                ? UserData.signatureImage
                : UserData.signatureImageWrite
            "
            class="h32px w58px"
            :src="i.callback(UserData.signType === 'UPLOAD')"
          />
        </span>
        <span v-else-if="i.callback">{{ i.callback(UserData[i.key]) }}</span>
        <span v-else>{{ UserData[i.key] }}</span>
      </template>
    </van-cell>
    <!-- 性别操作菜单 -->
    <van-action-sheet
      v-model:show="show"
      :actions="columns"
      cancel-text="取消"
      close-on-click-action
      @cancel="show = false"
      @select="selectGender"
    />
  </div>
  <!-- 签名 -->
  <writeModal
    v-if="showWrite"
    v-model:value="showWrite"
    :src="MOBILE_MINIO_PATH + UserData.signatureImageWrite"
    :username="UserData.fullname"
    :isBase64="true"
    :title="$t('sys.pleaseSign')"
    @on-confirm="handleComfirm"
  />
  <avatarModal v-model:value="showAvatar" @on-confirm="handleComfirmAvatar" />
</template>

<script setup lang="ts">
  import { UserData, CurrentTenant, MasterTenant, initUser } from '@mobile/stores/loginHooks';
  import { PlatformSettingEnum } from '@mobile/type';
  import { getPlatInfo } from '/@/apis/gct-platform/PlatformConfigController';
  import type { ActionSheetAction } from 'vant';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { postUserSettings } from '@mobile/apis/gct-platform/UserController';
  import writeModal from '/@page-designer/components/widgets/mobile/field/signature/component/writeModal.vue';
  import { postMinioFileBase64Upload } from '@mobile/apis/gct-platform/FileController';
  import avatarModal from './components/avatar-modal.vue';

  const genderOptions = {
    '-1': '保密',
    '0': '女',
    '1': '男',
  };
  const columns = [
    { name: '女', value: '0' },
    { name: '男', value: '1' },
  ];

  const show = ref(false);
  const showAvatar = ref(false);
  const info = ref();
  const router = useRouter();
  const showWrite = ref(false);
  const otherOrgs = ref<{ fieldName: string; relationField: string }[]>([]);
  const infolist = reactive<
    { label: string; key: keyof typeof UserData.value; callback?: (v: any) => string }[]
  >([
    {
      label: '头像',
      key: 'avatar',
      type: 'avatar',
    },
    {
      label: '姓名',
      key: 'fullname',
    },
    {
      label: '性别',
      key: 'gender',
      callback: (value: string) => genderOptions[value] || '',
    },
    {
      label: '手机号',
      key: 'mobile',
      callback: (value: string) => (value ? UserData.value.country + value : ''),
    },
    {
      label: '邮箱',
      key: 'email',
    },
    {
      label: '签名',
      key: 'signatureImage',
      callback: (bool: boolean) =>
        bool
          ? MOBILE_MINIO_PATH.value + UserData.value.signatureImage
          : MOBILE_MINIO_PATH.value + UserData.value.signatureImageWrite,
    },
  ]);

  getPlatInfo({ configEnum: PlatformSettingEnum.ORGANIZATION }).then((res) => {
    if (res?.value) {
      otherOrgs.value = JSON.parse(res.value).extFieldConfigs;
    }
  });

  const editInfo = (recordinfo) => {
    if (recordinfo.key === 'gender') {
      show.value = true;
    } else if (recordinfo.key === 'signatureImage') {
      showWrite.value = true;
    } else if (recordinfo.key === 'avatar') {
      showAvatar.value = true;
    } else {
      router.push({ name: recordinfo.key });
    }
  };

  const handleComfirm = async (file) => {
    const date = new Date().getTime();
    const url = await postMinioFileBase64Upload({
      fileContent: file,
      filename: `${$t('sys.pageDesigner.handwrittenSignature')}_${date}.png`,
    });
    await postUserSettings({ ...UserData.value, signatureImageWrite: url, signType: 'WRITE' });
    await initUser();
  };
  const handleComfirmAvatar = async (url: string) => {
    await postUserSettings({ ...UserData.value, avatar: url });
    await initUser();
  };

  const selectGender = async (action: ActionSheetAction) => {
    await postUserSettings({ ...UserData.value, gender: action.value });
    await initUser();
  };
  initUser();
</script>
<style scoped lang="less">
  .main {
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
    background-color: #f9f9f9;
  }

  .title {
    padding-left: 15px;
    border-left: 4px solid #0daa9cff;
    color: #000;
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
  }
</style>
