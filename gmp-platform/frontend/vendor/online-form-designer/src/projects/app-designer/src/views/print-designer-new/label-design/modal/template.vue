<template>
  <basic-modal
    @register="register"
    :height="640"
    :title="$t('sys.printDesigner.labelTmplDesign')"
    centered
    width="1200px"
    wrapClassName="label-design-modal"
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
    const { width, height, strHeight, strWidth } = getSpecificationsForSize(1, dpi);
    project.value = {
      height: strHeight,
      width: strWidth,
      heightMM: height,
      widthMM: width,
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
      width: 296px;
      border-right: 1px solid #f1f1f1;
      background-color: #f7f8fa;
    }

    &-stage {
      flex: 1;
      width: 10px;
    }
  }
</style>
<style lang="less">
  .label-design-modal {
    &.vben .ant-modal .ant-modal-body > .scrollbar {
      padding: 0 16px !important;
    }
  }
</style>
