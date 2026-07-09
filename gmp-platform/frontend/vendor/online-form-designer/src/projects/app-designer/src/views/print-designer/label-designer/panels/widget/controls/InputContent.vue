<template>
  <div class="input-content" :input-type="type" :attr-name="tagAttr">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ label }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-input
            v-if="type === 'text'"
            v-model:value="currentValue"
            :disabled="hasBind"
            style="width: 100%"
            @change="(e) => changeValue(e.target.value)"
          />
          <a-input-number
            v-if="type === 'number'"
            v-model:value="currentValue"
            :max="max"
            :min="min"
            :step="step"
            :precision="precision"
            controls-position="right"
            :disabled="hasBind"
            style="width: 100%"
            @keyup.enter.native="(e) => e.target.blur()"
            @change="(e) => changeValue(e)"
          />
          <a-date-picker
            v-else-if="type === 'date'"
            v-model:value="currentValue"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            :disabled="hasBind"
            @change="(e) => changeValue(e)"
          />
          <color-picker />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'input-content',
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
    },
    data() {
      return {
        currentValue: this.value,
      };
    },
    watch: {
      value(nv) {
        this.currentValue = nv;
      },
    },
    methods: {
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

<style scoped></style>
