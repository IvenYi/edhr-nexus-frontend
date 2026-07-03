<template>
  <div>
    <a-button type="primary" @click="editorCode" ghost block>
      {{ title }}
    </a-button>
  </div>
</template>
<script setup lang="ts" name="gct-vue-editor">
  import { ref, computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import gctSfcTemplate from './components/gct-vue-sfc-template.vue';
  import data from './components/Temp.vue?raw';
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const title = $t('sys.pageDesigner.editVueCode');

  async function editorCode() {
    const res = await gct.openUtil.modal(
      gctSfcTemplate,
      {
        code: code.value,
      },
      {
        title,
        width: 1200,
        height: 800,
      },
    );
    if (res.ok) {
      code.value = res.data.code;
      runtimeCode.value = res.data.runtimeCode;
    }
  }

  const code = computed({
    get() {
      if (propValue.value.code === undefined) {
        return data;
      } else {
        return propValue.value.code;
      }
    },
    set(code) {
      propValue.value = { ...propValue.value, code };
    },
  });
  const runtimeCode = computed({
    get() {
      return propValue.value.runtimeCode;
    },
    set(runtimeCode) {
      propValue.value = { ...propValue.value, runtimeCode };
    },
  });
</script>
<style lang="scss" scoped></style>
