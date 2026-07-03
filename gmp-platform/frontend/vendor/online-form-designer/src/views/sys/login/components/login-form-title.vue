<template>
  <div class="flex pt-52px">
    <h2 class="text-28px enter-x">
      {{ getLoginTitle }}
    </h2>
    <!-- 沙箱黄精标识 -->
    <div v-if="isSandbox" class="sandbox-symbol mt9px ml8px">
      <span class="sandbox-text">
        {{ t('sys.menu.sandbox') }}
      </span>
    </div>
  </div>

  <div class="text-16px mb-28px">{{ getLoginSubTitle }}</div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from '../useLogin';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const { t } = useI18n();

  const { getLoginState } = useLoginState();
  const { getLoginTitle, getLoginSubTitle } = useRootSetting();
  const { isSandbox } = useEnv();

  const getFormTitle = computed(() => {
    const titleObj = {
      [LoginStateEnum.RESET_PASSWORD]: t('sys.forgetFormTitle'),
      [LoginStateEnum.LOGIN]: t('sys.signInFormTitle'),
      [LoginStateEnum.PASSWORD]: t('sys.signUpFormTitle'),
      [LoginStateEnum.MOBILE]: t('sys.mobileSignInFormTitle'),
      [LoginStateEnum.QR_CODE]: t('sys.qrSignInFormTitle'),
      [LoginStateEnum.CARD]: t('sys.cardSignInFormTitle'),
    };
    return titleObj[unref(getLoginState)];
  });
</script>
<style lang="less" scoped>
  .sandbox-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: 13px 13px 13px 0;
    background:
      linear-gradient(white, white) padding-box,
      linear-gradient(90deg, rgb(250 119 63 / 100%), rgb(255 172 56 / 100%)) border-box;
  }

  .sandbox-text {
    background: linear-gradient(360deg, #fa773f 0%, #ffac38 100%);
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }
</style>
