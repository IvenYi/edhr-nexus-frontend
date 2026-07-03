<template>
  <div class="select-content">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ label }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-radio-group v-model:value="currentValue" :options="options" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'radio-select',
    props: {
      options: {
        type: Array,
        default() {
          return [];
        },
      },
      value: {},
      isGroup: {
        default: false,
      },
      label: {},
    },
    data() {
      return {};
    },
    computed: {
      currentValue: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit('changeEvent', val);
        },
      },
    },
  };
</script>
