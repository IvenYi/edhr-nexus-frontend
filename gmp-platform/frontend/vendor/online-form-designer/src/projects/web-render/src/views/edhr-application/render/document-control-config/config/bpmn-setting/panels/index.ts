import { defineAsyncComponent } from 'vue';

const NodeProps: any = import.meta.glob('./**/prop.vue');
const DynamicPropMap = Object.keys(NodeProps).reduce((map, path) => {
  const name = path.split('/').slice(-2, -1)[0];
  map[name] = defineAsyncComponent(NodeProps[path]);
  return map;
}, {});

const NodePerms: any = import.meta.glob('./**/perm.vue');
const DynamicPermMap = Object.keys(NodePerms).reduce((map, path) => {
  const name = path.split('/').slice(-2, -1)[0];
  map[name] = defineAsyncComponent(NodePerms[path]);
  return map;
}, {});

const NodeEvents: any = import.meta.glob('./**/event.vue');
const DynamicEventMap = Object.keys(NodeEvents).reduce((map, path) => {
  const name = path.split('/').slice(-2, -1)[0];
  map[name] = defineAsyncComponent(NodeEvents[path]);
  return map;
}, {});

export { DynamicPropMap, DynamicPermMap, DynamicEventMap };
