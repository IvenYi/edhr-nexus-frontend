import { ref } from 'vue';

const globalMethods = ref([]);

async function getGlobalMethods() {
  const res = await (await fetch('/global-methods.json')).json();
  globalMethods.value = res;
  return res;
}

// todo 构造成对应的数据结构
// todo 缓存结果
// todo 异常处理 404 浏览器缓存
// todo 类型定义
async function getGlobalMethodInfo(params: { id: string }): Promise<any> {
  const res = await (await fetch(`/global-methods/${params.id}.md`)).text();
  return {
    usage: res,
  };
}

export function useRemoteDoc() {
  return {
    getGlobalMethods,
    getGlobalMethodInfo,
  };
}
