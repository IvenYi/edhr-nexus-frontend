<template>
  <div class="px-12px py-12px">
        <!-- 平台无导航栏设置 -->
    <template v-if="ProjectName.APP_DESIGNER === getCurrentProject">
      <div class="title">{{ t('sys.platform.navSetting') }}</div>
      <a-radio-group v-model:value="themeSetting.menuMode">
        <label
          class="inline-flex flex-col items-center cursor-pointer"
          :class="{ 'is-selected-mode': themeSetting.menuMode === 'mix-sider' }"
        >
          <img src="../../components/Icon/menu-mix-sider.svg" />
          <a-radio class="important-mr-0px important-mt-6px" value="mix-sider"
            >侧边混合菜单</a-radio
          >
        </label>
        <label
          class="inline-flex flex-col items-center cursor-pointer ml-24px"
          :class="{ 'is-selected-mode': themeSetting.menuMode === 'horizontal-mix-sider' }"
        >
          <img src="../../components/Icon/menu-mix-sider-new.svg" />
          <a-radio class="important-mr-0px important-mt-6px" value="horizontal-mix-sider"
            >水平侧边菜单</a-radio
          >
        </label>
        <label
          class="inline-flex flex-col items-center cursor-pointer ml-24px"
          :class="{ 'is-selected-mode': themeSetting.menuMode === 'classic' }"
        >
          <img src="../../components/Icon/menu.svg" />
          <a-radio class="important-mr-0px important-mt-6px" value="classic">侧边菜单</a-radio>
        </label>
      </a-radio-group>

      <div class="h-1px bg-[#E0E3EA] mt-24px mb-24px"></div>
    </template>

    <div class="title">{{ t('sys.platform.colorSetting') }}</div>
    <a-radio-group v-model:value="themeSetting.colorMode">
      <a-radio value="normal">{{ t('sys.platform.colorNormal') }}</a-radio>
      <a-radio value="colorWeak">{{ t('sys.platform.colorWeak') }}</a-radio>
      <a-radio value="gray">{{ t('sys.platform.colorGray') }}</a-radio>
    </a-radio-group>

    <!-- {{ themeSetting.themeColor }} -->
    <div class="h-48px bg-[#F7F8FA] rd-4px flex items-center pl-20px mt-12px">
      <div>{{ t('sys.platform.themeColor') }}</div>
      <div
        class="theme-color-item"
        :class="{
          'theme-color-item--selected': themeSetting.themeColor === c,
        }"
        v-for="c in themeColors"
        :key="c"
        :style="{
          '--color': c,
        }"
        @click="themeSetting.themeColor = c"
      >
        <check-outlined />
      </div>
    </div>

    <div class="h-1px bg-[#E0E3EA] mt-24px mb-24px"></div>

    <div class="title">{{ t('sys.platform.menuSetting') }}</div>
    <div class="flex items-center">
      <div>菜单展开宽度</div>
      <div class="w-120px ml-16px">
        <a-input-number
          :step="1"
          :precision="0"
          v-model:value="themeSetting.menuWidth"
          addonAfter="px"
          :min="menuWidthRange[0]"
          :max="menuWidthRange[1]"
        />
      </div>
      <div class="ml-40px checkbox-group">
        <a-checkbox v-model:checked="themeSetting.menuCollapsible">{{
          t('sys.platform.menuFold')
        }}</a-checkbox>
        <!-- <a-checkbox v-model:checked="themeSetting.menuFilter">{{
          t('sys.platform.menuSearch')
        }}</a-checkbox> -->
      </div>
      <div class="ml-24px mr-8px">
        <a-switch v-model:checked="themeSetting.menuSearchable" size="small" />
      </div>
      <div> {{ t('sys.platform.menuSearch') }} </div>
    </div>

    <div class="h-1px bg-[#E0E3EA] mt-24px mb-24px"></div>

    <div class="title">{{ t('sys.platform.contentAreaSetting') }}</div>
    <div class="checkbox-group">
      <a-checkbox v-model:checked="themeSetting.showLogo">logo</a-checkbox>
      <a-checkbox v-model:checked="themeSetting.showBreadcrumb">{{
        t('sys.platform.contentBreadCrumb')
      }}</a-checkbox>
      <a-checkbox
        v-model:checked="themeSetting.showBreadcrumbIcon"
        :disabled="!themeSetting.showBreadcrumb"
        >{{ t('sys.platform.contentBreadCrumbIcon') }}</a-checkbox
      >
      <a-checkbox v-model:checked="themeSetting.showTabs">{{
        t('sys.platform.contentTabs')
      }}</a-checkbox>
    </div>

    <div class="h-1px bg-[#E0E3EA] mt-24px mb-24px"></div>

    <div class="title">{{ t('sys.platform.animationSetting') }}</div>
    <div class="checkbox-group">
      <a-checkbox v-model:checked="themeSetting.pageProgress">{{
        t('sys.platform.animationProgress')
      }}</a-checkbox>
      <a-checkbox v-model:checked="themeSetting.pageLoading">{{
        t('sys.platform.animationLoading')
      }}</a-checkbox>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';

  const { t } = useI18n();
  const { themeSetting, themeColors, menuWidthRange } = useThemeSetting();
  const { getCurrentProject } = usePermissionStoreWithOut();

  watch(
    () => themeSetting.showBreadcrumb,
    (value) => {
      if (!value) {
        themeSetting.showBreadcrumbIcon = false;
      }
    },
  );

  // watch(
  //   () => themeSetting.mode,
  //   () => {
  //     if (themeSetting.mode === 'colorWeak') {
  //       baseHandler(HandlerEnum.COLOR_WEAK, true);
  //     } else if (themeSetting.mode === 'gray') {
  //       baseHandler(HandlerEnum.GRAY_MODE, true);
  //     } else {
  //       baseHandler(HandlerEnum.COLOR_WEAK, false);
  //       baseHandler(HandlerEnum.GRAY_MODE, false);
  //     }
  //   },
  // );
</script>

<style lang="less" scoped>
  .title {
    font-size: 16px;
    line-height: 24px;
    color: #212528;
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    &::before {
      content: '';
      height: 14px;
      width: 2px;
      background-color: var(--ant-primary-color);
      margin-right: 12px;
    }
  }

  .is-selected-mode {
    img {
      border: 1px solid var(--ant-primary-color);
      border-radius: 6px;
    }
  }

  .theme-color-item {
    height: 24px;
    width: 24px;
    border-radius: 4px;
    border: 1px solid var(--color);
    background-color: var(--color);
    margin-left: 16px;
    cursor: pointer;
    transition: all 0.3s;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    .anticon {
      opacity: 0;
    }

    &--selected,
    &:hover {
      box-shadow: 0 0 0 2px rgba(from var(--color) r g b / 40%);
    }

    &--selected {
      border: 1px solid #fff;
      .anticon {
        opacity: 1;
      }
    }
  }
</style>
