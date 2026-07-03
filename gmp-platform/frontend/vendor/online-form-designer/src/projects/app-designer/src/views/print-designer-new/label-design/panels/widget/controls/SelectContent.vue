<template>
  <div class="select-content">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ $t(label) }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <a-select v-model:value="currentValue" style="width: 100%">
            <a-select-option v-for="option in options" :key="option.value" :value="option.value">
              {{ $t(option.label) }}
            </a-select-option>
          </a-select>
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
        default: $t('sys.selectSth'),
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
