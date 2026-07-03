<template>
  <basic-modal
    @register="register"
    :height="640"
    title="标签模板设计"
    centered
    width="1200px"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="onCancel"
  >
    <div class="label-designer">
      <div class="label-designer-content">
        <designer-toolkit class="label-designer-toolkit" />
        <designer-stage class="label-designer-stage" />
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { BasicModal, useModal } from '/@/components/Modal';

  import DesignerToolkit from '../toolkits/toolkit.vue';
  import DesignerStage from '../stage/stage.vue';
  import { usePage } from '../hooks/usePage';
  import { getSpecificationsForSize } from '../../constants/size';
  import { useDesigner } from '../hooks/useDesigner';

  const props = defineProps<{
    destroyVm: Function;
  }>();
  const { selectedElements } = useDesigner();
  const { project, width, height } = usePage();
  const { destroyVm } = reactive(props);
  const [register, { openModal, closeModal }] = useModal();
  const callback = ref<Function>(() => {});
  function handleOk() {
    setTimeout(() => {
      callback.value(JSON.stringify(project.value));
      closeModal();
      destroyVm();
    }, 200);
  }
  function open(value, id, fun) {
    selectedElements.value = [];
    callback.value = fun;
    try {
      if (value) {
        project.value = JSON.parse(value);
      } else {
        initValue(id);
      }
    } catch (error) {
      initValue(id);
    }
    width.value = parseInt(project.value.width);
    height.value = parseInt(project.value.height);
    openModal();
  }
  function initValue(id) {
    const dpi = 203;
    const { strHeight, strWidth } = getSpecificationsForSize(1, dpi);
    project.value = {
      height: strHeight,
      width: strWidth,
      id: id,
      key: id,
      page: [],
      projectName: '',
      styles: { position: 'relative', margin: 'auto', background: '#fff' },
      labelSize: 1,
      modelKey: undefined,
      dpi,
    };
  }
  function onCancel() {
    destroyVm();
  }
  defineExpose({ open });
</script>
<style scoped lang="less">
  .label-designer {
    width: 100%;
    height: 100%;
    background-color: #f1f1f1;
    color: #333;

    &-header {
      height: 56px;
    }

    &-content {
      display: flex;
      height: 100%;
    }

    &-nav {
      flex: none;
      width: 56px;
      border-right: 2px solid #f1f1f1;
      background-color: #fff;
    }

    &-toolkit {
      flex: none;
      width: 264px;
      border-right: 2px solid #f1f1f1;
      background-color: #fff;
    }

    &-stage {
      flex: 1;
      width: 10px;
    }
  }
</style>
