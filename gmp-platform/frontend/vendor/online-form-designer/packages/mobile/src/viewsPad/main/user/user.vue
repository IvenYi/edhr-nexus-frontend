<template>
  <div class="pad-user w320px" :style="gradientStyle">
    <div
      class="pad-user-tenant ks-row-center-middle"
      v-if="!isTestEnv && !appStore.getInApp && !isSandbox"
      @click="selectCurrent"
    >
      <span class="gct-iconfont icon-qiehuanzuhu_yidongduan mr8px text-20px"></span>
      <span class="text-16px"> {{ $t('sys.mobile.switchTenants') }}</span>
    </div>
    <div v-if="isSandbox" class="sandbox text-[12px]">
      <img :src="sandboxIcon" alt="" class="mr4px" />
      {{ $t('sys.menu.sandbox') }}
    </div>
    <div class="text-center color-[#fff]">
      <div class="position-relative inline-block h100px" @click="isShowAvatar">
        <vImage
          fit="cover"
          :size="100"
          round
          class="bg-[#FFFFFF] border-4px border-[#FFFFFF] border-solid"
          :src="UserData.avatar"
          :key="UserData.avatar"
        />
        <div v-if="!isSandbox" class="position-absolute edit-icon ks-row-center-middle">
          <i class="gct-iconfont icon-bianjiziliao_yidongduan"></i>
        </div>
      </div>
      <div class="ks-row-center-middle px-4" @click="showConsole">
        <span class="text-24px mr8px truncate">{{ UserData.fullname }}</span>
        <span class="gct-iconfont icon-nanxing text-16px" v-if="UserData.gender === 1"></span>
        <span class="gct-iconfont icon-nvxing" v-else-if="UserData.gender === 0"></span>
        <i v-else class="iconfont icon-baomi lh-22px"></i>
      </div>
      <div class="text-16px mt12px">
        {{ CurrentTenant.name }}
      </div>
      <div class="user-tag" v-if="CurrentTenant.duty">{{ CurrentTenant.duty }}</div>
    </div>
    <avatarModal v-model:value="showAvatar" @on-confirm="handleComfirmAvatar" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { UserData, initUser, MasterTenant, CurrentTenant } from '@mobile/stores/loginHooks';
  import { useEnv } from '@mobile/utils/useEnv';
  import { createIosPopup } from '@mobile/InstanceComponent/select-picker';
  import { useAppStore } from '@mobile/stores/useAppStore';
  import VConsole from 'vconsole';
  import avatarModal from '@mobile/views/main/user/components/avatar-modal.vue';
  import { postUserSettings } from '@mobile/apis/gct-platform/UserController';
  import { useplatSetting } from '@mobile/utils/useplatSetting';
  import sandboxIcon from '/@/assets/svg/icon_sandbox_icon.svg';

  const { openIosPopup } = createIosPopup();
  const appStore = useAppStore();
  const { isTestEnv, isSandbox } = useEnv();
  const router = useRouter();
  const route = useRoute();
  const { themeSetting } = useplatSetting();

  const showAvatar = ref(false);
  var clickCount = 0;
  var timer = null;

  const gradientStyle = computed(() => {
    return {
      background: `linear-gradient(
        136deg,
        ${themeSetting.primaryColor},
        ${themeSetting.primaryColor}A3
      )`,
    };
  });

  const isShowAvatar = () => {
    if (isSandbox.value) return;
    showAvatar.value = true;
  };

  async function showConsole() {
    // 清除之前的计时器，以防多次点击时计数器未重置
    clearTimeout(timer);
    clickCount++;
    if (clickCount > 5) {
      new VConsole();
    }
    // 设置延迟，如果在这个时间内再次点击，则重置点击次数
    timer = setTimeout(function () {
      clickCount = 0;
    }, 1000); // 延迟1000毫秒（1秒）
  }

  /**
   * 切换租户
   */
  async function selectCurrent() {
    const currValue = await openIosPopup({
      value: [CurrentTenant.value.id],
      options: UserData.value.tenantList?.map((i) => {
        return { text: i.name, value: i.id, item: i };
      }),
      title: $t('sys.mobile.switchTenants'),
    });
    CurrentTenant.value = currValue.select[0]?.item;
    router.replace({
      name: route.name,
      params: route.params,
      query: { ...route.query, refreshKey: new Date().getTime() },
    });
  }

  const handleComfirmAvatar = async (url: string) => {
    await postUserSettings({ ...UserData.value, avatar: url });
    await initUser();
  };
</script>
<style scoped lang="less">
  .pad-user {
    position: relative;
    border-radius: 8px;

    &-tenant {
      position: absolute;
      top: 24px;
      left: 0;
      width: 124px;
      height: 44px;
      border-radius: 0 100px 100px 0;
      background-color: rgb(0 0 0 / 20%);
      color: #fff;
    }

    .edit-icon {
      right: 0;
      bottom: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: rgb(0 0 0 / 30%);
      font-size: 16px;
    }

    .user-tag {
      display: inline-block;
      margin-top: 12px;
      padding: 0 6px;
      border-radius: 4px;
      background-color: rgb(255 255 255 / 20%);
    }
  }

  .sandbox {
    display: flex;
    position: absolute;
    top: 16px;
    left: 16px;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 28px;
    border: 1px solid rgb(255 255 255 / 40%);
    border-radius: 20px;
    background: linear-gradient(90deg, #fa773f 0%, #ffac38 100%);
    color: #fff;
  }
</style>
