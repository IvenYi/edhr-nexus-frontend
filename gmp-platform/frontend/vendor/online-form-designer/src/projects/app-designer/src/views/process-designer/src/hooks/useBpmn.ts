import { ref, unref } from 'vue';
import LogicFlow from '@logicflow/core';
import { BpmnElement, BPMNAdapter } from '../extension';
import { Menu } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
import {
  BpmnElementEnum,
  InitializeOptions,
  TaskMode,
  GlobalSetting,
  BpmnNode,
  UserType,
} from '../types';
import { PropertySchema, UserTypeService, ApprovalRules, ElementViewSchema } from '../constants';
import { getProcessInfo } from '/@/apis/gct-apaas/ProcessController';
import type {
  ProcessResponse,
  ProcessVersionResponse,
  ProcessVersionRequest,
} from '/@/apis/gct-apaas/model';
import {
  postProcessVersion,
  putProcessVersionDeploy,
  getProcessVersionList,
  getProcessVersionInfo,
} from '/@/apis/gct-apaas/ProcessVersionController';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { useRoute } from 'vue-router';
import { cloneDeep } from 'lodash-es';
import { getDefault } from '../utils/getDefault';
import { useRules } from './useRules';
import { BpmnValidator } from '../utils/validator';
import { getCamudaFieldsString } from '../utils/getCamudaFields';

const { createMessage } = useMessage();
const { setRules } = useRules();
const { t } = useI18n();

const processId = ref('');
const processResponse = ref<ProcessResponse>({});
const processVersionList = ref<ProcessVersionResponse[]>([]);
const processVersionInfo = ref<ProcessVersionResponse>({});

const DEFAULT_GLOABL_DATA: GlobalSetting = {
  rules: {},
  graphData: getDefault(),
  // graphData: {},
  formTodo: '',
  formView: '',
  mobileFormTodo: '',
  mobileFormView: '',
};

/** LogicFlow实例 */
let lf: LogicFlow | null = null;
/** 全局设置开启 */
const globalSettingVisible = ref<boolean>(true);
/** 全局设置数据 */
const globalSettingDataObject = ref<GlobalSetting>(JSON.parse(JSON.stringify(DEFAULT_GLOABL_DATA)));
/** 当前任务节点 */
const currentElementId = ref<string>('');

export function useBpmn() {
  const route = useRoute();
  processId.value = route.params.id as string;

  async function loadProcess() {
    const res = await getProcessInfo({ id: unref(processId) });
    processResponse.value = res!;

    if (res?.activeId) {
      res?.activeId && loadVersionInfo(res?.activeId);
      loadVersionList();
    } else {
      await loadVersionList();
      const vid = processVersionList.value[0].id!;
      loadVersionInfo(vid);
      processResponse.value.activeId = vid;
    }
  }

  async function loadVersionList() {
    const res = await getProcessVersionList({ processId: unref(processId) });
    processVersionList.value = res!;
  }

  async function loadVersionInfo(vid: string) {
    getProcessVersionInfo({
      id: vid,
      includeXml: false,
    }).then((res) => {
      processVersionInfo.value = res!;
      const gSetting = JSON.parse(JSON.stringify(DEFAULT_GLOABL_DATA));
      try {
        if (res?.json) {
          const json = JSON.parse(res?.json);
          Object.assign(gSetting, json);
        }
      } catch (err) {
        console.warn('process json warning');
      }
      globalSettingDataObject.value = gSetting;
      setRules(gSetting.rules);
      lf?.renderRawData(gSetting.graphData);
    });
  }

  /**
   * 初始化lf
   * @param payload
   */
  function initialize(payload: InitializeOptions) {
    LogicFlow.use(BpmnElement);
    LogicFlow.use(Menu);

    lf = new LogicFlow({
      container: payload.container,
      grid: true,
      nodeTextEdit: false,
      edgeTextEdit: false,
      keyboard: {
        enabled: true,
        shortcuts: [
          {
            keys: ['cmd+c', 'ctrl+c', 'cmd+v', 'ctrl+v', 'cmd+z', 'ctrl+z', 'cmd+y', 'ctrl+y'],
            callback: () => {
              return;
            },
          },
          {
            keys: ['backspace', 'delete'],
            callback: () => {
              const elements = lf?.getSelectElements(true);
              if (elements?.edges.length > 0) {
                const edge = elements?.edges[0];
                const { sourceNodeId } = edge;
                const node = lf?.getNodeDataById(sourceNodeId);
                const {
                  properties: { _type_ },
                } = node;
                if (BpmnElementEnum.StartEvent === _type_) {
                  createMessage.warning('该连接线不能被删除');
                  return;
                }
                lf?.deleteEdge(edge.id);
              } else if (elements?.nodes.length > 0) {
                const node = elements?.nodes[0];
                const {
                  properties: { _type_ },
                } = node;
                if (
                  [
                    BpmnElementEnum.SubmitTask,
                    BpmnElementEnum.StartEvent,
                    BpmnElementEnum.EndEvent,
                  ].includes(_type_)
                ) {
                  createMessage.warning('该节点不能被删除');
                  return;
                }
                lf?.deleteNode(node.id);
              }
              lf?.clearSelectElements();
              currentElementId.value = '';
            },
          },
        ],
      },
    });

    lf.render();
    initListener();
    initContextMenu();
  }

  function initListener() {
    lf?.on('node:click,edge:click', (data) => {
      currentElementId.value = data.data.id;
      globalSettingVisible.value = false;
    });
    lf?.on('node:dnd-add', ({ data }) => {
      currentElementId.value = data.id;
      if ((data.properties._extends_ || data.properties._type_) === BpmnElementEnum.UserTask) {
        const { formTodo, formView, mobileFormTodo, mobileFormView } =
          globalSettingDataObject.value;
        setProperties(data.id, {
          formTodo,
          formView,
          mobileFormTodo,
          mobileFormView,
        });
      }
      globalSettingVisible.value = false;
    });
    lf?.on('node:delete', (data) => {
      currentElementId.value = '';
      const {
        id,
        properties: { _type_ },
      } = data;
      if (
        [BpmnElementEnum.ApprovalCateway, BpmnElementEnum.ExclusiveGateway].includes(_type_) &&
        globalSettingDataObject.value.rules &&
        globalSettingDataObject.value.rules[id]
      ) {
        globalSettingDataObject.value.rules[id] = undefined;
      }
    });

    lf?.on('connection:not-allowed', ({ msg }) => {
      createMessage.warn(msg);
    });
  }

  function initContextMenu() {
    lf?.extension.menu.setMenuConfig({
      nodeMenu: [
        {
          text: '删除',
          callback(node) {
            lf?.deleteNode(node.id);
          },
        },
      ], // 覆盖默认的节点右键菜单
      edgeMenu: [
        {
          text: '删除',
          callback(edge) {
            lf?.deleteEdge(edge.id);
          },
        },
      ], // 删除默认的边右键菜单
      graphMenu: [], // 覆盖默认的边右键菜单，与false表现一样
    });
  }

  function startDrag(n: BpmnElementEnum) {
    const extendsFrom = PropertySchema[n]?._extends_;
    const properties = {
      _type_: n,
      ...PropertySchema[n],
      title: ElementViewSchema[n]?.name,
    };
    lf?.dnd.startDrag({
      type: `bpmn:${extendsFrom || n}`,
      text: ElementViewSchema[n]?.name,
      properties,
    });
  }

  function toXml() {
    const rawData = cloneDeep(lf?.getGraphRawData());
    let hasError = false;
    try {
      rawData?.nodes.forEach((item) => {
        const validateFn = BpmnValidator[item.properties!._type_ as string];
        validateFn &&
          validateFn({
            data: item,
            globaSetting: globalSettingDataObject.value,
            lf,
          });
        const { _type_ } = item.properties as any;
        if ([BpmnElementEnum.UserTask, BpmnElementEnum.ApprovalTask].includes(_type_)) {
          Object.assign(item.properties, {
            '-camunda:assignee': '${assignee}',
          });
        } else if (_type_ === BpmnElementEnum.BusinessTask) {
          const { service } = item.properties as unknown as BpmnNode.BusinessTask;
          Object.assign(item.properties, {
            '-camunda:expression': "${activityTaskExecutor.executeJs(execution,'" + service + "')}",
          });
        }
      });
      rawData?.edges.forEach((item) => {
        const validateFn = BpmnValidator[BpmnElementEnum.SequenceFlow];
        validateFn &&
          validateFn({
            data: item,
            globaSetting: globalSettingDataObject.value,
            lf: lf!,
          });
      });
    } catch (err) {
      console.warn(err.message);
      createMessage.warning(err.message);
      hasError = true;
    }

    if (hasError) return;

    const xml = new BPMNAdapter({
      lf,
      pid: processResponse.value.key + '_' + processVersionInfo.value.version,
      extensionString: getCamudaFieldsString(globalSettingDataObject.value),
      props: {
        excludeFields: {
          out: [
            'properties._type_',
            'properties._extends_',
            'properties.title',
            'properties.taskMode',
            'properties.juel',
            'properties.userType',
            'properties.userTypeValue',
            'properties.rollbackRule',
            'properties.service',
            'properties.rule',
            'properties.formTodo',
            'properties.formView',
            'properties.mobileFormTodo',
            'properties.mobileFormView',
            'properties.description',
          ],
        },
        transformer: {
          'bpmn:userTask': {
            out(data: any) {
              const {
                properties: {
                  _type_,
                  taskMode,
                  userType,
                  userTypeValue,
                  juel,
                  rollbackRule,
                  formTodo,
                  formView,
                  mobileFormTodo,
                  mobileFormView,
                },
              } = data;

              const result: any = {};
              if (_type_ !== BpmnElementEnum.SubmitTask) {
                result.json =
                  `<bpmn:multiInstanceLoopCharacteristics isSequential="${
                    taskMode === TaskMode.Sequential
                  }" camunda:collection="` +
                  '${assigneeService.' +
                  UserTypeService[userType as UserType].function +
                  `(${UserTypeService[userType].execution ? 'execution,' : ''}'` +
                  userTypeValue +
                  `')` +
                  '}' +
                  `" camunda:elementVariable="assignee">
                <bpmn:completionCondition>${juel}</bpmn:completionCondition>
                </bpmn:multiInstanceLoopCharacteristics>`;
              }
              const camundaFields: { name: string; value: string }[] = [];

              if (_type_ === BpmnElementEnum.ApprovalTask) {
                camundaFields.push({
                  name: 'ROLLBACK_RULE',
                  value: rollbackRule,
                });
              }
              let fieldStr = getCamudaFieldsString({
                formTodo,
                formView,
                mobileFormTodo,
                mobileFormView,
              });
              if (camundaFields.length > 0) {
                fieldStr += camundaFields
                  .filter((item) => item.value)
                  .map((item) => {
                    return `<camunda:field name="${item.name}" stringValue="${item.value}"/>`;
                  })
                  .join('\n');
              }
              result['f_json'] = `<bpmn:extensionElements>\n${fieldStr}\n</bpmn:extensionElements>`;
              // console.log(result);
              return result;
            },
          },
          'bpmn:sequenceFlow': {
            out(data: any) {
              const {
                sourceNodeId,
                properties: { rule },
              } = data;

              if (!rule) {
                return {
                  json: '',
                };
              }
              // 审批网关连接线
              const approvalRule = ApprovalRules.find((item) => item.id === rule);
              if (approvalRule) {
                return {
                  json:
                    `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${ __approve_status_in_biz__ == '` +
                    approvalRule.value +
                    `'}]]></bpmn:conditionExpression>`,
                };
              }
              // 排他网关连接线
              const rules = globalSettingDataObject.value.rules[sourceNodeId];
              const ruleObj = rules.find((r) => r.id === rule);
              if (ruleObj) {
                return {
                  json:
                    `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${activityTaskExecutor.executeSfExp(execution,'` +
                    ruleObj.expr +
                    `')}]]></bpmn:conditionExpression>`,
                };
              }

              return {
                json: '',
              };
            },
          },
        },
      },
    }).adapterXmlOut(rawData);
    console.log(xml);
    return xml;
  }

  function getData(id: string) {
    return lf?.graphModel.getElement(id).getData();
  }
  function getProperties(id: string) {
    return lf?.graphModel.getElement(id).getProperties();
  }
  function setProperties(id: string, data: object) {
    lf?.graphModel.getElement(id).setProperties(data);
  }
  function updateText(id: string, text: string) {
    lf?.graphModel.getElement(id).updateText(text);
    lf?.graphModel.getElement(id).setProperties({
      title: text,
    });
  }

  async function changeVersion(vid: string) {
    processResponse.value.activeId = vid;
    const version = processVersionList.value.find((item) => item.id === vid);
    if (!version) {
      await loadVersionList();
    }
    loadVersionInfo(vid);
  }

  function save(active?: number) {
    const graphData = lf?.getGraphRawData();
    const xml = toXml();
    if (!xml) return;

    putProcessVersionDeploy({
      id: processVersionInfo.value.id,
      json: JSON.stringify({
        ...globalSettingDataObject.value,
        graphData,
      }),
      xml,
      active: active !== undefined ? active : undefined,
    }).then(() => {
      loadVersionList();
      createMessage.success(t('sys.operationSuccess'));
    });
  }

  function saveAs(data: ProcessVersionRequest) {
    postProcessVersion(data).then((vid) => {
      createMessage.success(t('sys.operationSuccess'));
      vid && changeVersion(vid);
    });
  }

  function setGlobalSettingVisible(value: boolean) {
    if (!value && !currentElementId.value) return;
    globalSettingVisible.value = value;
  }

  function getNodeOutgoingEdge(id: string) {
    return lf?.graphModel.getNodeOutgoingEdge(id);
  }

  return {
    loadProcess,
    processResponse,
    processVersionList,
    processVersionInfo,

    loadVersionInfo,
    changeVersion,

    save,
    saveAs,

    initialize,
    startDrag,

    toXml,

    currentElementId,

    globalSettingVisible,
    setGlobalSettingVisible,
    globalSettingDataObject,

    getData,
    getProperties,
    setProperties,
    updateText,

    getNodeOutgoingEdge,
  };
}
