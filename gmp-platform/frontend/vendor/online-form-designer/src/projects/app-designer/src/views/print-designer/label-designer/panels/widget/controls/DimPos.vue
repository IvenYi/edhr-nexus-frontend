<template>
  <div class="dim-pos clearfix">
    <div class="setting-row flex-col" v-if="hasDim">
      <div class="sub-title mb-4px">尺寸</div>
      <div class="sub-content">
        <div class="sub-content_inner p-8px bg-[#F7F8FA]">
          <div class="setting-col setting-col_right" :class="{ 'no-check': !hasPos }">
            <div class="setting-label row-label">宽度<i> / </i><span>mm</span></div>
            <a-input-number
              ref="width"
              v-model:value="w"
              :disabled="disabled || w === 'auto' || widthDisabled"
              @keyup.enter.native="onEnterVal(w, 'width')"
              @blur="onEnterVal(w, 'width')"
            />
          </div>
          <div class="setting-col" :class="{ 'no-check': !hasPos }">
            <div class="setting-label row-label">高度<i> / </i><span>mm</span></div>
            <a-input-number
              ref="height"
              v-model:value="h"
              :disabled="disabled || h === 'auto' || heightDisabled"
              @keyup.enter.native="onEnterVal(h, 'height')"
              @blur="onEnterVal(h, 'height')"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="setting-row flex-col" v-if="hasPos">
      <div class="sub-title mb-4px">位置</div>
      <div class="sub-content">
        <div class="sub-content_inner p-8px bg-[#F7F8FA]">
          <div v-if="hasPos" class="setting-col setting-col_left">
            <div class="setting-label row-label">Y轴<i> / </i><span>mm</span></div>
            <a-input-number
              ref="top"
              v-model:value="t"
              :max="hMax - 30"
              :min="0"
              :disabled="disabled || t === 'auto'"
              @keyup.enter.native="onEnterVal(t, 'top')"
              @blur="onEnterVal(t, 'top')"
            />
          </div>
          <div v-if="hasPos" class="setting-col setting-col_right">
            <div class="setting-label row-label">X轴<i> / </i><span>mm</span></div>
            <a-input-number
              ref="left"
              v-model:value="l"
              :max="wMax - 30"
              :min="0"
              :disabled="disabled || l === 'auto'"
              @keyup.enter.native="onEnterVal(l, 'left')"
              @blur="onEnterVal(l, 'left')"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="setting-row" v-if="hasRotate">
      <div class="sub-title" style="line-height: 28px">Y轴变形</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <div class="setting-col setting-col_left" style="width: 100%">
            <a-select
              style="width: 100%"
              v-model:value="rot"
              @change="
                (val) => {
                  onEnterVal(rot, 'rotate');
                }
              "
            >
              <a-select-option label="0度" :value="0" />
              <a-select-option label="90度" :value="90" />
            </a-select>
            <!-- <div class="setting-label row-label">旋转</div> -->
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasPos" class="setting-col setting-col_left"> </div>

    <div v-if="hasPos" class="setting-col setting-col_right"> </div>
  </div>
</template>
<script setup lang="ts" name="dim-pos">
  import { ref, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePage } from '../../../hooks/usePage';

  const { createMessage } = useMessage();
  const { width: wMax, height: hMax } = usePage();
  const emit = defineEmits(['changeEvent']);
  const height = ref();
  const width = ref();
  const left = ref();
  const top = ref();
  const props = defineProps({
    minWidth: { type: Number, default: 1 },
    minHeight: { type: Number, default: 1 },
    height: { type: [String, Number], default: 'auto' },
    width: { type: [String, Number], default: 'auto' },
    top: { type: [String, Number], default: 'auto' },
    bottom: { type: [String, Number], default: 'auto' },
    left: { type: [String, Number], default: 'auto' },
    right: { type: [String, Number], default: 'auto' },
    rotate: { type: [String, Number], default: 0 },
    hasDim: { type: Boolean, default: true },
    hasPos: { type: Boolean, default: true },
    hasRotate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    heightDisabled: { type: Boolean, default: false },
    widthDisabled: { type: Boolean, default: false },
  });
  const w = ref(props.width);
  const h = ref(props.height);
  const t = ref(props.top);
  const l = ref(props.left);
  const rot = ref(props.rotate);
  watch(
    () => props.width,
    (val) => {
      if (val !== w.value) {
        w.value = val;
      }
    },
  );
  watch(
    () => props.height,
    (val) => {
      if (val !== h.value) {
        h.value = val;
      }
    },
  );
  watch(
    () => props.left,
    (val) => {
      if (val !== l.value) {
        l.value = val;
      }
    },
  );
  watch(
    () => props.top,
    (val) => {
      if (val !== t.value) {
        t.value = val;
      }
    },
  );
  watch(
    () => props.rotate,
    (val) => {
      if (val !== rot.value) {
        rot.value = val;
      }
    },
  );
  const checkVal = (val, type) => {
    const num = parseInt(Number(val));
    switch (type) {
      case 'width':
        if (isNaN(num) || num < 0) {
          createMessage.error('该项只接受正整数');
          return false;
        } else if (num < props.minWidth) {
          createMessage.error('该项最小值为' + props.minWidth);
          return false;
        } else {
          return true;
        }
      case 'height':
        if (isNaN(num) || num < 0) {
          createMessage.error('该项只接受正整数');
          return false;
        } else if (num < props.minHeight) {
          createMessage.error('该项最小值为' + props.minHeight);
          return false;
        } else {
          return true;
        }
      case 'left':
      case 'top':
        if (isNaN(num) || num < 0) {
          createMessage.error('该项只接受正整数');
          return false;
        } else {
          return true;
        }
      case 'rotate':
        if (isNaN(num) || ![0, 90].includes(num)) {
          createMessage.error('该项只接受0,90');
          return false;
        } else {
          return true;
        }
      default:
        return false;
    }
  };
  const onEnterVal = (dataField, type) => {
    const map = {
      width: w,
      height: h,
      top: t,
      left: l,
    };
    if (type === 'width' || type === 'height') {
      if (!parseInt(dataField)) map[type].value = 1;
    }

    const newVal = dataField;
    if (!checkVal(newVal, type)) {
      map[type].value = props[type];
    } else {
      emitChanges(type, newVal);
      if (type === 'rotate') {
        const oldWidth = props.width;
        const oldHeight = props.height;
        emitChanges('width', oldHeight);
        emitChanges('height', oldWidth);
      }
    }
    // this.$refs[type] && this.$refs[type].blur();
  };
  const emitChanges = (type, value) => {
    emit('changeEvent', { type, value });
  };
</script>
