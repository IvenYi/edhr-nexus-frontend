<template>
  <div class="setting-row flex-col">
    <div class="sub-content">
      <div class="sub-content_inner">
        <div class="icon-bar" :class="{ disabled }">
          <div
            class="icon-bar_item"
            :class="{ active: isTop }"
            @click="onToggleProp('top', isTop)"
            :title="$t('sys.printDesigner.vertical.top')"
          >
            <vertical-align-top-outlined />
          </div>
          <div
            class="icon-bar_item"
            :class="{ active: isCentered }"
            @click="onToggleProp('middle', isCentered)"
            :title="$t('sys.printDesigner.vertical.middle')"
          >
            <vertical-align-middle-outlined />
          </div>
          <div
            class="icon-bar_item"
            :class="{ active: isBottom }"
            @click="onToggleProp('bottom', isBottom)"
            :title="$t('sys.printDesigner.vertical.bottom')"
          >
            <vertical-align-bottom-outlined />
          </div>
          <!-- <div class="icon-bar_item">
            <i class="font_family"></i>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'text-vertical-align',
    props: {
      verticalAlign: { type: String, default: 'top' },
      disabled: { type: Boolean, default: false },
    },
    computed: {
      isTop() {
        return this.verticalAlign === 'top';
      },
      isBottom() {
        return this.verticalAlign === 'bottom';
      },
      isCentered() {
        return this.verticalAlign === 'middle';
      },
    },
    methods: {
      onToggleProp(val, isOn) {
        if (!isOn) {
          this.$emit('changeEvent', val);
        }
      },
    },
  };
</script>
