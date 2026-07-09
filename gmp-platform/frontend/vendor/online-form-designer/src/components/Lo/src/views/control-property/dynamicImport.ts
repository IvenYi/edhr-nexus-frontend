import { defineAsyncComponent } from 'vue';

const modules: any = import.meta.glob('./modules/*.vue');
console.log(modules);
const panels = Object.keys(modules).reduce((map, path) => {
  const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
  map[name] = defineAsyncComponent(modules[path]);
  // console.log(map[name]);
  return map;
}, {});

console.log('import.ts');
console.log(panels);

export default panels;
