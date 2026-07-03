<template>
  <BorderEditor isLabelPrint :value="value" @changeEvent="changeEvent" />
</template>
<script>
  import { defineComponent } from 'vue';
  import BorderEditor from '/@page-designer/designer/panels/style-editor/basic/border-editor.vue';

  export default defineComponent({
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'border-config',
    components: { BorderEditor },
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
