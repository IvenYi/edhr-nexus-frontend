<template>
  <div class="ks-col px12px pt6px mt6px overflow-y-auto">
    <div
      v-for="item in platformList"
      :key="item.id"
      class="connector-platform__option"
      :class="{
        selected: item.id === value,
        'important-cursor-not-allowed': disabled,
      }"
      @click="() => emit('change', item)"
    >
      <div class="logo-wrap">
        <div
          class="logo-icon"
          :style="{
            '--logo-background': item.logoBgColor,
          }"
        >
          <IconNext :value="item.logo" :size="20" color="#ffffff" />
        </div>
      </div>
      <div class="lh-[18px]">
        <div class="w-55% ell">{{ $t(`sys.ipaas.asyncPlatformTypes.${item.id}`) }}</div>
        <div class="color-[#C3C3C3] ell">{{ item.desc }}</div>
      </div>
      <i class="iconfont icon-xuanze"></i>
    </div>
  </div>
</template>
<script setup lang="ts">
  const props = defineProps<{
    value?: string;
    disabled?: Boolean;
  }>();

  const emit = defineEmits(['change']);
  const platformList = [
    {
      id: 'SYNC_USER',
      desc: $t('sys.ipaas.batchHandleUserTip'),
      logoBgColor: '#3370ff',
      logo: 'icon-renyuan2',
    },
    // {
    //   id: 'SYNC_ORG',
    //   desc: '根据映射标识，批量新增和更新组织',
    //   logoBgColor: '#309C41',
    //   logo: 'icon-zuzhiquanxian2',
    // },
  ];
</script>
<style lang="less" scoped>
  .connector-platform {
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
