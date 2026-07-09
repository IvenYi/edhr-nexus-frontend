<template>
  <div>
    <div
      style="display: flex; justify-content: space-between; margin-top: 10px; margin-bottom: 10px"
    >
      <div
        @click="propValue = SignatureStyleEnum.VERTICAL"
        class="card flex-col"
        :class="propValue === SignatureStyleEnum.VERTICAL ? 'selected' : ''"
      >
        <div class="gradient-line"></div>
        <div class="text-[#8B8B8B] mt4px text-[7px]"> yyyy-mm-dd 00:00 </div>
      </div>
      <div
        @click="propValue = SignatureStyleEnum.HORIZONTAL"
        class="card ml12px"
        :class="propValue === SignatureStyleEnum.HORIZONTAL ? 'selected' : ''"
      >
        <div class="gradient1-line"></div>
        <div class="text-[#8B8B8B] ml4px text-[7px]"> yyyy-mm-dd 00:00 </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="datetime-style-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { SignatureStyleEnum } from '/@/projects/page-designer/src/enum';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style lang="less" scoped>
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 106px;
    height: 56px;
    border: 1px solid #e0e3eb;
    border-radius: 4px;
    cursor: pointer;
  }

  .gradient-line {
    width: calc(35px + 34px); /* 20个1px线条 + 19个1px间隙 */
    height: 12px;
    background-image: repeating-linear-gradient(
      to right,
      #cacfd8,
      #cacfd8 1px,
      transparent 1px,
      transparent 2px
    );
    background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
  }

  .gradient1-line {
    width: calc(10px + 9px); /* 20个1px线条 + 19个1px间隙 */
    height: 12px;
    background-image: repeating-linear-gradient(
      to right,
      #cacfd8,
      #cacfd8 1px,
      transparent 1px,
      transparent 2px
    );
    background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
  }

  .selected {
    border: 1px solid var(--ant-primary-color);

    .gradient-line {
      width: calc(35px + 34px); /* 20个1px线条 + 19个1px间隙 */
      height: 12px;
      background-image: repeating-linear-gradient(
        to right,
        var(--ant-primary-color),
        var(--ant-primary-color) 1px,
        transparent 1px,
        transparent 2px
      );
      background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
    }

    .gradient1-line {
      width: calc(10px + 9px); /* 20个1px线条 + 19个1px间隙 */
      height: 12px;
      background-image: repeating-linear-gradient(
        to right,
        var(--ant-primary-color),
        var(--ant-primary-color) 1px,
        transparent 1px,
        transparent 2px
      );
      background-size: 2px 12px; /* 每个重复单元宽2px（1px线条+1px透明） */
    }
  }
</style>
