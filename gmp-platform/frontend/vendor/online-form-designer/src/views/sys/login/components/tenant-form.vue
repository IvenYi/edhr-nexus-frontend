<template>
  <div class="tenant-form">
    <div class="pl-40px pr-40px">
      <div class="tenant-form__title">{{ t('sys.selectTenant') }}</div>
      <div class="tenant-form__subtitle">{{ t('sys.enrolledTenants') }}</div>
    </div>
    <div class="tenant-form__tenants">
      <div class="tenant-form__list">
        <template v-for="item in tenantVisible" :key="item.id">
          <TenantItem
            class="tenant-form__item"
            :tenant-item="item"
            :current="prevTenantId"
            @click="handleRouterLink(item.id)"
          />
        </template>
      </div>
    </div>
    <div
      class="tenant-form__footer"
      v-show="!tenantAll && tenantLength > 0"
      @click="tenantAll = true"
    >
      <span
        >展示其他<b>{{ tenantLength }}</b
        >个组织</span
      >
      <down-outlined />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed,onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { DownOutlined } from '@ant-design/icons-vue';
  import TenantItem from './tenant-item.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { signLogRegister } from '/@/projects/backend-management/src/views/operation-log/login-log/components/loginLogHook';
  import { openWindow } from '/@/utils';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { createLocalStorage } from '/@/utils/cache';
  import { PREV_TENANT_KEY } from '/@/enums/cacheEnum';
  import { getLoginLogTenantLog } from "/@/apis/gct-platform/LoginLogController";
  
  const router = useRouter();
  const { userInfo, getTenant, setTenant } = useUserStore();
  const { t } = useI18n();
  const { isAloneModule } = useEnv();
  const ls = createLocalStorage();
  const prevTenantId = ls.get(PREV_TENANT_KEY) || null;

  const tenantLength = (userInfo?.tenantList ?? []).length - 5;
  const tenantVisible = computed(() => {
    return tenantAll.value
      ? (userInfo?.tenantList ?? [])
      : (userInfo?.tenantList ?? []).slice(0, 5);
  });
  const tenantAll = ref<boolean>(false);

  // 点击卡片实现路由跳转
  const handleRouterLink = (tenantId) => {
    if (isAloneModule) {
      sessionStorage.setItem('ALONE_MODULE_PATH', '/gct-bi');
      openWindow(`${location.origin}${import.meta.env.VITE_PATHNAME_BI}#/home`, {
        target: '_self',
      });
    } else {
      router.push('/home');
    }
    setTenant(tenantId, false);
    getLoginLogTenantLog({ tenantId: tenantId });
    signLogRegister('WORKTABLE', '', tenantId);
  };

    

  onMounted(async ()=>{
  
  })
</script>

<style lang="less" scoped>
  .tenant-form {
    --card-size: 64px;
    --card-gap: 12px;

    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-top: 40px;
    padding-bottom: 30px;
    background-color: #fff;

    &__title {
      color: #333;
      font-size: 28px;
      font-weight: bold;
    }

    &__subtitle {
      margin-top: 8px;
      color: #333;
      font-size: 14px;
    }

    &__tenants {
      flex: 1;
      width: 100%;
      height: 10px;
      margin-top: 24px;
      padding: 0 40px;
      overflow: auto;
    }

    &__item {
      --size: var(--card-size);

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px 0;
      color: #bfbfbf;
      cursor: pointer;

      b {
        color: #333;
      }
    }
  }
</style>
