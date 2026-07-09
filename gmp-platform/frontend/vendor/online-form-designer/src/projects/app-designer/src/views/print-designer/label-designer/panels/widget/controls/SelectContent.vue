<template>
  <div class="select-content">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ label }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-select v-model:value="currentValue" :options="options" style="width: 100%" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'select-content',
    props: {
      options: {
        type: Array,
        default() {
          return [];
        },
      },
      label: {
        default: '选择',
      },
      value: {},
      isGroup: {
        default: false,
      },
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
