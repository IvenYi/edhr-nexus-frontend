<template>
  <div class="setting-row border-wrapper flex-col">
    <div class="sub-title mb-4px">{{ $t('sys.pageDesigner.border') }}</div>
    <div class="sub-content">
      <div class="sub-content_inner p-8px bg-[#F7F8FA]">
        <div class="setting-col style-setting">
          <div class="setting-label row-label">{{ $t('sys.pageDesigner.style') }}</div>
          <div class="setting-col_inner">
            <a-select
              :value="borderStyle || 'inherit'"
              @change="(val) => onBorderChange('border-style', val)"
            >
              <a-select-option value="none" :label="$t('sys.pageDesigner.borderStyle.none')" />
              <a-select-option value="solid" :label="$t('sys.pageDesigner.borderStyle.solid')" />
              <a-select-option value="dashed" :label="$t('sys.pageDesigner.borderStyle.dashed')" />
            </a-select>
          </div>
        </div>
        <div class="setting-col setting-col_right" style="width: 46%">
          <div class="setting-label row-label">{{ $t('sys.printDesigner.lineWidth') }}</div>
          <div class="setting-col_inner">
            <a-input-number
              v-model:value="borderWidthVal"
              @change="(v) => onBorderChange('border-width', v)"
              :min="1"
              @keyup.enter.native="onEnterVal"
            />
          </div>
        </div>
        <!-- <div class="setting-col color-setting">
          <div class="setting-col_inner">
            <g-color-picker
              :preset="presetColor"
              :color="borderColor"
              @update:color="handleUpdateColor"
            >
              <template #icon>
                <div
                  :style="{
                    width: '100%',
                    height: '24px',
                    backgroundColor: borderColor,
                  }"
                ></div>
              </template>
            </g-color-picker>
          </div>
          <div class="setting-label row-label">颜色</div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';

  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'border',
    components: { GColorPicker },
    props: {
      borderColor: {},
      borderStyle: {},
      borderWidth: {},
      type: { type: String, default: 'attr' }, // style/attr
      tag: { type: Boolean, default: false },
      tagAttr: { type: String, default: '' },
      hasBind: { type: Boolean, default: false },
      hasDisconnect: { type: Boolean, default: false },
    },
    data() {
      return {
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
        // borderSelected: ''
        borderWidthVal: parseInt(this.borderWidth) || 2,
      };
    },
    watch: {
      borderWidth(nv) {
        this.borderWidthVal = parseInt(this.borderWidth) || 2;
      },
    },
    methods: {
      handleUpdateColor(e, h) {
        this.onBorderChange('border-color', h);
      },
      // input-number组件会自动处理输入值
      onEnterVal(e) {
        this.onBorderChange('border-width', this.borderWidthVal);
        e.target.blur();
      },

      onBorderChange(style, val) {
        this.$emit('changeEvent', { style, val });
      },

      dragstartHandler(e) {
        e.dataTransfer.dropEffect = 'copy';
        e.dataTransfer.effectAllowed = 'all';
        // e.dataTransfer.setData('DragTreeTableOutDropData', this.tagAttr);
        window.DragTreeTableOutDropData = JSON.stringify({
          type: 'style',
          prop: this.tagAttr,
        });
      },
    },
  };
</script>
<style lang="less" scoped>
  .color-picker__wrapper {
    .color-block {
      height: 28px;
      padding: 5px;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      line-height: 28px;
      text-align: center;
      cursor: pointer;

      .color-example {
        height: 100%;
        border: 1px solid #999;
        border-radius: 2px;
      }
    }
  }

  .color-picker-panel {
    .popover-item {
      display: flex;
      align-items: center;

      .title {
        margin-right: 10px;
      }

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
</style>
