import { ref, computed } from 'vue';
import { IdentifierGroupInterface, IdentifierItemInterface, VarTypeEnum } from '../types/index';
import { getSystemVarList } from '/@/apis/gct-apaas/SystemVarController';
import { innerVarList } from '../constant/variable';
import { useGlobal } from '/@page-designer/hooks/useGlobal';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

const systemVarList = ref<IdentifierItemInterface[]>([]);
const globalVarList = ref<IdentifierItemInterface[]>([]);
const systemVarListLoaded = ref<boolean>(false);
const globalVarListLoaded = ref<boolean>(false);
const { gVar, queryGVar } = useGlobal();
const { pageJson } = useDesigner();

const pageVarList = computed<IdentifierGroupInterface[]>(() => {
  return (
    pageJson?.pageVars?.map((item) => {
      return {
        id: item.key,
        name: item.key,
        valueType: item.varInfo.type,
        desc: item.varInfo.description,
      };
    }) || []
  );
});

const varList = computed<IdentifierGroupInterface[]>(() => {
  return [
    {
      id: VarTypeEnum.INNER_VAR,
      name: $t('sys.pageDesigner.innerVariable'),
      children: innerVarList,
      idToChildren: false,
    },
    {
      id: VarTypeEnum.SYSTEM_VAR,
      name: $t('sys.pageDesigner.systemVariable'),
      children: systemVarList.value,
      idToChildren: false,
    },
    {
      id: VarTypeEnum.GLOBAL_VAR,
      name: $t('sys.pageDesigner.globalVariable'),
      children: globalVarList.value,
      idToChildren: false,
    },
    {
      id: VarTypeEnum.PAGE_VAR,
      name: $t('sys.pageDesigner.pageVariable'),
      children: pageVarList.value,
      idToChildren: false,
    },
  ];
});

export function useVariable() {
  async function _loadSystemVarList() {
    const res = await getSystemVarList();
    systemVarListLoaded.value = true;
    systemVarList.value = (res ?? []).map((item) => {
      return {
        id: item.key,
        name: item.key,
        valueType: 'string',
        desc:
          `$t('sys.appDesigner.developEnv')：${item.devValue}\n` +
          `$t('sys.appDesigner.testEnv')：${item.testValue}\n` +
          `$t('sys.appDesigner.productionEnv')：${item.prodValue}\n` +
          `$t('sys.description')：${item.description}`,
      };
    }) as IdentifierItemInterface[];
  }

  async function _loadGlobalVarList() {
    await queryGVar();
    globalVarListLoaded.value = true;
    globalVarList.value = gVar.value.map((item) => {
      return {
        id: item.key,
        name: item.key,
        valueType: item.varInfo.type,
        desc: item.varInfo.description,
      };
    });
  }

  async function getVarList() {
    if (!systemVarListLoaded.value) {
      await _loadSystemVarList();
    }

    await _loadGlobalVarList();

    return varList;
  }

  return {
    varList,
    getVarList,
  };
}
