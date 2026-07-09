<template>
  <div class="setting-row color-picker__wrapper">
    <div class="sub-title" style="line-height: 26px">{{ label + '：' }}</div>
    <div class="sub-content">
      <div class="sub-content_inner">
        <g-color-picker :preset="presetColor" :color="colorValue" @update:color="handleUpdateColor">
          <template #icon>
            <div
              :style="{
                width: '24px',
                height: '24px',
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
</template>

<script lang="ts">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';

  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'color-picker',
    components: { GColorPicker },
    props: {
      value: { type: String, default: '#00000000' },
      label: { type: String, default: '' },
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
      };
    },
    computed: {
      colorValue: {
        get() {
          return this.value;
        },
        set(val) {
          this.onColorChange(val);
        },
      },
    },
    methods: {
      handleUpdateColor(e, h) {
        this.colorValue = h;
      },
      onColorChange(color) {
        this.$emit('changeEvent', color);
      },
    },
  };
</script>
