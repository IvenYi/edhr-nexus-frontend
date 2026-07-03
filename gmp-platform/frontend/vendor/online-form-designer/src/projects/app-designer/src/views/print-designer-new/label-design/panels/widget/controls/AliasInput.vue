<template>
  <div class="setting-row flex-col">
    <div class="sub-title mb-2px">{{ $t('sys.name') }}</div>
    <div class="sub-content">
      <div class="sub-content_inner">
        <a-input
          ref="alias"
          v-model:value="a"
          size="mini"
          @keyup.enter.native="onEnterVal('a', 'alias')"
          @blur="onEnterVal"
          show-count
          :maxlength="32"
        />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'alias-input',
    props: {
      alias: { type: [String], default: '' },
    },
    data() {
      return {
        a: '',
      };
    },
    watch: {
      alias(val) {
        if (val !== this.a) {
          this.a = val;
        }
      },
    },
    created() {
      this.a = this.alias;
    },
    methods: {
      checkVal(val, type) {
        if (!val) {
          this.$message.error($t('sys.printDesigner.compNameEmptyTip'));
          return false;
        } else {
          return true;
        }
      },

      onEnterVal(dataField, type) {
        const newVal = this.a;
        if (!this.checkVal(newVal)) {
          this.a = this.alias;
        } else {
          this.emitChanges(newVal);
        }
        this.$refs.alias.blur();
      },

      emitChanges(value) {
        this.$emit('changeEvent', value);
      },
    },
  };
</script>
