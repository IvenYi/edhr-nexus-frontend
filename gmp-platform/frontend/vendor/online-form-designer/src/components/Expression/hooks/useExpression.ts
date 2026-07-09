import { ref, computed, createApp, App, ComponentPublicInstance } from 'vue';
import {
  ExpressionInterface,
  ExpressionModeEnum,
  IdentifiersInterface,
  ExpressionTabEnum,
  IdentifierItemInterface,
  ReturnTypeEnum,
  OperatorTypeEnum,
} from '../types/index';
import Modal from '../views/modal.vue';
import { calc, identify as exprIdentify } from '../utils/expression';
import { useVariable } from './useVariable';
import { ModeTabMap, ReturnTypeMaps } from '../constant/modeCfg';
import { functionGroup, ipaasBackFunctionGroup, biBackFunctionGroup } from '../constant/function';
import { fnFilter } from '../utils/fnFilter';
import { nodeTransfer } from '../utils/nodeTransfer';
import { cloneDeep } from 'lodash-es';
import { getOperatorList } from '../constant/BuiltOperators';
import { registerGlobComp } from '../../registerGlobComp';

const { varList, getVarList } = useVariable();

let app: App | null = null;
let instance: any | null = null;
const exprOptions = ref<ExpressionInterface>();
const exprSyncFn = ref<[Function | undefined, Function | undefined]>([undefined, undefined]);
const containerId = ref<string>('');
const exprTabs = computed(() => {
  return ModeTabMap[exprOptions.value?.mode as ExpressionModeEnum] ?? [];
});

const returnTypeOptions = computed(() => {
  return ReturnTypeMaps[exprOptions.value?.mode as ExpressionModeEnum] ?? ReturnTypeEnum;
});

const globalIdentifiersTyped = computed<IdentifiersInterface>(() => {
  const { mode, identifiers } = exprOptions.value || {};
  const fnGroup =
    mode === ExpressionModeEnum.IPAAS_BACK
      ? ipaasBackFunctionGroup
      : mode === ExpressionModeEnum.BI_FORMULA || mode === ExpressionModeEnum.DATA_SET_FORMULA
        ? biBackFunctionGroup
        : functionGroup;
  const typed = {};
  exprTabs.value.forEach((tab) => {
    if (tab === ExpressionTabEnum.FUNCTION) {
      typed[tab] = nodeTransfer(fnFilter(fnGroup, mode!) ?? fnGroup, tab);
    } else {
      const data = identifiers?.[tab];
      if (!Array.isArray(data)) {
        typed[tab] = [];
        console.warn(`Tab[${tab}]中不包含对应数据信息`);
      } else {
        typed[tab] = nodeTransfer(data, tab);
      }
    }
  });
  return typed;
});

const globalIdentifiersArr = computed<IdentifierItemInterface[]>(() => {
  const flatData: IdentifierItemInterface[] = [];
  const deepSet = (item) => {
    flatData.push(item);
    if (item.children) {
      item.children.forEach((child) => deepSet(child));
    }
  };
  Object.keys(globalIdentifiersTyped.value).forEach((key) => {
    const groups = globalIdentifiersTyped.value[key];
    groups.forEach((level0) => {
      deepSet(level0);
    });
  });
  return flatData;
});

const globalIdentifiersMapById = computed<Record<string, IdentifierItemInterface>>(() => {
  return globalIdentifiersArr.value.reduce((map, item) => {
    map[item._id_!] = item;
    return map;
  }, {});
});

const globalIdentifiersMapByName = computed<Record<string, IdentifierItemInterface>>(() => {
  return globalIdentifiersArr.value.reduce((map, item) => {
    if (!item?.children) {
      map[item._name_!] = item;
    }
    return map;
  }, {});
});

export function useExpression(loadVars = true) {
  loadVars && getVarList();
  /**
   * 打开弹窗
   * @param options
   */
  async function openModal(options: ExpressionInterface): Promise<[string, string]> {
    // await getVarList();
    return new Promise((resolve, reject) => {
      exprOptions.value = options;
      // 仅undefined的时候初始化
      exprOptions.value.identifiers[ExpressionTabEnum.VARIABLE] === undefined &&
        (exprOptions.value.identifiers[ExpressionTabEnum.VARIABLE] = varList.value);
      if (
        exprOptions.value.mode === ExpressionModeEnum.BI_FORMULA ||
        exprOptions.value.mode === ExpressionModeEnum.DATA_SET_FORMULA
      ) {
        exprOptions.value.identifiers[ExpressionTabEnum.OPERATOR] = getOperatorList().filter(
          (i) => i.id === OperatorTypeEnum.ARITHMETIC,
        );
      } else {
        exprOptions.value.identifiers[ExpressionTabEnum.OPERATOR] = getOperatorList();
      }
      exprSyncFn.value = [resolve, reject];

      const propsData: Partial<ExpressionInterface> = {};
      const container = document.createElement('div');
      container.id = `expression-${Math.random().toString(16).substring(2)}`;
      containerId.value = container.id;
      if (!app) {
        // instance = createVNode(Modal, propsData);
        // render(instance, container);
        document.body.appendChild(container);
        app = createApp(Modal, propsData);
        registerGlobComp(app);
        instance = app.mount(container);
      }
      instance!.open(options);
    });
  }

  async function openIframe(options: ExpressionInterface) {
    exprOptions.value = cloneDeep(options);
  }

  async function updateOpts(options: ExpressionInterface) {
    exprOptions.value = cloneDeep(options);
  }

  /**
   * 计算
   * @param {string} expr 表达式
   * @param {object} values 参数
   * @returns
   */
  async function calculate(expr: string, values: Record<string, any>) {
    return await calc(expr, values);
  }

  /**
   * 变量识别
   * @param expr
   * @returns {Array}
   */
  function identify(expr: string) {
    return exprIdentify(expr);
  }

  function destory() {
    document.querySelector(`#${containerId.value}`)!.remove();
    if (app) {
      app.unmount();
      app = null;
      instance = null;
    }
  }

  return {
    exprOptions,
    exprSyncFn,
    containerId,
    updateOpts,
    openModal,
    openIframe,
    calculate,
    identify,
    destory,
    exprTabs,
    globalIdentifiersTyped,
    globalIdentifiersArr,
    globalIdentifiersMapById,
    globalIdentifiersMapByName,
    returnTypeOptions,
  };
}
