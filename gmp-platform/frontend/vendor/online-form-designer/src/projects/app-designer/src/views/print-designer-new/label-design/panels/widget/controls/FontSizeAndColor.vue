<template>
  <div :class="ns.b()" :input-type="type" :attr-name="tagAttr">
    <div class="setting-row flex-col">
      <div class="sub-title mb-4px">{{ label }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-input-number
            v-if="type === 'number'"
            v-model:value="currentValue"
            :max="max"
            :min="min"
            :step="step"
            :precision="precision"
            controls-position="right"
            :disabled="hasBind"
            addonAfter="px"
            @keyup.enter.native="(e) => e.target.blur()"
            @change="(e) => changeValue(e)"
          />
          <g-color-picker
            class="g-color-picker"
            :preset="presetColor"
            :color="colorValue"
            @update:color="handleUpdateColor"
          >
            <template #icon>
              <div
                :style="{
                  width: '26px',
                  height: '26px',
                  backgroundColor: colorValue,
                  border: '1px solid #E8EBF0',
                  borderRadius: '4px',
                }"
              ></div>
            </template>
          </g-color-picker>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { useNamespace } from '@gct/runtime';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';

  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'font-size-and-color',
    components: { GColorPicker },
    props: {
      value: { type: String },
      type: { type: String, default: 'text' },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      step: { type: Number, default: 1 },
      precision: { type: Number, default: 0 },
      label: { type: String, default: 'text' },
      validate: { type: Function },
      filter: { type: Function },
      tagAttr: { type: String, default: 'text' },
      tag: { type: Boolean, default: false },
      hasBind: { type: Boolean, default: false },
      hasDisconnect: { type: Boolean, default: false },
      defaultValue: { type: Number },
      color: { type: String },
    },
    data() {
      return {
        currentValue: this.value,
        ns: useNamespace('font-size-and-color'),
        presetColor: [
          '#DBDBDB',
          '#FFE4E4',
          '#D1D1D1',
          '#838383',
          '#838383',
          '#FFEECB',
          '#D8E3FF',
          '#FF8888',
          '#FF8888',
          '#0DAA9C',
          '#3370FF',
        ],
      };
    },
    computed: {
      colorValue: {
        get() {
          return this.color;
        },
        set(val) {
          this.onColorChange(val);
        },
      },
    },
    watch: {
      value(nv) {
        this.currentValue = nv;
      },
    },
    methods: {
      handleUpdateColor(e, h) {
        this.colorValue = h;
      },
      onColorChange(color) {
        this.$emit('change2Event', color);
      },
      dragstartHandler(e) {
        e.dataTransfer.dropEffect = 'copy';
        e.dataTransfer.effectAllowed = 'all';
        // e.dataTransfer.setData('DragTreeTableOutDropData', this.tagAttr);
        window.DragTreeTableOutDropData = JSON.stringify({
          type: 'attr',
          prop: this.tagAttr,
        });
      },
      changeValue(val) {
        // console.log(val);
        if (this.type === 'text') {
          val = val.trim();
          if (this.filter) {
            val = this.filter(val);
          }
          this.currentValue = val;
        }
        this.$emit('changeEvent', this.currentValue);
        if (this.type === 'number' && this.defaultValue) {
          this.currentValue = val ?? this.defaultValue;
        }
        if (!this.validate) {
          this.$emit('changeEvent', val);
        } else {
          if (this.validate(val)) {
            this.$emit('changeEvent', val);
          } else {
            this.currentValue = this.value;
          }
        }
      },
    },
  };
</script>
<style lang="scss">
  @include b(font-size-and-color) {
    .sub-content_inner {
      display: flex;
      align-items: center;

      .g-color-picker {
        margin-left: 8px;
      }
    }
  }
</style>
