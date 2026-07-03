<template>
  <div class="flex bg-[#fff] h-full">
    <div class="menu-sider">
      <div
        v-for="item in menus"
        :key="item.name"
        class="menu-sider__item"
        :class="{
          'menu-sider__item--active': currentPath === item.path,
        }"
        @click="handleMenuClick(item)"
      >
        {{ t(item.meta.title) }}
        <span class="todo-num" v-if="item.path == 'todo' && todoNum !== 0">{{
          `(${todoNum})`
        }}</span>
      </div>
    </div>
    <div class="menu-sider__content">
      <div v-if="!hideContentTitle" class="menu-sider__content-header">
        {{ contentTitle }}
        <div id="platform-detail__actions"></div>
      </div>
      <div class="h-10px flex-1 pt-24px pb-16px pl-24px pr24px">
        <slot v-if="comp"></slot>
        <RouterView v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, onBeforeUnmount } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRouter } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { getPmTaskTodoPageList } from '/@/apis/gct-platform/PmTaskTodoController';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const props = defineProps<{
    menus: Array<{
      path: string;
      name: string;
      meta: {
        title: string;
      };
    }>;
    hideContentTitle?: Boolean;
    comp?: Boolean;
    activeMenu?: string;
  }>();

  const { mitt } = useMitt();
  const { t } = useI18n();
  const go = useGo();
  const { currentRoute } = useRouter();
  const todoNum = ref<any>(0);

  onMounted(() => {
    // getTodoNum();
    mitt.on('process-center-todo', (count: any) => {
      todoNum.value = count > 99 ? '99+' : count;
    });
  });

  onBeforeUnmount(() => {
    mitt.off('process-center-todo');
  });

  const selectedKeys = computed(() => {
    const name = currentRoute.value.name;
    return props.menus.filter((item) => item.name === name).map((item) => item.path);
  });

  const currentPath = computed(() => {
    return props.comp ? props.activeMenu : selectedKeys.value[0];
  });

  const compTitle = computed(() => {
    const title = props.menus?.find((item) => item.path === props.activeMenu)?.meta.title;
    return title ? t(title) : '';
  });

  const routeTitle = computed(() => {
    const name = currentRoute.value.name;
    const title = props.menus?.find((item) => item.name === name)?.meta.title;
    return title ? t(title) : '';
  });

  const contentTitle = computed(() => {
    return props.comp ? compTitle.value : routeTitle.value;
  });

  // const getTodoNum = async () => {
  //   const res = await getPmTaskTodoPageList({
  //     pageNo: 1,
  //     pageSize: 10,
  //   });
  //   todoNum.value = res!.totalCount;
  // };

  const handleMenuClick = (item) => {
    go(item.path, true);
  };
</script>

<style lang="less" scoped>
  .menu-sider {
    height: 100%;
    border-right: 1px solid #e0e3ea;
    padding-top: 24px;
    width: 168px;
    flex: none;
    padding-left: 24px;
    &__item {
      height: 30px;
      line-height: 30px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 12px;
      border-right: 2px solid transparent;
      // border-radius: 4px;
      text-align: center;
      position: relative;

      // .todo-num {
      //   position: absolute;
      //   top: 0;
      //   right: 8px;
      // }

      &:hover {
        background-color: #f7f8fa;
      }

      &--active {
        color: var(--ant-primary-color);
        background-color: #f7f8fa;
        border-right: 2px solid var(--ant-primary-color);
      }
    }
    &__content {
      // padding-right: 24px;
      width: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;

      &-header {
        height: 70px;
        padding-left: 24px;
        display: flex;
        align-items: center;
        font-weight: 500;
        color: #384356;
        color: #384356;
        border-bottom: 1px solid #e0e3ea;
      }
    }
  }
</style>
