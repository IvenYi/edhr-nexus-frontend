<template>
  <div class="relative">
    <div @click="handleEntryClick">
      <div
        class="flex justify-center items-center relative mx-auto m-2 w-14 h-14 rounded-2xl overflow-hidden"
        :style="{ background: entry.bgColor }"
      >
        <vImage
          :size="entry.logoType === LogoTypeEnum.Icon ? 28 : 56"
          :src="entry.logo"
          :logoType="entry.logoType"
          :color="entry.color"
        />
        <div v-if="entry.authState === 3" class="absolute z-10 right-0 bottom-0 left-0 text-center">
          <span class="text-[var(--van-primary-color)] text-[10px] font-500">授权到期</span>
          <img class="absolute inset-0 -z-10" :src="expiredIcon" />
        </div>
      </div>
      <div class="text-sm truncate text-center text-black font-400">{{ entry.name }}</div>
    </div>

    <span
      class="absolute iconfont icon-tianjia1 text-lg primary-color"
      v-if="operationType === 'add'"
      @click="handleAddClick"
    ></span>

    <span
      class="absolute iconfont icon-yichu text-lg danger-color"
      v-if="operationType === 'remove'"
      @click="handleRemoveClick"
    ></span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { IApp, IAppMenu } from '@mobile/type';
  import { SqlitePage } from '@mobile/utils/sqlite_page';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { LogoTypeEnum } from '@mobile/type';
  import { useplatSetting } from '@mobile/utils/useplatSetting';
  import svgExpiredBlue from '@mobile/assets/svg-icons/icon-app-expired-blue.svg';
  import svgExpiredGreen from '@mobile/assets/svg-icons/icon-app-expired-green.svg';
  import { checkLicense } from '@mobile/utils/licenseHelper';

  const emit = defineEmits(['add', 'remove']);

  const { mitt } = useMitt();
  const { themeSetting } = useplatSetting();

  const props = defineProps<{
    // 可能是应用，也可能是应用下面的具体菜单
    entry: IApp | IAppMenu;
    // 点击跳转类型：列表访问
    targetType?: 'app' | 'menu' | 'test-app';
    // 角标按钮类型：列表管理
    operationType?: 'add' | 'remove';
  }>();

  const expiredIcon = computed(() => {
    return themeSetting.primaryColor === '#026AC8' ? svgExpiredBlue : svgExpiredGreen;
  });

  const handleAddClick = () => emit('add');
  const handleRemoveClick = () => emit('remove');

  const handleEntryClick = async () => {
    const { entry, targetType } = props;

    if (!targetType) return;
    // 应用
    if (targetType === 'app') {
      const { id: appId, name: appName } = entry as IApp;
      await SqlitePage.updateAppDB(appId);
      mitt.emit('open-app', { appId, appName });
    } else if (targetType === 'test-app') {
      const { id: appId, name: appName } = entry as IApp;
      await checkLicense(appId, { env: 'dev' });
      mitt.emit('open-app', { appId, appName });
    } else if (targetType === 'menu') {
      const { appId, menuId, name: menuName, linkPage: linkPageKey } = entry as IAppMenu;
      await SqlitePage.updateAppDB(appId);
      mitt.emit('open-app-menu', { appId, menuId, menuName, linkPageKey });
    }
  };
</script>
