<template>
  <div ref="DndContainerRef" class="lo-dnd">
    <div class="lo-dnd__title">控件列表</div>
    <a-collapse v-model:activeKey="activeKey" ghost expandIconPosition="right">
      <a-collapse-panel v-for="g in NodeGroupList" :key="g.name" :header="g.name">
        <component
          v-for="n in g.nodes"
          :key="n.value"
          :is="controlComps[n.value]"
          :style="getContoalSize(n.value)"
          @mousedown="(e) => handleDrag(e, n)"
        />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { NodeGroupList } from '../../constants';
  import { controlSchema, getSize } from '../../schema';
  // import { SoRegister } from '../utils/register';
  import { useControlsRegister } from '../../hooks/useControlsRegister';
  import { useLo } from '../../hooks/useLo';
  // import {} from '../types'

  const { dndControls } = useControlsRegister();

  const { drag } = useLo();

  // const activeKey = ref<string[]>([]);
  const activeKey = ref<string[]>(NodeGroupList.map((item) => item.name));

  const controlComps = {};
  for (const path in dndControls) {
    // const name = nodes[path].default.name;
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    controlComps[name] = dndControls[path].default;
  }

  // const soInstance = inject('soInstance') as Ref<SoRegister>;

  const handleDrag = (e: MouseEvent, n) => {
    drag(e, n);
  };

  const getContoalSize = (value) => {
    const size = getSize(value);
    return {
      '--width': size.width + 'px',
      '--height': size.height + 'px',
    };
  };
</script>

<style lang="less" scoped>
  .lo-dnd {
    &__title {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      color: #333;
      padding-left: 16px;
      border-bottom: 1px solid #eaeaea;
      font-weight: bold;
    }

    .ant-collapse {
      :deep(.ant-collapse-header) {
        border-bottom: 1px solid #eaeaea;
      }
      :deep(.ant-collapse-content-box) {
        display: grid;
        grid-template-columns: 50% 50%;
        justify-items: center;
        row-gap: 16px;
      }
    }
  }
</style>
