<template>
  <div class="edhr flex h-100vh w-100vw overflow-hidden">
    <div class="edhr-menu w-80px flex flex-col items-center text-10px py-24px px-16px">
      <div class="avatar-img">
        <img class="h-full w-full object-contain" :src="avatar" />
      </div>
      <div class="w-48px h-1px op-24 mt-16px mb-12px"></div>

      <div class="flex flex-col items-center flex-1 justify-center gap-68px">
        <div
          class="edhr-menu__item h-70px w-70px rounded-8px flex flex-col items-center justify-center overflow-hidden"
          :class="{
            'edhr-menu__item--active': item.name === menuKey,
            // 'mt-[auto]': item.name === MESSAGE_NAME,
          }"
          v-for="item in userMenus"
          :key="item.name"
          @click="handleClick(item)"
        >
          <van-badge
            :show-zero="false"
            class="edhr-menu__item-icon h-24px w-24px flex! items-center justify-center"
            :content="item.count"
            max="99"
          >
            <gct-icon
              :value="item.icon"
              :size="20"
              :color="item.name === menuKey ? '#FFFFFF' : '#5a5f6b'"
            />
          </van-badge>
          <span class="lh-none ws-nowrap mt-8px">{{ item.text }}</span>
        </div>
      </div>

      <div class="w-48px h-1px op-24 mt-16px mb-16px"></div>
      <div class="text-center color-[#8B8B8B]">
        <div> 版本 </div>
        <div> v{{ AppVersion }} </div>
      </div>
    </div>
    <div class="flex flex-col flex-1 edhr-content">
      <div class="flex-1 overflow-hidden">
        <router-view v-slot="{ Component }">
          <keep-alive :include="CACHE_PAGES">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { getInternalMessageUnreadCount } from '/@/apis/gct-platform/InternalMessageController';
  import { ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { UserData } from '@mobile/stores/loginHooks';
  import GctIcon from '@mobile/components/icon/index.vue';
  import { AppVersion, MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { useMenus } from '@mobile/views/edhr/_hooks_/useMenus';
  import AvatarDefault from '@mobile/assets/svg/edhr/avatar_normal.svg';

  interface MenuItem {
    name: string;
    text: string;
    action?: string;
    icon: string;
  }

  const { loadMenus } = useMenus();
  const EHDR_NAME = 'edhr';
  const MESSAGE_NAME = 'message';
  const BASIC_LOASING_NAME = 'basic-loading';
  // const CACHE_PAGES: string[] = ['edhr-produce', 'edhr-rework', 'edhr-filling', 'edhr-audit'];
  const CACHE_PAGES: string[] = [];
  const messageCount = ref(0);
  const avatar = computed(() => {
    if (UserData.value?.avatar) {
      return `${MOBILE_MINIO_PATH.value}${UserData.value.avatar}`;
    } else {
      return AvatarDefault;
    }
  });

  const menuKey = ref<string>('');
  const router = useRouter();
  const { remoteMenus } = useMenus();
  const route = useRoute();
  const basicMenus: MenuItem[] = [
    { name: MESSAGE_NAME, text: '消息', action: 'push', icon: 'icon-menu_xiaoxi_pad' },
    { name: 'user', text: '设置', action: 'push', icon: 'icon-meun_shezhi_pad' },
  ];

  const userMenus = computed(() => {
    const rMenus = remoteMenus.value.map((m) => {
      return {
        name: m.linkPage,
        text: m.name,
        icon: m.logo,
      };
    });

    return [
      ...rMenus,
      ...basicMenus.map((i) => {
        return {
          ...i,
          count: i.name === MESSAGE_NAME ? messageCount.value : undefined,
        };
      }),
    ];
  });

  watch(
    () => route.name,
    (value) => {
      menuKey.value = route.meta?.activeName ?? value;
    },
    {
      immediate: true,
    },
  );

  async function getMessageCount() {
    const res = await getInternalMessageUnreadCount();
    messageCount.value = res ? Number(res) : 0;
  }
  onMounted(async () => {
    await getMessageCount();
    await loadMenus();
    if (route.name === EHDR_NAME) {
      if (remoteMenus.value.length > 0) {
        router.replace({
          name: remoteMenus.value[0].linkPage,
        });
      } else {
        router.replace({
          name: BASIC_LOASING_NAME,
        });
      }
    }
  });

  const handleClick = (item: MenuItem) => {
    if (item.action === 'push') {
      router.push({
        name: item.name,
      });
    } else {
      router.replace({
        name: item.name,
      });
    }
  };
</script>
<style lang="less" scoped>
  .edhr {
    // 头像
    .avatar-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      overflow: hidden;
    }

    // 数值角标
    :deep(.van-badge) {
      border-radius: 20px 20px 20px 20px;
      border: 1px solid #ffffff;
      font-size: 10px;
      line-height: 15px;
      font-weight: 500;
      padding: 0 4px;
    }
  }
</style>
<style lang="less">
  .edhr {
    background: #f0f5fa;

    &-menu {
      &__item {
        color: #5a5f6b;

        .edhr-menu__item-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #5a5f6b;
          background: #dcdfe4;
        }

        &--active {
          color: #026ac8;

          .edhr-menu__item-icon {
            background: #026ac8;
            color: #fff;
          }
        }
      }
    }
  }
</style>
