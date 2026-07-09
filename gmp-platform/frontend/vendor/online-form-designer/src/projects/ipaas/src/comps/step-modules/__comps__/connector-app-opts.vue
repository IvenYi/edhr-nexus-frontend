<template>
  <!-- <SimpleCollapse title="应用选择">
  </SimpleCollapse> -->
  <div class="ks-column h100%">
    <div class="px12px">
      <a-input v-model:value="searchKey" :placeholder="$t('sys.ipaas.inputAppKeyword2Query')">
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
        <div class="logo-wrap">
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
            <img :src="transformUrl(item.logo)" alt="" />
          </template>
        </div>
        <div class="lh-[18px]">
          <div class="w-55% ell">{{ item.appName }}</div>
          <div class="color-[#C3C3C3] ell">{{ item.brand }}</div>
          <span class="absolute top-0px right-0px color-[#C3C3C3] w-40% ell text-right">{{
            item.version
          }}</span>
        </div>
        <i class="iconfont icon-xuanze"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import type { AppConnectorResp } from '/@/apis/gct-ipaas2/model';
  import { getConnectorConfigList } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import createColor from 'create-color';
  import { debounce } from 'lodash-es';
  // import SimpleCollapse from './simple-collapse.vue';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { LogoTypeEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import { useFlow } from '../../../hooks/useFlow';

  // type AppConnectorItem = AppConnectorResp & { _color_: string; _icon_: string };

  const props = defineProps<{
    value?: string;
    disabled?: Boolean;
  }>();

  const emit = defineEmits(['change']);

  const { appInfo } = useFlow();
  // const { t } = useI18n();
  const searchKey = ref<string>('');
  let appConnectors: AppConnectorResp[] = [];
  const appConnectorsFiltered = ref<AppConnectorResp[]>([]);
  const spinning = ref(false);

  const getAppConnectors = () => {
    spinning.value = true;
    getConnectorConfigList(
      appInfo.value.appTag
        ? {
            transferToConfig: {
              headers: {
                'App-Tag': appInfo.value.appTag,
                'Branch-Id': appInfo.value.branchId,
                env: appInfo.value.env,
              },
            },
          }
        : undefined,
    )
      .then((res) => {
        appConnectors = (res ?? []).map((item) => {
          return {
            ...item,
            _color_: createColor(item.appName),
            _icon_: item.appName!.substring(0, 1),
          };
        });
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
        [item.appName, item.brand, item.version].some((s) => s!.includes(key)),
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

  .logo-wrap {
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
</style>
