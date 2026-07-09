<template>
  <div class="login">
    <a-form
      :model="loginSetting"
      :label-col="{ span: 3 }"
      :wrapper-col="{ span: 21 }"
      autocomplete="off"
    >
      <div class="login-setting">
        <a-form-item>
          <a-radio-group v-model:value="loginSetting.theme">
            <div class="login-theme">
              <template v-for="item in theme" :key="item.value">
                <radio :data="item" />
              </template>
            </div>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.loginTitle')"
          name="title"
          :rules="[{ required: true }]"
        >
          <a-input
            v-model:value="loginSetting.title"
            show-count
            :maxlength="16"
            style="width: 30%"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.loginSubTitle')"
          name="subtitle"
          :rules="[{ required: true }]"
        >
          <a-input
            v-model:value="loginSetting.subtitle"
            show-count
            :maxlength="16"
            style="width: 30%"
          />
        </a-form-item>
        <a-form-item :label="t('sys.platform.logo')">
          <simple-upload v-model:file="loginSetting.logo" accept=".jpg,.png,.jpeg">
            <template #tip>
              <span>{{ t('sys.platform.logoTip') }}</span>
            </template>
          </simple-upload>
        </a-form-item>
        <a-form-item :label="t('sys.platform.loginBanner')">
          <simple-upload v-model:file="loginSetting.banner" accept=".jpg,.png,.jpeg" :size="1024">
            <template #tip>
              <span>{{ t('sys.platform.bannerTip') }}</span>
            </template>
          </simple-upload>
        </a-form-item>
      </div>
      <div class="login-mode-config">
        <div class="title">{{ t('sys.platform.loginModeConfig') }}</div>
        <div class="container">
          <div class="left">
            <div class="title">{{ t('sys.platform.systemLogin') }}</div>
            <a-checkbox-group v-model:value="loginModeAuthTypes">
              <draggable
                v-model="sysLoginSort"
                handle=".mover"
                :animation="200"
                ghostClass="ghost"
                itemKey="id"
              >
                <template #item="{ element }">
                  <div class="checkbox">
                    <a-checkbox
                      :value="element.value"
                      :disabled="
                        element.value === LoginTypeEnum.ACCOUNT ||
                        element.value === loginSetting.defaultAuthType
                      "
                    >
                      <div class="item">
                        <i
                          :class="['icon', 'mr-4px', element.value == LoginTypeEnum.CARD ? 'gct-iconfont' : 'iconfont', element.icon]"
                          :style="{ color: element.color }"
                        ></i>
                        {{ t(`sys.platform.${element.label}`) }}
                        <span
                          v-if="loginSetting.defaultAuthType === element.value"
                          class="default ml-4px"
                          >{{ t('sys.platform.defaultAbbr') }}</span
                        >
                      </div>
                    </a-checkbox>
                    <div class="btn" @click="handleConfig(element)">{{
                      t('sys.platform.clickToConfig')
                    }}</div>
                    <i class="iconfont icon-drag mover"></i>
                  </div>
                </template>
              </draggable>
            </a-checkbox-group>
          </div>
          <div class="right">
            <div class="title">{{ t('sys.platform.thirdLogin') }}</div>
            <a-checkbox-group v-model:value="openIDOAuthAuthTypes">
              <draggable
                v-model="openIDOAuthAuthSort"
                handle=".mover"
                :animation="200"
                ghostClass="ghost"
                itemKey="id"
              >
                <template #item="{ element }">
                  <div class="checkbox">
                    <a-checkbox
                      :value="element.value"
                      :disabled="element.value === loginSetting.defaultAuthType"
                    >
                      <div class="item">
                        <component :is="icons[element.icon]" :class="['icon-cmp', 'mr-4px']" />
                        {{ t(`sys.platform.${element.label}`) }}
                        <span
                          v-if="loginSetting.defaultAuthType === element.value"
                          class="default ml-4px"
                          >{{ t('sys.platform.defaultAbbr') }}</span
                        ></div
                      >
                    </a-checkbox>
                    <div
                      class="btn"
                      v-if="element.value !== 'ACCOUNT'"
                      @click="handleConfig(element)"
                    >
                      {{ t('sys.platform.clickToConfig') }}
                    </div>
                    <i class="iconfont icon-drag mover"></i>
                  </div>
                </template>
              </draggable>
            </a-checkbox-group>
          </div>
        </div>
      </div>
    </a-form>
  </div>
  <login-mode-modal @register="register" />
  <login-other-mode-modal @register="registerOther" />
  <login-phone-modal @register="registerPhone" />
</template>

<script setup lang="ts">
  import SimpleUpload from '/@/components/SimpleUpload/index.vue';
  import Radio from '../components/radio.vue';
  import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  import { onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import LoginModeModal from '../modal/login-mode-modal.vue';
  import LoginOtherModeModal from '../modal/login-other-mode-modal.vue';
  import LoginPhoneModal from '../modal/login-phone-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { LoginTypeEnum, OtherLoginKeys } from '/@/hooks/platform/constants';
  import draggable from 'vuedraggable';
  import DingdingIcon from '../components/Icon/dingding-icon.vue';
  import FeishuIcon from '../components/Icon/feishu-icon.vue';
  import QiyeweixinIcon from '../components/Icon/qiyeweixin-icon.vue';
  import MicrosoftIcon from '../components/Icon/microsoft-icon.vue';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const [registerOther, { openModal: openOtherModal }] = useModal();
  const [registerPhone, { openModal: openPhoneModal }] = useModal();
  const icons = {
    DingdingIcon,
    FeishuIcon,
    QiyeweixinIcon,
    MicrosoftIcon,
  };

  const {
    loginSetting,
    theme,
    loginModeAuthTypes,
    openIDOAuthAuthTypes,
    loginModeConfig,
    sysLoginSort,
    openIDOAuthAuthSort,
    loadLoginSetting,
  } = useLoginSetting();

  const handleConfig = (item) => {
    const loginConfigs = {
      ...item,
      ...loginModeConfig.get(item.value),
      defaultAuthType: loginSetting.defaultAuthType,
      isCurrent: loginSetting.defaultAuthType === item.value,
    };
    if (item.value === LoginTypeEnum.ACCOUNT || item.value === LoginTypeEnum.DOMAIN_ACCOUNT || item.value === LoginTypeEnum.CARD) {
      openModal(true, loginConfigs);
      return;
    }
    if (OtherLoginKeys.includes(item.value)) {
      console.log('loginConfigs', loginConfigs);
      openOtherModal(true, loginConfigs);
      return;
    }
    openPhoneModal(true, loginConfigs);
  };

  onMounted(() => {
    loadLoginSetting();
  });
</script>

<style lang="less" scoped>
  .login {
    height: 100%;
    overflow: auto;

    &-setting {
      border-bottom: 1px solid #eaeaea;
    }

    &-theme {
      display: flex;
      margin-top: 24px;
      margin-left: 28px;

      .full-screen,
      .classics {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }

    &-mode-config {
      font-size: 14px;

      .title {
        margin: 20px 0 14px 50px;
      }

      .container {
        display: flex;

        .left,
        .right {
          width: 280px;
          height: 360px;
          margin-bottom: 18px;
          margin-left: 50px;
          overflow: auto;
          border: 1px solid #eaeaea;
          border-radius: 4px;
          user-select: none;

          .title {
            margin-top: 12px;
            margin-bottom: 8px;
            margin-left: 16px;
          }

          .checkbox {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: space-between;
            width: 254px;
            margin: 12px;
            padding: 0 8px;
            border: 1px solid #eaeaea;
            border-radius: 4px;
            background-color: #f7f7f7;

            :deep(.ant-checkbox-disabled) {
              + span {
                color: #333;
                cursor: default;
              }
            }

            &:hover {
              background-color: #efefef;
            }

            &.ghost {
              opacity: 0.5;
              background: #f5f5f5;
            }

            .default {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              background: var(--ant-primary-color);
              color: #fff;
              font-size: 12px;
              line-height: 18px;
            }

            .icon-cmp {
              // font-size: 16px;

              :deep(svg) {
                width: 19px;
                height: 20px;
                font-size: 16px;
                vertical-align: text-bottom;
              }
            }

            .item {
              display: flex;
              align-items: center;
              height: 40px;
            }

            .btn {
              padding-right: 24px;
              color: var(--ant-primary-color);
              cursor: pointer;
            }

            .mover {
              position: absolute;
              top: 50%;
              right: 12px;
              transform: translateY(-50%);
              color: #96a0b5;
              font-size: 12px;
              cursor: pointer;

              &:hover {
                color: rgb(0 0 0 / 50%);
              }
            }
          }
        }
      }
    }
  }
</style>
