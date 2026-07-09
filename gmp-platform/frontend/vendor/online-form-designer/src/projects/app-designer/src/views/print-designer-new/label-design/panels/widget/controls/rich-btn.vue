<template>
  <div class="input-content" :input-type="type" :attr-name="tagAttr">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ label }}</div>
      <div class="sub-content">
        <a-button block :type="currentValue ? 'primary' : 'default'" @click="(e) => handleClick(e)">
          {{ currentValue ? $t('sys.printDesigner.editContent') : $t('sys.printDesigner.pleaseEnterRichText') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'rich-btn',
    props: {
      value: { type: String },
      label: {
        default: $t('sys.printDesigner.richTextContent'),
      },
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
      handleClick(e) {
        e.stopPropagation();
        this.$emit('changeEvent', this.currentValue);
      },
    },
  };
</script>

<style scoped></style>
