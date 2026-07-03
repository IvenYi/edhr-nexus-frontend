<template>
  <div class="ks-row h100% p-24px">
    <User class="pt200px mr10px" />
    <div class="ipad-user ks-col">
      <van-cell
        v-if="!isSandbox"
        is-link
        :title="$t('sys.mobile.personalInfo')"
        title-class="text-18px"
        :border="false"
        @click="baseInfo"
      >
        <template #icon>
          <div class="ks-row-middle mr16px">
            <gct-icon value="icon-preset:icon_grxx_pad" size="20" />
          </div>
        </template>
      </van-cell>
      <van-cell
        v-if="!isSandbox"
        is-link
        :title="$t('sys.mobile.changePassword')"
        title-class="text-18px"
        :border="false"
        @click="password"
      >
        <template #icon>
          <div class="ks-row-middle mr16px">
            <gct-icon value="icon-preset:icon_xgmm_pad" size="20" />
          </div>
        </template>
      </van-cell>
      <van-cell
        @click="i18nChangeLanguage"
        is-link
        :title="$t('sys.mobile.languageSettings')"
        title-class="text-18px"
        :border="false"
      >
        <template #icon>
          <div class="ks-row-middle mr16px">
            <gct-icon value="icon-preset:icon_yysz_pad" size="20" />
          </div>
        </template>
        <template #value> {{ getCurrentLocale.label }} </template>
      </van-cell>
      <van-cell
        is-link
        :title="$t('sys.mobile.timeZoneSelection')"
        title-class="text-18px"
        :border="false"
        @click="changeTimeZone"
      >
        <template #icon>
          <div class="ks-row-middle mr16px">
            <gct-icon value="icon-preset:icon_sqxz_pad" size="20" />
          </div>
        </template>
        <template #value> {{ TimeZone }} </template>
      </van-cell>
      <van-cell :title="$t('sys.mobile.about')" title-class="text-18px" :border="false">
        <template #icon>
          <div class="ks-row-middle mr16px">
            <gct-icon value="icon-preset:icon_about_phone" size="20" />
          </div>
        </template>
        <template #value> 版本 {{ __APP_VERSION__ }}</template>
      </van-cell>
      <div class="single-app" v-if="releaseApp.length && !appStore.isInAppPage && !isSandbox">
        <van-cell
          :title="$t('sys.mobile.singleApplicationMode')"
          title-class="text-18px"
          :border="false"
        >
          <template #icon>
            <div class="ks-row-middle mr16px">
              <gct-icon value="icon-preset:icon_dyyms_pad" size="20" />
            </div>
          </template>
          <template #value>
            <div class="h24px">
              <van-switch
                :modelValue="appStore.appSingle"
                class="text-20px!"
                @click.stop="changeSingleApp"
              />
            </div>
          </template>
        </van-cell>
      </div>

      <div class="login-out ks-row-middle" @click.stop="submitLoginOut(router)">
        <span class="gct-iconfont icon-icon_tuichuyulan-copy text-20px"></span>
        <span class="text-18px ml8px">{{ $t('sys.mobile.dropdownItemLoginOut') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, h, computed } from 'vue';
  import { getI18nConfigList } from '/@/apis/gct-platform/I18nConfigController';
  import {
    UserData,
    MasterTenant,
    reloadUser,
    initUser,
    submitLoginOut,
    initMqttApp,
    initMqttApaas,
    CurrentTenant,
  } from '@mobile/stores/loginHooks';
  import { createIosPopup } from '@mobile/InstanceComponent/select-picker';
  import {
    changeLocale,
    i18nLocaleStore,
    getCurrentLocale,
    i18nConfigList,
  } from '@mobile/locales/useLocale';
  import { _isAndroid } from '@mobile/utils/const';
  import { TimeZoneoptions, TimeZone } from '@mobile/stores/timeZone';
  import User from './user.vue';
  import { useAppStore } from '@mobile/stores/useAppStore';
  import { showToast } from 'vant';
  import { LogoTypeEnum } from '@mobile/type';
  import { SqlitePage } from '@mobile/utils/sqlite_page';
  import { mqttUnSubscribe, mqttPublish } from '@mobile/utils/mqtt/android';
  import { getAid } from '@mobile/stores/sessionHooks';
  import { getMobileBrowserFingerprint, getPageIdentification } from '@/hooks/event/userBrowser';
  import { getEnv } from '@/utils/env';
  import { useEnv } from '@mobile/utils/useEnv';

  const appStore = useAppStore();
  const releaseApp = computed(() => appStore.getAppOptions);
  const router = useRouter();
  const route = useRoute();
  const { isSandbox } = useEnv();

  const { openIosPopup } = createIosPopup();
  onMounted(async () => {
    await reloadUser();
  });

  async function changeTimeZone() {
    const time = await openIosPopup({
      value: [TimeZone.value],
      options: TimeZoneoptions.map((i) => {
        return { text: i, value: i };
      }),
      title: $t('sys.mobile.timeZoneSelection'),
    });
    TimeZone.value = time.value[0];
  }
  async function i18nChangeLanguage() {
    const localeItem = await openIosPopup({
      value: [i18nLocaleStore.value],
      options: i18nConfigList.value.map((i) => {
        return { text: i.label, value: i.locale };
      }),
      title: $t('sys.mobile.languageSettings'),
    });
    const locale = localeItem.value[0];
    changeLocale(locale);
  }
  function baseInfo() {
    router.push({ name: 'info' });
  }
  function password() {
    router.push({ name: 'password' });
  }

  async function changeSingleApp() {
    if (appStore.appSingle) {
      appStore.clearSingleApp();
      showToast({
        message: h('div', [
          h('span', { class: 'iconfont icon-you1_right-two1' }),
          $t('sys.mobile.closedSuccessfully', { title: $t('sys.mobile.singleApplicationMode') }),
        ]),
      });
    } else {
      const localeItem = await openIosPopup({
        value: [],
        options: releaseApp.value.map((i) => {
          return { text: i.name, value: i.id, _app: i };
        }),
        title: $t('sys.mobile.selectApp'),
        async beforeSelect([id]) {
          await SqlitePage.updateAppDB(id);
        },
      });
      const { _app, value, text } = localeItem.select[0];
      const logo = {
        logoType: _app.logoType,
        logo: _app.logoType === LogoTypeEnum.Image ? _app.logoThumbnail : _app.logo,
        color: _app.logoColor,
        bgColor: _app.logoType === LogoTypeEnum.Image ? '#fff' : _app.logoBgColor,
      };

      appStore.setSingleApp(value, text, _app.tenantId, logo);

      showToast({
        message: h('div', [
          h('span', { class: 'iconfont icon-you1_right-two1' }),
          $t('sys.mobile.successfullyOpened', { title: $t('sys.mobile.singleApplicationMode') }),
        ]),
      });
    }
    router.replace({
      name: route.name,
      params: route.params,
      query: { ...route.query, refreshKey: new Date().getTime() },
    });
  }
</script>
<style scoped lang="less">
  .ipad-user {
    position: relative;
    box-sizing: border-box;
    padding: 46px 72px;
    border-radius: 8px;
    background-color: #fff;
  }

  .single-app {
    padding: 10px 0;
    border-top: 1px solid #e0e3eb;
    border-bottom: 1px solid #e0e3eb;

    @media (max-height: 600px) {
      padding: 5px 0;
    }
  }

  :deep(.van-cell) {
    padding: 26px 0;
    background-color: transparent;

    @media (max-height: 680px) {
      padding: 20px 0;
    }

    @media (max-height: 600px) {
      padding: 16px 0;
    }

    .van-cell__value,
    .van-cell__right-icon {
      color: #8b8b8b;
    }
  }

  .login-out {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 32px;
  }
</style>
