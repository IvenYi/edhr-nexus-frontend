<template>
  <div class="personal-center">
    <div class="personal-info w100%" :style="headerBgColor">
      <div class="ks-row">
        <div class="position-relative pl20px" @click="showAvatar = true">
          <vImage
            v-if="displayContent.includes(PersonalCenterType.PROFILE)"
            fit="cover"
            :size="60"
            round
            class="bg-[#FFFFFF] border-2px border-[#FFFFFF] border-solid flex-none"
            :src="UserData.avatar"
            :key="UserData.avatar"
          />
          <div class="position-absolute edit-icon">
            <i
              class="gct-iconfont icon-bianjiziliao_yidongduan color-[#ffffff]"
              style="font-size: 12px"
            ></i>
          </div>
        </div>
        <div class="ks-col user flex-1 ml-16px">
          <div class="ks-row-middle mb4px" @click="showConsole">
            <span class="text-20px font-600 inline-block mr4px user-name">
              {{ UserData.fullname }}
            </span>
            <template v-if="displayContent.includes(PersonalCenterType.GENDER)">
              <i v-if="UserData.gender === 1" class="iconfont icon-a-nanxing_male2"></i>
              <i v-else-if="UserData.gender === 0" class="iconfont icon-a-nvxing_female2"></i>
              <i v-else class="iconfont icon-baomi"></i>
            </template>
          </div>
          <div class="text-[12px]" v-if="displayContent.includes(PersonalCenterType.ENTERPRISE)">
            <div>
              {{ CurrentTenant.name }}
            </div>
            <div>
              {{ CurrentTenant.duty }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-wrap">
      <van-cell :title="$t('sys.mobile.personalInfo')" is-link @click="baseInfo" :border="false">
        <template #icon>
          <div class="ks-row-middle mr12px">
            <gct-icon value="icon-preset:icon_grxx_pad" size="18" />
          </div>
        </template>
      </van-cell>
      <van-cell
        v-if="!isTestEnv"
        :title="$t('sys.mobile.changePassword')"
        is-link
        :border="false"
        @click="password"
      >
        <template #icon>
          <div class="ks-row-middle mr12px">
            <gct-icon value="icon-preset:icon_xgmm_pad" size="18" />
          </div>
        </template>
      </van-cell>
      <van-cell
        :title="$t('sys.mobile.languageSettings')"
        is-link
        :value="getCurrentLocale.label"
        :border="false"
        @click="selectLang"
      >
        <template #icon>
          <div class="ks-row-middle mr12px">
            <gct-icon value="icon-preset:icon_yysz_pad" size="18" />
          </div>
        </template>
      </van-cell>
      <van-cell
        :title="$t('sys.mobile.timeZoneSelection')"
        is-link
        :value="TimeZone"
        :border="false"
        @click="selectTime"
      >
        <template #icon>
          <div class="ks-row-middle mr12px">
            <gct-icon value="icon-preset:icon_sqxz_pad" size="18" />
          </div>
        </template>
      </van-cell>
      <van-cell :title="$t('sys.mobile.about')" :border="false">
        <template #icon>
          <div class="ks-row-middle mr12px">
            <gct-icon value="icon-preset:icon_about_phone" size="18" />
          </div>
        </template>

        <template #value> 版本 v{{ AppVersion }} </template>
      </van-cell>
    </div>
    <div class="mt10px">
      <van-button @click="submitLoginOut(router)" block native-type="submit">
        <span class="text-[#212528] text-16px font-600">{{
          $t('sys.mobile.dropdownItemLoginOut')
        }}</span>
      </van-button>
    </div>
  </div>

  <van-popup v-model:show="showPopup" position="bottom" :style="{ height: '40%' }">
    <van-picker
      v-model="activeKey"
      :title="title"
      :columns="options"
      @cancel="showPopup = false"
      @confirm="onPickerConfirm"
    />
  </van-popup>
  <avatarModal v-model:value="showAvatar" @on-confirm="handleComfirmAvatar" />
</template>

<script setup lang="ts">
  import {
    submitLoginOut,
    UserData,
    CurrentTenant,
    MasterTenant,
    reloadUser,
    initUser,
    initMqttApp,
    initMqttApaas,
  } from '@mobile/stores/loginHooks';
  import { PersonalCenterType } from '@gct/runtime';
  import { AppVersion, _isAndroid } from '@mobile/utils/const';
  import { TimeZoneoptions, TimeZone } from '@mobile/stores/timeZone';
  import { ServeStart } from '@native/index';
  import type { LocaleType } from '#/config';
  import {
    changeLocale,
    i18nLocaleStore,
    getCurrentLocale,
    i18nConfigList,
  } from '@mobile/locales/useLocale';
  import { useEnv } from '@mobile/utils/useEnv';
  import VConsole from 'vconsole';
  import avatarModal from '@mobile/views/main/user/components/avatar-modal.vue';
  import { postUserSettings } from '@mobile/apis/gct-platform/UserController';
  import { useplatSetting } from '@mobile/utils/useplatSetting';

  const { themeSetting } = useplatSetting();

  const headerBgColor = computed(() => {
    return {
      background: `linear-gradient(
        136deg,
        ${themeSetting.primaryColor},
        ${themeSetting.primaryColor}A3
      )`,
    };
  });
  var clickCount = 0;
  var timer = null;

  function showConsole() {
    // 清除之前的计时器，以防多次点击时计数器未重置
    clearTimeout(timer);
    clickCount++;
    if (clickCount > 5) {
      new VConsole();
    }
    // 设置延迟，如果在这个时间内再次点击，则重置点击次数
    timer = setTimeout(function () {
      clickCount = 0;
    }, 1000); // 延迟1000毫秒（1秒）
  }
  const showAvatar = ref(false);

  const props = defineProps<{
    model: object;
    hideTenantToggle: boolean;
  }>();

  const { isTestEnv } = useEnv();

  let callback: (v: any) => void;
  const htmlversion = ref('');
  const title = ref('');
  const context = ref('');
  const showPopup = ref(false);
  const activeKey = ref([]);
  const options = ref<{ label: string; key: string; value: any; text: string }[]>([]);
  const router = useRouter();
  const route = useRoute();
  const handleComfirmAvatar = async (url: string) => {
    await postUserSettings({ ...UserData.value, avatar: url });
    await initUser();
  };
  const displayContent = computed(() => {
    return (
      props.model?.data?.displayContent || [
        PersonalCenterType.PROFILE,
        PersonalCenterType.GENDER,
        PersonalCenterType.ENTERPRISE,
      ]
    );
  });

  async function getVersion() {
    if (_isAndroid) {
      const version = await ServeStart.getVersion();
      htmlversion.value = version;
    }
  }
  getVersion();
  reloadUser();

  function baseInfo() {
    router.push({ name: 'info' });
  }
  function password() {
    router.push({ name: 'password' });
  }
  async function onPickerConfirm({ selectedOptions }) {
    if (callback) {
      await callback(selectedOptions[0].item);
    }
    showPopup.value = false;
  }

  /**
   * 切换时区
   */
  function selectTime() {
    activeKey.value = [TimeZone.value];
    options.value =
      TimeZoneoptions.map((i) => {
        return { item: i, label: i, key: i, text: i, value: i };
      }) || [];
    showPopup.value = true;
    title.value = '时区切换';
    context.value = '选择时区';
    callback = (value) => {
      TimeZone.value = value;
      activeKey.value = [value];
    };
  }
  /**
   * 切换语言
   */
  async function selectLang() {
    activeKey.value = [i18nLocaleStore.value];
    options.value = i18nConfigList.value.map((i) => {
      return { item: i, label: i.label!, key: i.locale!, text: i.label!, value: i.locale! };
    });
    showPopup.value = true;
    title.value = '语言切换';
    context.value = '选择语言';
    callback = async ({ label, locale }) => {
      activeKey.value = [locale];
      await changeLocale(locale as LocaleType);
    };
  }
</script>
<style scoped lang="less">
  .personal-center {
    position: relative;
    box-sizing: border-box;
    height: 100vh;
    padding-bottom: 56px;
    overflow-y: auto;

    .personal-info {
      position: relative;
      height: 160px;
      padding-top: 58px;
      color: #fff;
    }
  }

  .content-wrap {
    position: relative;
    padding-top: 10px;
    background-color: #fff;
  }

  :deep(.van-button) {
    height: 50px;
    border: 0;
    border-radius: 8px;
  }

  .toggle {
    position: absolute;
    top: 32px;
    right: 0;
    width: 88px;
    height: 28px;
    border-radius: 20px 0 0 20px;
    background-color: rgb(0 0 0 / 20%);
    color: #fff;
    line-height: 1;

    .icon-qiehuan {
      font-size: 12px;
    }
  }

  .user {
    max-width: calc(100% - 80px);

    .user-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .edit-icon {
    display: flex;
    top: 46px;
    right: -2px;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background: rgb(0 0 0 / 30%);
  }

  :deep(.van-cell) {
    padding: 16px;
    background-color: transparent;

    .van-cell__value,
    .van-cell__right-icon {
      color: #8b8b8b;
      font-size: 12px;
    }
  }

  .single-app {
    border-top: 1px solid #e0e3eb;
  }
</style>
