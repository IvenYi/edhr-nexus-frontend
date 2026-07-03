<template>
  <div class="setting-row flex-col">
    <div class="sub-title mb-2px">水平</div>
    <div class="sub-content">
      <div class="sub-content_inner">
        <div class="icon-bar" :class="{ disabled }">
          <div
            class="icon-bar_item"
            :class="{ active: isAlignedLeft }"
            @click="onToggleProp('left', isAlignedLeft)"
            title="左对齐"
          >
            <align-left-outlined />
          </div>
          <div
            class="icon-bar_item"
            :class="{ active: isCentered }"
            @click="onToggleProp('center', isCentered)"
            title="居中对齐"
          >
            <align-center-outlined />
          </div>
          <div
            class="icon-bar_item"
            :class="{ active: isAlignedRight }"
            @click="onToggleProp('right', isAlignedRight)"
            title="右对齐"
          >
            <align-right-outlined />
          </div>
          <div
            class="icon-bar_item"
            :class="{ active: isJustified }"
            @click="onToggleProp('justify', isJustified)"
            title="两端对齐"
          >
            <pic-center-outlined />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'text-align',
    props: {
      textAlign: { type: String, default: 'center' },
      disabled: { type: Boolean, default: false },
    },
    computed: {
      isAlignedLeft() {
        return this.textAlign === 'left';
      },
      isAlignedRight() {
        return this.textAlign === 'right';
      },
      isCentered() {
        return this.textAlign === 'center';
      },
      isJustified() {
        return this.textAlign === 'justify';
      },
    },
    methods: {
      onToggleProp(val, isOn) {
        this.$emit('changeEvent', isOn ? 'inherit' : val);
      },
    },
  };
</script>
<style lang="less" scoped></style>
