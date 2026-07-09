<template>
  <div class="gct-personal-center h365px">
    <div class="bgc-wrap"></div>
    <div class="gct-personal-center-main ks-column px14px">
      <div class="ks-row mt18px mb22px text-[#fff]">
        <div
          v-if="displayContent.includes(PersonalCenterType.PROFILE)"
          class="w56px h56px border bg-[#fff] ml4px profile"
        ></div>
        <div class="mx12px ks-col">
          <div class="ks-row-middle">
            <span class="font-bold text-[18px]">姓名</span>
            <i
              v-if="displayContent.includes(PersonalCenterType.GENDER)"
              class="iconfont icon-a-nanxing_male2 ml4px"
            ></i>
          </div>
          <div class="ks-row" style="align-items: flex-start">
            <div v-if="displayContent.includes(PersonalCenterType.ENTERPRISE)" class="mr8px"
              >平台信息技术</div
            >
            <div class="px6px py2px post text-[12px]" style="min-width: 60px">职务名称</div>
          </div>
        </div>
        <div class="px8px py4px toggle">
          {{ $t('sys.app.version.toggle') }}
          <i class="iconfont icon-qiehuan ml4px"></i>
        </div>
      </div>
      <div class="ks-col content">
        <div class="content-item p10px">
          <div class="ks-row-middle py10px">
            <div class="ks-col text-[16px] text-[#212528]">{{ $t('sys.basicInfo') }}</div>
            <div>
              <i class="iconfont icon-a-Rightarrow text-[#D9D9D9] font-bold"></i>
            </div>
          </div>
          <div class="ks-row-middle py10px">
            <div class="ks-col text-[16px] text-[#212528]">{{ $t('sys.changePassword') }}</div>
            <div>
              <i class="iconfont icon-a-Rightarrow text-[#D9D9D9] font-bold"></i>
            </div>
          </div>
          <div class="ks-row-middle py10px">
            <div class="ks-col text-[16px] text-[#212528]">{{ '语言设置' }}</div>
            <div class="ks-row-middle">
              <span class="text-[#979797] text-[12px] mr8px">简体中文</span>
              <i class="iconfont icon-a-Rightarrow text-[#D9D9D9] font-bold"></i>
            </div>
          </div>
          <div class="ks-row-middle py10px">
            <div class="ks-col text-[16px] text-[#212528]">{{ $t('sys.timeZoneSelection') }}</div>
            <div class="ks-row-middle">
              <span class="text-[#979797] text-[12px] mr8px">UTC+08:00</span>
              <i class="iconfont icon-a-Rightarrow text-[#D9D9D9] font-bold"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="w100% py12px mt10px mb18px text-center font-bold text-[16px] logout-btn">
        {{ $t('sys.dropdownItemLoginOut') }}
      </div>
    </div>
  </div>
</template>
<script name="DesignPersonalCenterComponent" setup lang="ts">
  import { PersonalCenterType } from '@gct/runtime';
  import { computed, toRefs } from 'vue';
  import { nodeContainerProps } from '../../../props';

  const props = defineProps(nodeContainerProps);
  const { displayContent } = toRefs(props.data.data);

  const value = computed(() => {
    return displayContent;
  });
</script>
<style lang="less" scoped>
  .gct-personal-center {
    position: relative;
    overflow: auto;
    .bgc-wrap {
      height: 228px;
      width: 100%;
      background-color: var(--ant-primary-color);
      position: absolute;
      top: 0;
      left: 0;
    }
    &-main {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;

      .profile {
        border-radius: 50%;
        background: url('/assets/svg/profile.svg') no-repeat no-repeat;
      }
      .toggle {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        height: fit-content;
        display: flex;
        align-items: center;

        .icon-qiehuan {
          font-size: 12px;
        }
      }
      .post {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .content {
        background-color: #fff;
        border-radius: 8px;
        .icon-a-Rightarrow {
          font-size: 12px;
        }
      }

      .logout-btn {
        background-color: #fff;
        border-radius: 8px;
      }
    }
  }
</style>
