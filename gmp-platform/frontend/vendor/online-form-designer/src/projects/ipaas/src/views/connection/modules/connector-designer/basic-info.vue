<template>
  <div :class="[ns.b()]" class="flex p-16px">
    <div class="pr-16px">
      <AppLogoPure
        :class="[ns.e('logo')]"
        :type="data.logoType"
        :icon-color="data.logoColor"
        :icon-bg-color="data.logoBgColor"
        :image="data.logo"
        :icon="data.logo"
        :size="56"
        :icon-size="40"
      />
    </div>
    <div class="flex-1">
      <div class="text-20px font-bold">
        {{ `${data.name} / ${data.brand} / ${data.version}` }}
      </div>
      <div class="color-[#7a7a7a]">
        {{ data.description }}
      </div>
      <a-row class="color-[#7a7a7a] mt-12px mb-20px">
        <a-col :span="6"> {{ t('sys.createName') }}：{{ data.createUserName }} </a-col>
        <a-col :span="6"> {{ t('sys.createTime') }}：{{ data.createTime }} </a-col>
        <a-col :span="6"> {{ t('sys.modifier') }}：{{ data.modifyUserName }} </a-col>
        <a-col :span="6"> {{ t('sys.modifyTime') }}：{{ data.modifyTime }} </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup name="basic-info">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { AppLogoPure } from '/@/components/AppLogo';
  import { FlowAppResponse } from '/@/apis/gct-ipaas2/model';

  const { t } = useI18n();
  const ns = useNamespace('basic-info');

  const props = withDefaults(
    defineProps<{
      disabled: boolean;
      data: FlowAppResponse;
    }>(),
    {
      disabled: false,
    },
  );

  // const data = {
  //   logoType: 'ICON',
  //   logoIconColor: '#FFF',
  //   logoIconBgColor: '#1890ff',
  //   logoImage: '',
  //   logoIcon: 'icon-park:clothes-gloves-two',
  //   appName: 'eDHR',
  //   brand: '苏州冠骋',
  //   version: 'v5.1.1',
  //   description:
  //     '作为一个变革性的技术，冠骋电子表单毫无疑问地将会带来新一轮技术变革的浪潮，不止是影响到软件系统的构建方式，同时代表着为信息工作者提供了新一代的智能和人性化的IT工作环境为客户带来助力。',
  //   createTime: '2025-03-11 16:08:32',
  //   createUserName: '管理员',
  //   modifyTime: '2025-03-11 16:08:32',
  //   modifyUserName: '管理员',
  // };
</script>

<style lang="scss" scoped>
  $basic-info: ();

  @include b(basic-info) {
    @include set-component-css-var(basic-info, $basic-info);

    @include e(logo) {
      padding: 12px;
    }

    background: #f7f8fa;
  }
</style>
