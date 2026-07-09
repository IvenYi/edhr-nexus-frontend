<template>
  <div class="list-comp">
    <div class="flex-none pt-16px pl-12px pr-12px pb-10px">
      <div class="flex justify-between">
        <div class="font-500 text-14px color-[#000]">{{ title || '--' }}</div>
        <a click.prevent=""> <plus-outlined class="text-12px mr-2px relative -top-1px" /> {{ $t('sys.insert') }} </a>
      </div>
      <a-input class="mt-16px" :placeholder="$t('sys.pleaseInputSth', { sth: $t('sys.ipaas.keyword') })">
        <template #prefix>
          <i class="iconfont icon-sousuo"></i>
        </template>
      </a-input>
    </div>

    <a-empty v-if="list.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" />

    <div v-else class="h-1px flex-1 overflow-auto p-12px important-pt-0px">
      <div
        class="list-comp__item"
        :class="{
          active: item.id === activeId,
        }"
        v-for="item in list"
        :key="item.id"
        @click="handleChange(item.id)"
      >
        <i class="iconfont icon-drag cursor-move"></i>
        <div class="ell w-1px flex-1 mr-10px">
          {{ item.id }}
        </div>
        <div class="w-80px flex-none">
          <div class="list-comp__item-code ell text-right">XAXA</div>
          <div class="list-comp__item-action flex items-center justify-end">
            <i class="iconfont icon-bianji color-primary"></i>
            <i class="iconfont icon-shanchu1 ml-10px color-error"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Empty } from 'ant-design-vue';
  import { useKnowledge } from '../hooks/useKnowledge';

  type ListCompModule = 'type' | 'app' | 'version' | 'brand';

  const props = defineProps<{
    title: string;
    list: any[];
    module: ListCompModule;
    activeId?: string;
  }>();

  // const emit = defineEmits(['change']);

  const { setCat } = useKnowledge();

  const handleChange = (id: string) => {
    if (id === props.activeId) return;
    switch (props.module) {
      case 'type':
        setCat(id);
        break;
    }

    // emit('change', id);
  };
</script>

<style lang="less" scoped>
  .color-primary {
    color: var(--ant-primary-color);
  }

  .color-error {
    color: var(--ant-error-color);
  }

  .list-comp {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f6f7fb;

    &__item {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: space-between;
      height: 44px;
      padding-right: 10px;
      padding-left: 20px;
      transition: all 0.3s;
      border: 1px solid #fff;
      border-radius: 4px;
      background-color: #fff;
      color: #212528;
      font-size: 14px;
      cursor: pointer;

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      .icon-drag {
        position: absolute;
        top: 50%;
        left: 2px;
        transform: translateY(calc(-50% + 0px));
        transition: all 0.3s;
        opacity: 0;
        color: var(--ant-primary-color);
        line-height: 1em;
      }

      &-action.flex {
        display: none;
      }

      &:hover {
        box-shadow: 0 4px 8px 0 #e0e3ea;
      }

      &.active {
        border-color: var(--ant-primary-color);

        &::after {
          content: '';
          display: block;
          position: absolute;
          top: 50%;
          right: -4px;
          width: 6px;
          height: 6px;
          transform: translateY(-50%) rotate(45deg);
          border-top: 1px solid var(--ant-primary-color);
          border-right: 1px solid var(--ant-primary-color);
          background-color: #fff;
        }
      }

      &:hover,
      &.active {
        .icon-drag {
          opacity: 1;
        }

        .list-comp__item-code {
          display: none;
        }

        .list-comp__item-action.flex {
          display: flex;
        }
      }
    }
  }
</style>
