<template>
  <div>
    <div class="ks-row-middle mb2px text-[#242424]">
      <div class="ks-col">{{ $t('sys.pageDesigner.title') }}</div>
      <div>
        <a-checkbox v-model:checked="showTitle" size="small" />
        {{ $t('sys.pageDesigner.displayLabelText') }}
      </div>
    </div>
    <div>
      <a-input v-model:value="title" :placeholder="$t('sys.inputText')" allowClear size="small" />
    </div>
  </div>
</template>
<script setup lang="ts" name="title-enable-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const showTitle = computed({
    get() {
      return propValue.value.showTitle;
    },
    set(showTitle) {
      propValue.value = {
        ...propValue.value,
        showTitle,
      };
    },
  });

  const title = computed({
    get() {
      return propValue.value.title;
    },
    set(title) {
      propValue.value = {
        ...propValue.value,
        title,
      };
    },
  });
</script>
<style lang="less" scoped></style>
