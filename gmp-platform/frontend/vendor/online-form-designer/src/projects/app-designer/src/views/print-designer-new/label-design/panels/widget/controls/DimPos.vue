<template>
  <div class="dim-pos clearfix">
    <div class="setting-row flex-col" v-if="hasPos">
      <div class="sub-title mb-4px">{{ $t('sys.position') }}</div>
      <div class="sub-content">
        <div class="sub-content_inner p-8px bg-[#F7F8FA]">
          <div v-if="hasPos" class="setting-col setting-col_left">
            <div class="setting-label row-label">{{ $t('sys.pageDesigner.xAxis') }}<i> / </i><span>mm</span></div>
            <a-input-number
              ref="left"
              v-model:value="l"
              :max="wMax - 30"
              :min="0"
              :precision="2"
              :disabled="disabled || l === 'auto'"
            />
          </div>
          <div v-if="hasPos" class="setting-col setting-col_right">
            <div class="setting-label row-label">{{ $t('sys.pageDesigner.yAxis') }}<i> / </i><span>mm</span></div>
            <a-input-number
              ref="top"
              v-model:value="t"
              :max="hMax - 30"
              :min="0"
              :precision="2"
              :disabled="disabled || t === 'auto'"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="setting-row flex-col" v-if="hasDim">
      <div class="sub-title mb-4px">{{ $t('sys.pageDesigner.size') }}</div>
      <div class="sub-content">
        <div class="sub-content_inner p-8px bg-[#F7F8FA]">
          <div class="setting-col setting-col_right" :class="{ 'no-check': !hasPos }">
            <div class="setting-label row-label">{{ $t('sys.pageDesigner.height') }}<i> / </i><span>mm</span></div>
            <a-input-number
              ref="height"
              v-model:value="h"
              :min="1"
              :precision="0"
              :disabled="disabled || h === 'auto' || heightDisabled"
            />
          </div>
          <div class="setting-col" :class="{ 'no-check': !hasPos }">
            <div class="setting-label row-label">{{ $t('sys.width') }}<i> / </i><span>mm</span></div>
            <a-input-number
              ref="width"
              v-model:value="w"
              :min="1"
              :precision="0"
              :disabled="disabled || w === 'auto' || widthDisabled"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="setting-row" v-if="hasRotate">
      <div class="sub-title" style="line-height: 28px">{{ $t('sys.pageDesigner.rotate') }}</div>
      <div class="sub-content">
        <div class="sub-content_inner flex items-center">
          <div class="setting-label row-label rotate flex-1"> {{ rot }}°</div>
          <a-tooltip placement="topRight">
            <template #title>{{ $t('sys.pageDesigner.rotateTip') }}</template>
            <IconNext color="#434855" value="icon-a-xuanzhuan4" :size="16" @click="rotate()" />
          </a-tooltip>
        </div>
      </div>
    </div>

    <div v-if="hasPos" class="setting-col setting-col_left"> </div>

    <div v-if="hasPos" class="setting-col setting-col_right"> </div>
  </div>
</template>
<script setup lang="ts" name="dim-pos">
  import { computed, ref } from 'vue';
  import { usePage, labelInfo } from '../../../hooks/usePage';
  import { mmConvertPx, pxConvertMm } from '/@/utils/unitConversion';
  import { IconNext } from '/@/components/Icon';

  const { width: wMax, height: hMax, project } = usePage();
  const emit = defineEmits(['changeEvent']);
  const props = defineProps({
    height: { type: [String, Number] },
    heightMM: { type: [String, Number] },
    width: { type: [String, Number] },
    widthMM: { type: [String, Number] },
    top: { type: [String, Number] },
    topMM: { type: [String, Number] },
    bottom: { type: [String, Number] },
    left: { type: [String, Number] },
    leftMM: { type: [String, Number] },
    right: { type: [String, Number] },
    rotate: { type: [String, Number], default: 0 },
    hasDim: { type: Boolean, default: true },
    hasPos: { type: Boolean, default: true },
    hasRotate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    heightDisabled: { type: Boolean, default: false },
    widthDisabled: { type: Boolean, default: false },
  });

  const px2mm = (num, precision = 2): number => {
    const n = pxConvertMm(num, labelInfo.value?.dpi || project.value.dpi);
    if (precision === 0) {
      return Math.round(n);
    }
    // px转mm保留两位小数
    return parseFloat(n.toFixed(precision));
  };

  const mm2px = (num, precision = 2): number => {
    const n = mmConvertPx(num ?? 0, labelInfo.value?.dpi || project.value.dpi);
    if (precision === 0) {
      return Math.round(n);
    }
    // mm转px保留两位小数
    return parseFloat(n.toFixed(precision));
  };

  const w = computed({
    get() {
      if (props.width != null) {
        const mm = px2mm(props.width, 0);
        emitChanges('widthMM', mm);
        return mm;
      }
      // if (props.widthMM != null) {
      //   return props.widthMM;
      // }
      return 'auto';
    },
    set(val) {
      onEnterVal(val, 'widthMM');
      const px = mm2px(val ?? 0, 0);
      emitChanges('width', px);
    },
  });
  const h = computed({
    get() {
      if (props.height != null) {
        const mm = px2mm(props.height, 0);
        emitChanges('heightMM', mm);
        return mm;
      }
      // if (props.heightMM != null) {
      //   return props.heightMM;
      // }
      return 'auto';
    },
    set(val) {
      onEnterVal(val, 'heightMM');
      const px = mm2px(val ?? 0, 0);
      emitChanges('height', px);
    },
  });
  const t = computed({
    get() {
      if (props.top != null && props.topMM == null) {
        const mm = px2mm(props.top);
        emitChanges('topMM', mm);
        return mm;
      }
      if (props.topMM != null) {
        return props.topMM;
      }
      return 'auto';
    },
    set(val) {
      onEnterVal(val, 'topMM');
      const px = mm2px(val ?? 0);
      emitChanges('top', px);
    },
  });
  const l = computed({
    get() {
      if (props.left != null && props.leftMM == null) {
        const mm = px2mm(props.left);
        emitChanges('leftMM', mm);
        return mm;
      }
      if (props.leftMM != null) {
        return props.leftMM;
      }
      return 'auto';
    },
    set(val) {
      onEnterVal(val, 'leftMM');
      const px = mm2px(val ?? 0);
      emitChanges('left', px);
    },
  });
  const rot = ref(props.rotate);
  const onEnterVal = (dataField, type) => {
    emitChanges(type, dataField);
    if (type === 'rotate') {
      const oldWidth = props.width;
      const oldHeight = props.height;
      emitChanges('width', oldHeight);
      emitChanges('height', oldWidth);
      const oldWidthMM = props.widthMM;
      const oldHeightMM = props.heightMM;
      emitChanges('widthMM', oldHeightMM);
      emitChanges('heightMM', oldWidthMM);
    }
  };
  const emitChanges = (type, value) => {
    emit('changeEvent', { type, value });
  };

  const rotate = () => {
    rot.value = (Number(rot.value) + 90) % 360;
    onEnterVal(rot.value, 'rotate');
  };
</script>
<style lang="less" scoped>
  .rotate {
    height: 26px;
    padding-left: 8px;
    border-radius: 4px;
    background: #f7f8fa;
    line-height: 26px;
  }

  .icon-a-xuanzhuan4 {
    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
