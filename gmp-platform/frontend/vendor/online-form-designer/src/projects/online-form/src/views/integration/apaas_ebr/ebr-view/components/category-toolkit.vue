<template>
  <div class="ebr-category-tookit">
    <div class="ebr-category-tookit__content">
      <div v-for="(item, idx) in toolKitOptions" :key="idx">
        <div class="toolkit-line" v-if="idx === toolKitOptions.length - 1"></div>
        <div
          class="toolkit-item"
          :class="activeKey === item.type ? 'active' : ''"
          @click.stop="select(item.type)"
        >
          <img :src="item.icon" />
          <span>{{ $t(`sys.edhr.ebr.category.${item.type}`) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import catalogueIcon from '/@/assets/svg/tookit-mulu.svg';
  import productionIcon from '/@/assets/svg/tookit-fulu.svg';
  import releaseIcon from '/@/assets/svg/tookit-fangxingdan.svg';
  import inspectionIcon from '/@/assets/svg/tookit-fangong.svg';
  import linkIcon from '/@/assets/svg/tookit-guanlian.svg';
  import esopIcon from '/@/assets/svg/tookit-esop.svg';

  import { EModuleEnum } from '../enums';

  const props = defineProps<{
    activeKey: EModuleEnum;
    menus: EModuleEnum[];
  }>();

  const toolIconKitMap = {
    [EModuleEnum.CATALOG]: catalogueIcon,
    [EModuleEnum.PRODUCTION]: productionIcon,
    [EModuleEnum.RELEASE]: releaseIcon,
    [EModuleEnum.INSPECTION]: inspectionIcon,
    [EModuleEnum.LINK]: linkIcon,
    [EModuleEnum.ESOP]: esopIcon,
  };

  const toolKitOptions = computed(() => {
    return props.menus.map((menu) => ({
      type: menu,
      icon: toolIconKitMap[menu],
    }));
  });

  const emit = defineEmits<{
    (e: 'select', what: EModuleEnum): void;
  }>();

  function select(what: EModuleEnum) {
    emit('select', what);
  }
</script>

<style scoped lang="less">
  .ebr-category-tookit {
    background-color: #ffffff;
    border: 1px solid #e0e3eb;

    .ebr-category-tookit__content {
      padding: 4px;
    }

    .toolkit-item {
      display: flex;
      flex-direction: column;
      padding: 12px 8px;
      border-radius: 4px;
      text-align: center;
      align-items: center;
      cursor: pointer;

      &.active {
        background: #e0e3eb;
        color: #0f0f0f;
        font-weight: bold;
      }

      > img {
        width: 38px;
        height: 26px;
      }
      > span {
        margin-top: 4px;
        text-align: center;
        line-height: 16px;
        font-size: 12px;
        color: #5a5f6b;
      }

      &:hover {
        background: #f2f5f8;
      }
    }
    .toolkit-line {
      width: 100%;
      height: 1px;
      margin: 4px 0;
      background: #e8ebf0;
      font-size: 0;
    }
  }
</style>
