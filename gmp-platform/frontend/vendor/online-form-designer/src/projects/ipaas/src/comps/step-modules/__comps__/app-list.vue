<template>
  <!-- <SimpleCollapse title="应用选择">
  </SimpleCollapse> -->
  <div class="ks-column h100%">
    <div class="px12px">
      <a-input v-model:value="searchKey" :placeholder="$t('sys.ipaas.inputAppNameOrIdentifier')">
        <template #suffix>
          <!-- <search-outlined class="color-[#8F8F8F]" /> -->
          <i class="iconfont icon-sousuo1 color-[#8F8F8F]"></i>
        </template>
      </a-input>
    </div>

    <div class="ks-col px12px pt6px mt6px overflow-y-auto">
      <a-spin size="large" :spinning="spinning" style="width: 100%; margin-top: 50px" />

      <div
        class="connector-app__option"
        :class="{
          selected: item.id === value,
          'important-cursor-not-allowed': disabled,
        }"
        v-for="item in appConnectorsFiltered"
        :key="item.id"
        @click="() => emit('change', item)"
      >
        <div class="card-header">
          <div class="card-header-img">
            <template v-if="item.logoType === LogoTypeEnum.Icon">
              <div
                class="logo-icon"
                :style="{
                  '--logo-background': item.logoBgColor,
                }"
              >
                <IconNext :value="item.logo" :size="20" :color="item.logoColor" />
              </div>
            </template>
            <template v-else-if="item.logoType === LogoTypeEnum.Image">
              <img :src="transformUrl(item.logoThumbnail)" alt="" />
            </template>
          </div>
        </div>
        <div class="lh-[18px]">
          <div class="w-65% ell">{{ item.name }}</div>
          <div class="color-[#C3C3C3] ell">{{ item.id }}</div>
          <span class="absolute top-0px right-0px color-[#C3C3C3] w-30% ell text-right">
            <div
              class="card-status-extra status-publishFail"
              v-if="[AppStatusEnum.UNHEALTHY].includes(item.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ $t('sys.developer.appCenter.publishFail') }}</span>
            </div>
            <div
              class="card-status-extra status-publishing"
              v-if="[AppStatusEnum.PROGRAM_LOCKED].includes(item.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ $t('sys.developer.appCenter.publishing') }}</span>
            </div>
            <div
              class="card-status-extra status-ok"
              v-if="[AppStatusEnum.HEALTHY].includes(item.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ $t('sys.developer.appCenter.enabled') }}</span>
            </div>
            <div
              class="card-status-extra status-lock"
              v-if="[AppStatusEnum.MANUAL_LOCKED].includes(item.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ $t('sys.developer.appCenter.notEnabled') }}</span>
            </div>
            <div
              class="card-status-extra status-error"
              v-if="[AppStatusEnum.INACTIVE].includes(item.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ $t('sys.app.status.INACTIVE') }}</span>
            </div>
          </span>
        </div>
        <i class="iconfont icon-xuanze"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { debounce } from 'lodash-es';
  import { getAppTenantApps } from '/@/apis/gct-platform/AppController';
  import { AppResponse } from '/@/apis/gct-platform/model';
  import { IconNext } from '/@/components/Icon';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { AppStatusEnum, LogoTypeEnum } from '/@/components/AppManageCmp/src/constant/interface';

  const props = defineProps<{
    value?: string;
    disabled?: Boolean;
  }>();

  const emit = defineEmits(['change']);

  const spinning = ref(false);
  const searchKey = ref<string>('');
  let appConnectors: AppResponse[] = [];
  const appConnectorsFiltered = ref<AppResponse[]>([]);

  const getAppConnectors = () => {
    spinning.value = true;
    getAppTenantApps({ pageNo: 1, pageSize: 99999, deleted: 0 })
      .then((res: any) => {
        appConnectors = (res.data ?? []).filter((e) => e.state === 'HEALTHY');
        appConnectorsFiltered.value = appConnectors;
      })
      .finally(() => {
        spinning.value = false;
      });
  };

  const appFilterFn = () => {
    const key = searchKey.value.trim();
    if (!key) {
      appConnectorsFiltered.value = appConnectors;
    } else {
      appConnectorsFiltered.value = appConnectors.filter((item) =>
        [item.name, item.id].some((s) => s!.includes(key)),
      );
    }
  };
  const appFilterDebounceFn = debounce(appFilterFn, 300);

  watch(searchKey, appFilterDebounceFn);

  onMounted(() => {
    getAppConnectors();
  });
</script>

<style lang="less" scoped>
  .connector-app {
    &__option {
      display: flex;
      position: relative;
      align-items: center;
      height: 52px;
      padding: 10px 8px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;

      &:not(:last-child) {
        margin-bottom: 12px;
      }

      .iconfont.icon-xuanze {
        display: none;
        position: absolute;
        top: 0;
        top: -5px;
        right: 0;
        right: -5px;
        background-color: #fff;
        color: var(--ant-primary-color);
        font-size: 12px;
        line-height: 1;
      }

      & > div:first-child {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-right: 12px;
        border-radius: 4px;
        background: var(--color);
        color: #fff;
        font-size: 20px;
        line-height: 1em;
      }

      & > div:nth-child(2) {
        position: relative;
        flex: 1;
        overflow: hidden;
        color: #797a7d;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &:hover {
        background: #fafafa;
      }

      &.selected {
        border-color: var(--ant-primary-color);
        background: #fafafa;

        & > div:nth-child(2) {
          color: var(--ant-primary-color);
        }

        .iconfont.icon-xuanze {
          display: block;
        }
      }
    }
  }

  .card-header {
    // display: flex;
    // align-items: flex-start;
    // justify-content: flex-start;
    // padding: 0 16px;

    &-img {
      display: flex;
      position: relative;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      // margin-right: 16px;
      overflow: hidden;
      border: 1px solid #e8e8e8;
      border-radius: 4px;

      > img {
        width: 100%;
        height: auto;
      }

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        background-color: var(--logo-background, #3370ff);
        color: #fff;
      }
    }
  }

  .card-status-extra {
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 15px;

    .status-flag {
      content: '';
      width: 6px;
      height: 6px;
      margin-right: 4px;
      border-radius: 50%;
      background-color: transparent;
    }

    .status-title {
      display: inline-block;
    }

    &.status-loading {
      padding: 0;
      color: var(--ant-primary-color);
    }

    &.status-error {
      color: #8f8f8f;

      .status-flag {
        background-color: #8f8f8f;
      }
    }

    &.status-ok {
      color: #309c41;

      .status-flag {
        background-color: #309c41;
      }
    }

    &.status-publishing {
      color: #3168ec;

      .status-flag {
        background-color: #3168ec;
      }
    }

    &.status-publishFail {
      color: #f54547;

      .status-flag {
        background-color: #f54547;
      }
    }

    &.status-lock {
      color: #384356;

      .status-flag {
        background-color: #384356;
      }
    }
  }
</style>
