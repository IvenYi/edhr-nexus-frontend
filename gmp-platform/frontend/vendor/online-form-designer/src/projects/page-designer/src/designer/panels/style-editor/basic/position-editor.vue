<template>
  <div>
    <a-select
      v-model:value="selectedStyle.position"
      :options="positionOptions"
      allowClear
      size="small"
      @clear="clearPosition"
    />
    <!--absolute的快捷位置-->
    <div class="ab-btn-box" v-if="selectedStyle.position === 'absolute'" style="margin-top: 10px">
      <a-button size="middle" @click="handleClickAbsolutePos('upLeft')">
        <template #icon>
          <a-tooltip :title="t('sys.pageDesigner.upLeft')">
            <upleft-icon />
          </a-tooltip>
        </template>
      </a-button>
      <a-button size="middle" @click="handleClickAbsolutePos('upRight')">
        <template #icon>
          <a-tooltip :title="t('sys.pageDesigner.upRight')">
            <upright-icon />
          </a-tooltip>
        </template>
      </a-button>
      <a-button size="middle" @click="handleClickAbsolutePos('downLeft')">
        <template #icon>
          <a-tooltip :title="t('sys.pageDesigner.downLeft')">
            <downleft-icon />
          </a-tooltip>
        </template>
      </a-button>
      <a-button size="middle" @click="handleClickAbsolutePos('downRight')">
        <template #icon>
          <a-tooltip :title="t('sys.pageDesigner.downRight')">
            <downright-icon />
          </a-tooltip>
        </template>
      </a-button>
    </div>
    <!--position盒子-->
    <div
      class="position-box"
      v-if="!['', 'static', null, undefined].includes(selectedStyle.position)"
    >
      <div class="top-div">
        <span class="next-input next-medium next-noborder">
          <input placeholder="auto" maxlength="4" autocomplete="off" v-model="selectedStyle.top" />
        </span>
      </div>
      <div class="right-div">
        <span class="next-input next-medium next-noborder">
          <input
            placeholder="auto"
            maxlength="4"
            autocomplete="off"
            v-model="selectedStyle.right"
          />
        </span>
      </div>
      <div class="bottom-div">
        <span class="next-input next-medium next-noborder">
          <input
            placeholder="auto"
            maxlength="4"
            autocomplete="off"
            v-model="selectedStyle.bottom"
          />
        </span>
      </div>
      <div class="left-div">
        <span class="next-input next-medium next-noborder">
          <input placeholder="auto" maxlength="4" autocomplete="off" v-model="selectedStyle.left" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="position-editor">
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PostionOpt } from '/@page-designer/types/panel';
  import { Postion } from '/@page-designer/enum';
  import UpleftIcon from '../icon/upleft-icon.vue';
  import DownleftIcon from '../icon/downleft-icon.vue';
  import DownrightIcon from '../icon/downright-icon.vue';
  import UprightIcon from '../icon/upright-icon.vue';

  const { t } = useI18n();
  const { selectedStyle } = useSelectedWidget();
  //位置的选项
  const positionOptions: PostionOpt[] = [
    {
      label: Postion.RELATIVE,
      value: Postion.RELATIVE,
    },
    {
      label: Postion.ABSOLUTE,
      value: Postion.ABSOLUTE,
    },
    {
      label: Postion.FIXED,
      value: Postion.FIXED,
    },
    {
      label: Postion.STICKY,
      value: Postion.STICKY,
    },
  ];
  //absolute的快捷位置
  let absolutePos = '';
  const handleClickAbsolutePos = (pos: string) => {
    absolutePos = pos;
    switch (absolutePos) {
      case 'upLeft':
        selectedStyle.value.top = '0';
        selectedStyle.value.left = '0';
        selectedStyle.value.right = '';
        selectedStyle.value.bottom = '';
        break;
      case 'downLeft':
        selectedStyle.value.top = '';
        selectedStyle.value.left = '0';
        selectedStyle.value.right = '';
        selectedStyle.value.bottom = '0';
        break;
      case 'upRight':
        selectedStyle.value.top = '0';
        selectedStyle.value.left = '';
        selectedStyle.value.right = '0';
        selectedStyle.value.bottom = '';
        break;
      case 'downRight':
        selectedStyle.value.top = '';
        selectedStyle.value.left = '';
        selectedStyle.value.right = '0';
        selectedStyle.value.bottom = '0';
        break;
      default:
        break;
    }
  };
  const clearPosition = () => {
    selectedStyle.value.top = '';
    selectedStyle.value.left = '';
    selectedStyle.value.right = '';
    selectedStyle.value.bottom = '';
  };
</script>

<style lang="less" scoped>
  .ab-btn-box {
    display: flex;
    justify-content: space-around;
  }
  .position-box {
    position: relative;
    width: 100%;
    height: 150px;
    margin-top: 10px;
    .next-input input {
      background-color: transparent;
      width: 100%;
      border: none;
      outline: none;
    }
    .top-div {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-top: 30px solid #d5f6f3;
      transition: all 0.3s ease;
      .next-input.next-medium {
        position: absolute;
        left: 0;
        right: 0;
        top: -30px;
        height: 30px !important;
        background: transparent;
        width: 100%;
      }
      input {
        text-align: center;
        line-height: 30px;
        height: 30px;
        padding: 0;
        border: none;
        outline: none;
      }
      &:hover {
        border-top: 30px solid #b9ddda;
      }
    }
    .right-div {
      position: absolute;
      top: 5px;
      bottom: 5px;
      right: 0;
      width: 0;
      border-top: 30px solid transparent;
      border-bottom: 30px solid transparent;
      border-right: 30px solid #d5f6f3;
      transition: all 0.3s ease;
      .next-input.next-medium {
        position: absolute;
        top: 0;
        bottom: 0;
        right: -30px;
        width: 30px;
        margin: auto;
        background: transparent;
        input {
          position: absolute;
          top: 0;
          bottom: 0;
          right: -15px;
          margin: auto;
          width: 60px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          padding: 0 13px;
          border: none;
          outline: none;
        }
      }
      &:hover {
        border-right: 30px solid #b9ddda;
      }
    }
    .bottom-div {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid #d5f6f3;
      transition: all 0.3s ease;
      .next-input.next-medium {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -30px;
        height: 30px !important;
        background: transparent;
        width: 100%;
        input {
          text-align: center;
          line-height: 30px;
          height: 30px;
          padding: 0;
          border: none;
          outline: none;
        }
      }
      &:hover {
        border-bottom: 30px solid #b9ddda;
      }
    }
    .left-div {
      position: absolute;
      top: 5px;
      bottom: 5px;
      left: 0;
      width: 0;
      border-top: 30px solid transparent;
      border-bottom: 30px solid transparent;
      border-left: 30px solid #d5f6f3;
      transition: all 0.3s ease;
      .next-input.next-medium {
        position: absolute;
        top: 0;
        bottom: 0;
        left: -30px;
        width: 30px;
        margin: auto;
        background: transparent;
        input {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -15px;
          margin: auto;
          width: 60px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          padding: 0 13px;
          border: none;
          outline: none;
        }
      }
      &:hover {
        border-left: 30px solid #b9ddda;
      }
    }
  }
</style>
