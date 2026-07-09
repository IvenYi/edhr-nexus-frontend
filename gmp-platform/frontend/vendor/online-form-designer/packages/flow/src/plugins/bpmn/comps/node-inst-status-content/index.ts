import { defineAsyncComponent } from 'vue';

const modules: any = import.meta.glob('./*.vue');
const componentMap = Object.keys(modules).reduce((obj, path) => {
  const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
  obj[name] = defineAsyncComponent(modules[path]);
  return obj;
}, {});

export default componentMap;
