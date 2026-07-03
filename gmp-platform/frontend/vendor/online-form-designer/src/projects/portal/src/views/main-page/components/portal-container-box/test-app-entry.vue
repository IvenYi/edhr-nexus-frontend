<template>
  <CardBox
    :cardExtraProps="{ title: $t('sys.portal.myTestApp'), style: { height: '100%' } }"
    :needExtra="false"
  >
    <template #card-body>
      <a-spin
        v-if="isExistMineAppInfo"
        :spinning="loading"
        size="default"
        :wrapperClassName="`${prefixCls}__loading-wrap`"
      >
        <Scrollbar ref="scrollbarRef" class="scroll-container">
          <div class="mine-app-entry-area scroll-wrap">
            <div
              v-for="info in mineAppData"
              :key="info.id"
              class="mine-app-entry-item"
              @click="() => handleGotoApplication(info)"
            >
              <div class="mine-app-entry-item-img">
                <div
                  class="logo-icon relative"
                  :style="{
                    backgroundColor: info.logoType === 'ICON' ? info.logoBgColor : undefined,
                  }"
                >
                  <IconNext
                    v-if="info.logoType === 'ICON'"
                    :value="info.logo"
                    :color="info.logoColor"
                    :size="40"
                  />
                  <img v-else-if="info.logoType === 'SVG'" :src="info.logo" alt="" />
                  <img v-else :src="transformUrl(info.logoThumbnail)" alt="" />

                  <div
                    v-if="info.authState === 3"
                    class="absolute z-10 right-0 left-0 bottom-0 h-6"
                  >
                    <img class="absolute inset-0 -z-10" :src="expiredIcon" />
                    <div
                      class="translate-y-[5px] text-[10px] font-bold text-center text-[var(--ant-primary-color)]"
                    >
                      授权到期
                    </div>
                  </div>
                </div>
              </div>

              <div class="mine-app-entry-item-title" v-ellipsis-title="info.name">
                {{ info.name }}
              </div>

              <!-- <ToolTip :name="info.name" style="text-align: center; width: 100%" /> -->
            </div>
          </div>
        </Scrollbar>
      </a-spin>
      <div v-else class="h100% flex justify-center items-center">
        <a-empty :image="noData" />
      </div>
    </template>
  </CardBox>
</template>
<script setup lang="ts" name="mine-app-entry">
  import { ref, onMounted, computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import {
    getAppTenantRoleByRolesApps,
    getAppGetCurrentBranchByAppId,
  } from '/@/apis/gct-platform/AppController';
  import { AppResponse } from '/@/apis/gct-platform/model';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { openWindow } from '/@/utils';
  import CardBox from './card-box.vue';
  import { UserRoleReqEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { useUserStore } from '/@/store/modules/user';
  import { getLicenseGetUsers } from '/@/apis/gct-platform/LicenseController';
  import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';
  import gctMedpro from '/@/assets/svg/icon_medpro.svg';
  import gctBI from '/@/assets/svg/icon_bi.svg';
  import gctEAP from '/@/assets/svg/icon_eap.svg';
  import noData from '/@/assets/svg/pic_nodata.svg';
  import gctWMS from '/@/assets/svg/icon_wms.svg';
  import gctSPC from '/@/assets/svg/icon_spc.svg';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import svgExpiredBlue from '/@/assets/svg/icon-app-expired-blue.svg';
  import svgExpiredGreen from '/@/assets/svg/icon-app-expired-green.svg';

  const { isTestEnv } = useEnv();
  const { prefixCls } = useDesign('mine-app-entry');
  const userStore = useUserStore();
  const { themeSetting } = useThemeSetting();

  interface Props {
    /** 组件标题 */
    compTitle: string;
    /** 是否是设计器 */
    isDesign?: boolean;
  }

  const props = defineProps<Props>();

  const loading = ref<boolean>(false);

  const mineAppData = ref<AppResponse[]>([]);

  const isExistMineAppInfo = computed(() => {
    return mineAppData.value.length !== 0;
  });

  const expiredIcon = computed(() => {
    return themeSetting.themeColor === '#026AC8' ? svgExpiredBlue : svgExpiredGreen;
  });

  const getMineAppData = async () => {
    if (isTestEnv.value) return;
    loading.value = true;
    const { data } = await getAppTenantRoleByRolesApps(
      {
        roles: UserRoleReqEnum.TESTER,
      },
      { pageNo: 1, pageSize: 10 },
    );

    loading.value = false;
    mineAppData.value = data ?? [];
  };

  onMounted(() => {
    if (!props.isDesign) {
      getMineAppData();
    } else {
      const example = [
        {
          logoType: 'SVG',
          name: 'GCT-MedPro',
          logo: gctMedpro,
        },
        {
          logoType: 'SVG',
          name: 'GCT-EAP',
          logo: gctEAP,
        },
        {
          logoType: 'SVG',
          name: 'GCT-BI',
          logo: gctBI,
        },
        {
          logoType: 'SVG',
          name: 'GCT-WMS',
          logo: gctWMS,
        },
        {
          logoType: 'SVG',
          name: 'GCT-SPC',
          logo: gctSPC,
        },
      ];
      for (let i = 0; i < 20; i++) {
        mineAppData.value = mineAppData.value.concat(example);
      }
    }
  });

  const handleGotoApplication = async (data) => {
    if (props.isDesign) {
      return;
    }
    const res = await getAppGetCurrentBranchByAppId({
      appId: data.id,
    });
    if (res?.id) {
      const fingerprint = await getBrowserFingerprint();
      const clientId = `web.${userStore?.getUserInfo?.userId}.dev.${data.id}.${
        userStore?.getUserInfo?.ip
      }.${fingerprint}.${new Date().getTime()}`;
      getLicenseGetUsers({ appId: data.id, env: 'dev', clientId }).then((result) => {
        console.log('res========>', res);
        if (result) {
          openWindow(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB}`, {
            target: '_blank',
            genUrlData: { aid: data.id, bid: res.id },
          });
        } else {
          message.error(`【${data.name}】${t('sys.onlineError')}`);
        }
      });
    }
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-mine-app-entry';

  .@{prefix-cls} {
    &__loading-wrap {
      display: flex;
      position: relative;
      flex: auto;
      // height: 0;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      height: 100%;

      .ant-spin-container {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
<style lang="less" scoped>
  .mine-app-entry-area {
    display: grid;
    grid-gap: 12px 24px;
    grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
    height: 100%;
    padding: 0 20px 20px;
    overflow: auto;

    .mine-app-entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 108px;
      padding: 16px 0 8px;
      transition: 0.3s;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        // img,
        .logo-icon {
          box-shadow: 0 4px 16px 0 rgb(0 0 0 / 15%);
        }
      }

      &-img {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 64px;
        padding-bottom: 8px;
        overflow: hidden;
        border-radius: 4px;

        > img {
          width: 56px;
          height: auto;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          // background-color: #3370ff;
          width: 56px;
          height: 56px;
          overflow: hidden;
          border-radius: 16px;
          color: #fff;

          > img {
            width: 56px;
            height: auto;
          }
        }
      }

      &-title {
        display: -webkit-box;
        display: -moz-inline-box;
        display: inline-flexbox;
        flex: 1;
        overflow: hidden;
        color: #333;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        text-overflow: ellipsis;
        word-break: break-all;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        box-orient: 2;
      }
    }
  }

  .mine-app-empty-data {
    // display: flex;
    // align-items: center;
    // justify-content: center;
    height: 100%;
    // overflow: auto;
  }
</style>
