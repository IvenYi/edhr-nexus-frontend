<template>
  <basic-page-render>
    <div class="document-control-config ks-row h100% p16px">
      <div class="aside w230px py16px">
        <div class="tabs">
          <div
            v-for="item in Object.keys(controlMangementEnum)"
            :key="item"
            class="tabs-item relative"
            :class="[activeTab === controlMangementEnum[item] && 'active']"
            @click="activeTab = controlMangementEnum[item]"
          >
            <div>{{ $t(`sys.edhr.controlMangementEnum.${item}`) }}</div>
            <span
              v-if="total && item === controlMangementEnum.controls"
              class="total bg-[#F5222D] rounded-10px text-[12px] lh-none px4px py2px text-[#ffffff] absolute right-24px top-13px"
            >
              {{ total }}
            </span>
          </div>
        </div>
      </div>
      <div class="ks-col content pl16px ks-column h-full overflow-hidden">
        <!-- <keep-alive>
        </keep-alive> -->
        <component
          ref="componentRef"
          :is="componentsMap[activeTab]"
          :key="componentsMap[activeTab]"
          v-model:total="total"
          @refresh="getTotal()"
        />
      </div>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import MyInitiation from './components/my-initiation.vue';
  import MyControls from './components/my-controls.vue';
  import ControlHistory from './components/control-history.vue';
  import { controlMangementEnum } from './enums';
  import { getDocControlTaskTodoCount } from '/@/apis/gct-apaas/DocControlTaskTodoController';

  const componentsMap = {
    [controlMangementEnum.initiation]: MyInitiation,
    [controlMangementEnum.controls]: MyControls,
    [controlMangementEnum.history]: ControlHistory,
  };

  const activeTab = ref<string>(controlMangementEnum.initiation);
  const componentRef = ref();

  const total = ref(0);

  onMounted(() => {
    getTotal();
  });

  const getTotal = async () => {
    console.log('refresh-total');
    total.value = (await getDocControlTaskTodoCount()) ?? 0;
  };
</script>
<style lang="less" scoped>
  .aside {
    border-right: 1px solid #eaedf1;

    .tabs {
      &-item {
        color: #666666;
        padding: 10px 0 10px 40px;
        cursor: pointer;

        &.active {
          color: var(--ant-primary-color);
          background-color: hsl(from var(--ant-primary-color) h s 93%);
        }

        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
