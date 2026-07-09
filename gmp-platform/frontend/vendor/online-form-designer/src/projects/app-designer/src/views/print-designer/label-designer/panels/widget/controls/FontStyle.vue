<template>
  <div class="font-style">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">样式</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <div class="icon-bar" :class="{ disabled }">
            <div class="icon-bar_item" :class="{ active: isBold }" title="加粗">
              <bold-outlined @click="onToggleProp('font-weight', 'bold', isBold)" />
            </div>
            <div class="icon-bar_item" :class="{ active: isItalic }" title="倾斜">
              <italic-outlined @click="onToggleProp('font-style', 'italic', isItalic)" />
            </div>
            <!-- <div class="icon-bar_item" :class="{ active: isUnderlined }" style="visibility: hidden">
              <underline-outlined
                @click="onToggleProp('text-decoration', 'underline', isUnderlined)"
              />
            </div>
            <div class="icon-bar_item" style="visibility: hidden">
              <i class="font_family"></i>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'font-style',
    props: {
      fontWeight: { type: String, default: 'inherit' },
      fontStyle: { type: String, default: 'inherit' },
      textDecoration: { type: String, default: 'inherit' },
      disabled: { type: Boolean, default: false },
    },
    computed: {
      isBold() {
        return this.fontWeight === 'bold';
      },
      isItalic() {
        return this.fontStyle === 'italic';
      },
      isUnderlined() {
        return this.textDecoration === 'underline';
      },
      isStriked() {
        return this.textDecoration === 'line-through';
      },
    },
    methods: {
      onToggleProp(prop, val, isOn) {
        this.$emit('changeEvent', { prop, value: isOn ? 'inherit' : val });
      },
    },
  };
</script>
