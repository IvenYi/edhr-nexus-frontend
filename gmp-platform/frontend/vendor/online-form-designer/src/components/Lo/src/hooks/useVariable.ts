import { computed } from 'vue';
import { useGlobal } from '/@page-designer/hooks/useGlobal';
import { useLo } from './useLo';

const { gVar } = useGlobal();
const { loDataObject } = useLo();

export function useVariable() {
  const variablesForGet = computed(() => {
    return [
      {
        key: 'parameter_variable',
        name: '参数变量',
        children: loDataObject.value.parameter?.map((item) => {
          return {
            key: item,
          };
        }),
      },
      {
        key: 'local_variable',
        name: '局部变量',
        children: loDataObject.value.variables.map((item) => {
          return {
            key: item.name,
          };
        }),
      },
      {
        key: 'global_variable',
        name: '全局变量',
        children: gVar.value,
      },
    ].filter((item) => item.children.length > 0);
  });
  return {
    gVar,
    variablesForGet,
  };
}
