<template>
  <BorderRadius isLabelPrint :value="value" @changeEvent="changeEvent" />
</template>
<script>
  import { defineComponent } from 'vue';
  import BorderRadius from '/@page-designer/designer/panels/widget/style-modules/radius.vue';

  export default defineComponent({
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'border-radius',
    components: { BorderRadius },
    props: {
      value: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    emits: ['changeEvent'],
    watch: {
      value(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
    },
    methods: {
      changeEvent(...args) {
        this.$emit('changeEvent', ...args);
      },
    },
  });
</script>
