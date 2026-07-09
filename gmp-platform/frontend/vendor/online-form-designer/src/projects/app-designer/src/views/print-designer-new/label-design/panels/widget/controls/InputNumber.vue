<template>
  <div class="input-number">
    <div class="setting-row">
      <div class="sub-title">{{ label }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-input-number
            v-model="currentValue"
            :max="max"
            :min="min"
            size="mini"
            :step="step"
            :precision="precision"
            controls-position="right"
            @change="
              val => {
                $emit('changeEvent', Math.round(val * 100) / 100);
              }
            "
            @keyup.enter.native="e => e.target.blur()"
            style="width: 100%;"
          ></a-input-number>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'input-number',
  props: {
    value: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    precision: { type: Number, default: 1 },
    label: { type: String, default: '' }
  },
  data() {
    return {
      currentValue: this.value
    };
  },
  watch: {
    value(nv) {
      this.currentValue = nv;
    }
  },
  methods: {}
};
</script>
