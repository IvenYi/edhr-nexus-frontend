<template>
  <div class="font-family">
    <div class="setting-row flex-col">
      <div class="sub-title mb-4px">{{ $t('sys.pageDesigner.character') }}</div>
      <div class="sub-content overflow-hidden">
        <div class="sub-content_inner overflow-hidden mr8px">
          <a-select v-model:value="currentValue" style="width: 100%">
            <a-select-opt-group
              v-for="(fontFamily, index) in aa"
              :key="'fontfamliy' + Math.random()"
            >
              <template #label>
                <span>{{ fontFamily.family }}</span>
              </template>
              <a-select-option
                v-for="(font, i) in fontFamily.fonts"
                :key="Math.random()"
                :value="font.definition"
                :label="font.name"
              />
            </a-select-opt-group>
          </a-select>
        </div>
        <div class="sub-content_inner mr8px">
          <a-input-number
            v-if="type === 'number'"
            v-model:value="currentSize"
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
        </div>
        <div class="w24px">
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
  import { getLabelListFont } from '/@/apis/gct-apaas/LabelController';
  import { useNamespace } from '@gct/runtime';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';

  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'font-family',
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
      fontFamily: { type: String, default: 'Roboto, sans-serif' },
    },
    data() {
      return {
        aa: [
          {
            family: $t('sys.printDesigner.font.SimHei'),
            fonts: [
              {
                name: $t('sys.printDesigner.font.MicrosoftYahei'),
                definition: $t('sys.printDesigner.font.MicrosoftYahei'),
              },
              {
                name: $t('sys.printDesigner.font.SimHei'),
                definition: $t('sys.printDesigner.font.SimHei'),
              },
            ],
          },
          {
            family: $t('sys.printDesigner.font.SimSun'),
            fonts: [
              {
                name: $t('sys.printDesigner.font.SimSun'),
                definition: $t('sys.printDesigner.font.SimSun'),
              },
            ],
          },
          {
            family: 'serif',
            fonts: [
              {
                name: 'Georgia',
                definition: 'Georgia, serif',
              },
              {
                name: 'Palatino',
                definition: '"Palatino Linotype", "Book Antiqua", Palatino serif',
              },
              {
                name: 'Times',
                definition: '"Times New Roman", Times serif',
              },
              {
                name: $t('sys.printDesigner.font.SimSun'),
                definition: $t('sys.printDesigner.font.SimSun'),
              },
            ],
          },
          {
            family: 'sans-serif',
            fonts: [
              {
                name: 'Arial',
                definition: 'Arial, Helvetica, sans-serif',
              },
              {
                name: 'Arial Black',
                definition: '"Arial Black", Gadget, sans-serif',
              },
              // {
              //   name: 'Charcoal',
              //   definition: 'Charcoal, sans-serif',
              // },
              // {
              //   name: 'Geneva',
              //   definition: 'Geneva, Tahoma, sans-serif',
              // },
              // {
              //   name: 'Helvetica',
              //   definition: 'Helvetica, Arial, sans-serif',
              // },
              {
                name: 'Impact',
                definition: 'Impact, Charcoal, sans-serif',
              },
              {
                name: 'Lucida Sans',
                definition: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
              },
              {
                name: 'Tahoma',
                definition: 'Tahoma, Geneva, sans-serif',
              },
              // {
              //   name: 'Roboto',
              //   definition: 'Roboto, sans-serif',
              // },
              {
                name: 'Trebuchet',
                definition: '"Trebuchet MS", Helvetica, sans-serif',
              },
              {
                name: 'Verdana',
                definition: 'Verdana, Geneva, sans-serif',
              },
            ],
          },
          {
            family: 'monospace',
            fonts: [
              {
                name: 'Courier',
                definition: '"Courier New", Courier, monospace',
              },
              {
                name: 'Lucida Console',
                definition: '"Lucida Console", Monaco, monospace',
              },
            ],
          },
          {
            family: 'icons',
            fonts: [
              {
                name: 'Material Icons',
                definition: '"Material Icons"',
              },
            ],
          },
        ],
        currentSize: this.value,
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
      currentValue: {
        get() {
          return this.fontFamily;
        },
        set(val) {
          this.$emit('changeEvent', val);
        },
      },
    },
    watch: {
      value(nv) {
        this.currentSize = nv;
      },
    },
    created() {
      const run = async () => {
        const res = await getLabelListFont();
        if (res) {
          const items: any[] = [];
          res.forEach((item) => {
            items.push({
              name: item.key,
              definition: item.value,
            });
          });
          this.aa.push({
            family: $t('sys.pageDesigner.other'),
            fonts: items,
          });
        }
      };
      run();
    },
    methods: {
      handleUpdateColor(e, h) {
        this.colorValue = h;
      },
      onColorChange(color) {
        this.$emit('change3Event', color);
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
          this.currentSize = val;
        }
        this.$emit('change2Event', this.currentSize);
        if (this.type === 'number' && this.defaultValue) {
          this.currentSize = val ?? this.defaultValue;
        }
        if (!this.validate) {
          console.log('1111111111111');
          this.$emit('change2Event', val);
        } else {
          if (this.validate(val)) {
            this.$emit('change2Event', val);
          } else {
            this.currentSize = this.value;
          }
        }
      },
    },
  };
</script>
