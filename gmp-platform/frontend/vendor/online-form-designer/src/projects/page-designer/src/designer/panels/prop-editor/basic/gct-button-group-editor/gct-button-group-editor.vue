<template>
  <div>
    <a-button type="primary" @click="addButton" ghost block>
      {{ $t('sys.pageDesigner.addButton') }}
    </a-button>
    <draggableButtonList :children="propValue" class="mt10px" />
  </div>
</template>
<script setup lang="ts" name="gct-button-group-editor">
  import { ref, computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { draggableButtonList, addButtonTemplate } from './components/index';

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  async function addButton() {
    const res = await gct.openUtil.modal(
      addButtonTemplate,
      { options: propConfig.options ? propConfig.options(defProps.widget) : [] },
      {
        title: $t('sys.pageDesigner.addButton'),
        width: 720,
      },
    );
    if (res.ok) {
      res.data.forEach((i) => {
        i.preLocation = defProps.widget?.id;
      });
      propValue.value.push(...res.data);
    }
  }
</script>
<style lang="scss" scoped></style>
