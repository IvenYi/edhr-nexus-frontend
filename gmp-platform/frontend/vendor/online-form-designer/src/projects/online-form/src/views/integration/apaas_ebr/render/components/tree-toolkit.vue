<template>
  <div class="ebr-tree-toolkit" v-if="!treeVisible">
    <div class="ebr-tree-toolkit__content">
      <div class="toolkit-item" @click.stop="open('tree')">
        <img :src="TookitMl" />
        <span>{{ $t('sys.edhr.catalog') }}</span>
      </div>
      <template v-if="menus.includes('3')">
        <div class="toolkit-line"></div>
        <div class="toolkit-item" @click.stop="open('appendix')">
          <img :src="TookitFl" />
          <span>{{ $t('sys.edhr.appendix') }}</span>
        </div>
      </template>
      <template v-if="menus.includes('1')">
        <div class="toolkit-line"></div>
        <div class="toolkit-item" @click.stop="open('release')">
          <img :src="TookitFxd" />
          <span>{{ $t('sys.edhr.releaseTemplate') }}</span>
        </div>
      </template>

      <template v-if="menus.includes('4')">
        <div class="toolkit-line"></div>
        <div class="toolkit-item" @click.stop="open('txn')">
          <img :src="TookitSw" />
          <span>{{ $t('sys.edhr.materialStatus.TXN') }}</span>
        </div>
      </template>

      <template v-if="menus.includes('5')">
        <div class="toolkit-line"></div>
        <div class="toolkit-item" @click.stop="open('rework')">
          <img :src="TookitFg" />
          <span>{{ $t('sys.edhr.materialStatus.REWORK') }}</span>
        </div>
      </template>
      <template v-if="menus.includes('6')">
        <div class="toolkit-line"></div>
        <div class="toolkit-item" @click.stop="open('link')">
          <img :src="TookitGl" />
          <span>{{ $t('sys.edhr.materialStatus.LOT_SN_APPEND') }}</span>
        </div>
      </template>
    </div>

    <template v-if="menus.includes('7')">
      <div class="ebr-tree-toolkit__content mt-8px">
        <div class="toolkit-item" @click.stop="open('sop')">
          <img :src="TookitEsop" />
          <span>ESOP</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import TookitFxd from '/@/assets/svg/tookit-fangxingdan.svg';
  import TookitFl from '/@/assets/svg/tookit-fulu.svg';
  import TookitMl from '/@/assets/svg/tookit-mulu.svg';
  import TookitSw from '/@/assets/svg/tookit-shiwu.svg';
  import TookitFg from '/@/assets/svg/tookit-fangong.svg';
  import TookitGl from '/@/assets/svg/tookit-guanlian.svg';
  import TookitEsop from '/@/assets/svg/tookit-esop.svg';

  import { TreeToolKitType } from './types';

  const props = defineProps<{
    treeVisible: boolean;
    menus: string[];
  }>();

  const emit = defineEmits<{
    (e: 'open', what: TreeToolKitType): void;
  }>();

  function open(what: TreeToolKitType) {
    emit('open', what);
  }
</script>

<style scoped lang="less">
  .ebr-tree-toolkit {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 99;

    .ebr-tree-toolkit__content {
      padding: 4px;
      background: #ffffff;
      box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
      border-radius: 0 8px 8px 0;
    }

    .toolkit-item {
      display: flex;
      flex-direction: column;
      padding: 12px 8px;
      border-radius: 4px;
      text-align: center;
      align-items: center;
      cursor: pointer;
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
