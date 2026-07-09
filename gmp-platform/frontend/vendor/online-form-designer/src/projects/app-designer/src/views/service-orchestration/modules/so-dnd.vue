<template>
  <div ref="DndContainerRef" class="dnd">
    <div class="dnd__title">控件列表</div>
    <a-collapse v-model:activeKey="activeKey" ghost expandIconPosition="right">
      <a-collapse-panel v-for="g in filterNodeGroupList" :key="g.name" :header="g.name">
        <div class="control-item" v-for="n in g.nodes" :key="n.value">
          <component
            :style="{
              height: n.size.height + 'px',
              width: n.size.width + 'px',
            }"
            :is="nodeComps[n.value]"
            @mousedown="(e) => handleDrag(e, n)"
          />
          <div>{{ n.name }}</div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { NodeGroupList } from '../constants';
  // import { SoRegister } from '../utils/register';
  import { useNodeRegister } from '../hooks/useNodeRegister';
  import { useSOInstance } from '../hooks/useSOInstance';
  // import {} from '../types'

  const { dndNodes: nodes } = useNodeRegister();
  const { drag } = useSOInstance();

  const filterNodeGroupList = ref(NodeGroupList.filter((item) => item.show));

  const activeKey = ref<string[]>(filterNodeGroupList.value.map((item) => item.name));

  const nodeComps = {};
  for (const path in nodes) {
    // const name = nodes[path].default.name;
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    nodeComps[name] = nodes[path].default;
  }

  // onMounted(()=>{
  //   activeKey.value =
  // })

  // const soInstance = inject('soInstance') as Ref<SoRegister>;

  const handleDrag = (e: MouseEvent, n) => {
    drag(e, n);
  };
</script>

<style lang="less" scoped>
  .dnd {
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
        // padding-left: 0px;
        // padding-right: 0px;
      }
    }
  }
</style>
../hooks/useSOInstance
