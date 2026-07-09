import { ref, unref, watch } from 'vue';
import {
  PanelTypeEnum,
  RegisterOptionsInterface,
  NodeConfigInterface,
  VariableInterface,
  NodeTypeEnum,
} from '../types';
import { NodeConfigMap } from '../constants';
import { Graph, Shape } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Selection } from '@antv/x6-plugin-selection';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { controlSchema } from '../schema';
import { cloneDeep } from 'lodash-es';
import { useRoute } from 'vue-router';
import { validate } from '../utils/validate';
import { generate } from '../utils/generate';
import { getServiceOrchestrationInfo } from '/@/apis/gct-apaas/ServiceOrchestrationController';
import {
  postServiceOrchestrationVersion,
  getServiceOrchestrationVersionInfo,
  putServiceOrchestrationVersionById,
  getServiceOrchestrationVersionPageList,
} from '/@/apis/gct-apaas/ServiceOrchestrationVersionController';
import {
  getServiceOrchestrationVersionLogPageList,
  getServiceOrchestrationVersionLogInfo,
} from '/@/apis/gct-apaas/ServiceOrchestrationVersionLogController';
import {
  ServiceOrchestrationResponse,
  ServiceOrchestrationVersionResponse,
  ServiceOrchestrationVersionLogResponse,
} from '/@/apis/gct-apaas/model';
import { useEditorConsoleInner } from '/@/components/code-editor/useEditorConsole';
// import { randomUUID } from '/@/hooks/web/useUUid';
import { postJsEngineExecute } from '/@/apis/gct-apaas/JsEngineController';
import { ResponseEntityobject } from '/@/apis/gct-apaas/model/index';
import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';

const { cancelOccupy, setLockInfo, occupy, initOccupy, loadOccupyInfo } = useUserOccupy();
const { createMessage } = useMessage();
const { t } = useI18n();

export function useSO() {
  const route = useRoute();
  const { getInputValue, showConsolePanel, setConsoleResult } = useEditorConsoleInner();

  let options: Partial<RegisterOptionsInterface> = {};
  let graph: Graph | null = null;
  let dnd: Dnd | null = null;

  /** 当前属性面板 */
  const panel = ref<PanelTypeEnum>(PanelTypeEnum.BASIC_INFO);
  /** 当前控件 */
  const controlId = ref<string>('');

  const soId: string = route.params.soid as string;
  /** 详情 */
  const soResponse = ref<ServiceOrchestrationResponse>({});
  /** 版本信息 */
  const soVersion = ref<
    ServiceOrchestrationVersionResponse | ServiceOrchestrationResponse['orchestrationVersion']
  >({});

  /** 数据对象 */
  const soDataObject = ref<{
    controls: Record<string, object>;
    variables: VariableInterface[];
    graphJSON: object[];
  }>({
    controls: {}, // 控件信息
    variables: [], // 全局变量
    graphJSON: [], // 图表JSON
  });
  let tmp = 0;
  watch(
    soDataObject,
    () => {
      tmp && occupy();
      tmp++;
    },
    {
      deep: true,
    },
  );

  /** 历史记录 */
  const soHistoryList = ref<ServiceOrchestrationVersionLogResponse[]>([]);
  const soHistoryListVisible = ref<boolean>(false);
  /** 版本列表 */
  const soVersionList = ref<ServiceOrchestrationVersionResponse[]>([]);
  const pageNo = ref(1);
  const noMore = ref(false);
  const loading = ref(false);

  /**
   * 服务编排实例初始化
   * @param opts
   */
  function init(opts: RegisterOptionsInterface) {
    options = opts;
    graph = _initGraph();
    dnd = _initDnd();
    _initPlugin();
    _initListener();
  }

  /**
   * 生成控件唯一ID
   * @param shape
   * @returns
   */
  function _genUid(shape: string) {
    let uid = shape + '_' + Math.random().toString(36).substring(2, 10);
    if (soDataObject.value.controls[uid]) {
      uid = _genUid(shape);
    }
    return uid;
  }

  /**
   * 拖拽
   * @param e
   */
  function drag(e: MouseEvent, n: NodeConfigInterface) {
    console.log(n.value);
    const node = graph!.createNode({
      id: _genUid(n.value),
      shape: n.value,
      ports: {
        items: [
          {
            id: 'port_top',
            group: 'top',
          },
          {
            id: 'port_right',
            group: 'right',
          },
          {
            id: 'port_bottom',
            group: 'bottom',
          },
          {
            id: 'port_left',
            group: 'left',
          },
        ],
      },
      data: {
        inGraph: false,
      },
    });
    dnd!.start(node, e as any);
  }

  /** 初始化画布 */
  function _initGraph() {
    return new Graph({
      container: options.graphContainer,
      autoResize: true,
      panning: true,
      // highlighting: {
      //   magnetAdsorbed: {
      //     name: 'stroke',
      //     args: {
      //       attrs: {
      //         fill: '#fff',
      //         stroke: '#31d0c6',
      //         strokeWidth: 4,
      //       },
      //     },
      //   },
      // },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
        allowPort: true,
        allowMulti: false,
        validateMagnet({ cell }) {
          const { id, shape } = cell;
          // end节点无输出
          if (shape === NodeTypeEnum.END) {
            return false;
          }
          // 节点仅有一个输出
          if (this.getEdges().find((e: any) => e.source.cell === id)) {
            return false;
          }
          return true;
        },
        validateConnection({ sourceCell, targetCell }) {
          // 开始节点无输入
          if (targetCell?.shape === NodeTypeEnum.START) {
            return false;
          }
          // 不能连接自身
          if (sourceCell === targetCell) {
            return false;
          }
          const edges = this.getEdges();
          // 节点仅有一个输入
          if (edges.find((e: any) => e.target.cell === targetCell?.id)) {
            return false;
          }

          return true;
        },
      },
      grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#eee', // 主网格线颜色
            thickness: 1, // 主网格线宽度
          },
          {
            color: '#ddd', // 次网格线颜色
            thickness: 1, // 次网格线宽度
            factor: 4, // 主次网格线间隔
          },
        ],
      },
    });
  }

  /** dnd */
  function _initDnd() {
    return new Dnd({
      target: graph!,
      scaled: false,
      dndContainer: options.dndContainer,
      getDragNode: (node) => node.clone({ keepId: true }),
      getDropNode: (node) => node.clone({ keepId: true }),
    });
  }

  /** plugin */
  function _initPlugin() {
    graph!.use(
      new Snapline({
        enabled: true,
        sharp: true,
      }),
    );
    graph!.use(new Keyboard());
    graph!.use(
      new Selection({
        enabled: true,
        multiple: false,
        showNodeSelectionBox: true,
        filter: (that: Graph) => {
          return !Object.values({ ...NodeTypeEnum }).includes(that?.id);
        },
      }),
    );
  }

  const _showPorts = (show: boolean) => {
    const ports = options.graphContainer!.querySelectorAll(
      '.x6-port-body',
    ) as NodeListOf<SVGElement>;
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
  };

  /**
   * 图表监听
   */
  function _initListener() {
    /**
     * 新增
     * 初始化id、节点名称
     */
    graph!.on('node:added', ({ node }) => {
      const { id, shape } = node;
      if (!node.data) {
        node.data = {};
      }
      node.data.inGraph = true;
      soDataObject.value.controls[id] = {
        ...cloneDeep(controlSchema[shape]),
        id,
        name: NodeConfigMap[shape].name,
      };
      controlId.value = id;
      panel.value = PanelTypeEnum.CONTROL_RPOPS;

      // graph?.resetSelection(id);
    });

    /**
     * 点击
     * 面板切换、控件切换
     */
    graph!.on('node:click', ({ node }) => {
      controlId.value = node.id;
      panel.value = PanelTypeEnum.CONTROL_RPOPS;
    });

    /** 连接桩显影 */
    graph!.on('node:mouseenter', () => {
      _showPorts(true);
    });
    graph!.on('node:mouseleave', () => {
      _showPorts(false);
    });

    // delete
    graph!.bindKey('backspace', () => {
      const cells = graph!.getSelectedCells();
      if (cells.length) {
        graph!.removeCells(cells);
      }
    });
  }

  /**
   * 切换属性面板
   * @param p
   */
  function setPanel(p: PanelTypeEnum = PanelTypeEnum.BASIC_INFO) {
    panel.value = p;
  }

  /**
   * 初始化开始结束节点
   * @returns
   */
  function _initSystemControl() {
    if (!graph) return;

    if (Object.keys(soDataObject.value.controls).length === 0) {
      graph.addNode({
        shape: NodeTypeEnum.START,
        id: NodeTypeEnum.START,
        x: 200,
        y: 200,
        ports: {
          items: [
            {
              id: 'port_top',
              group: 'top',
            },
            {
              id: 'port_right',
              group: 'right',
            },
            {
              id: 'port_bottom',
              group: 'bottom',
            },
            {
              id: 'port_left',
              group: 'left',
            },
          ],
        },
      });
      graph.addNode({
        id: NodeTypeEnum.END,
        shape: NodeTypeEnum.END,
        x: 400,
        y: 200,
        ports: {
          items: [
            {
              id: 'port_top',
              group: 'top',
            },
            {
              id: 'port_right',
              group: 'right',
            },
            {
              id: 'port_bottom',
              group: 'bottom',
            },
            {
              id: 'port_left',
              group: 'left',
            },
          ],
        },
      });
      const startControl = cloneDeep(controlSchema[NodeTypeEnum.START]);
      const endControl = cloneDeep(controlSchema[NodeTypeEnum.END]);

      soDataObject.value.controls[startControl.id] = startControl;
      soDataObject.value.controls[endControl.id] = endControl;
    }
  }

  //=============================================================================
  /**
   * 全局变量管理
   * @param data
   */
  function addVariable(data: VariableInterface) {
    soDataObject.value.variables.push(data);
  }
  function updateVariable(data: VariableInterface) {
    const index = soDataObject.value.variables.findIndex((item) => item.name === data.name);
    if (index < 0) return;
    soDataObject.value.variables.splice(index, 1, data);
  }
  function deleteVariable(data: VariableInterface) {
    soDataObject.value.variables = soDataObject.value.variables.filter(
      (item) => item.name !== data.name,
    );
  }
  //============================================================================

  /**
   * 加载详情
   */
  async function load() {
    // debugger;
    const res = await getServiceOrchestrationInfo({
      id: soId,
    });
    soResponse.value = res!;
    soVersion.value = res?.orchestrationVersion;
    soDataObject.value = {
      controls: {},
      variables: [],
      graphJSON: [],
      ...JSON.parse(res?.orchestrationVersion?.dataJson || '{}'),
    };

    initOccupy({
      id: unref(soId),
      type: ScriptTypeEnum.ORCHESTRATION,
    });
    loadOccupyInfo();
    setLockInfo({
      id: res?.lockUserId,
      name: res?.lockUserName,
    });

    // console.log(soDataObject.value.graphJSON);
    graph?.fromJSON(soDataObject.value.graphJSON);

    _initSystemControl();

    loadSoVersionList();
    loadSoHistoryList();
  }

  /**
   * 加载版本列表
   */
  async function loadSoVersionList() {
    const { soKey } = soVersion.value!;
    const res = await getServiceOrchestrationVersionPageList({
      soKey,
      pageNo: 1,
      pageSize: 9999,
    });
    soVersionList.value = res!.data;
  }

  /**
   * 获取版本信息
   * @param id
   * @returns
   */
  async function loadSoVersionInfo(id: string) {
    return getServiceOrchestrationVersionInfo({
      id,
    });
  }

  function beforeLoadSoHistoryList() {
    noMore.value = false;
    pageNo.value = 1;
  };

  /**
   * 加载当前版本历史列表
   */
  async function loadSoHistoryList(hasPrev = true) {
    if (hasPrev) {
      beforeLoadSoHistoryList();
    }
    if (loading.value || noMore.value) return; // 避免重复请求
    // scriptHistoryList.value = [];
    loading.value = true;
    const { id } = soVersion.value!;
     try {
      const res = await getServiceOrchestrationVersionLogPageList({
        soVersionId: id,
        pageNo: pageNo.value ?? 1,
        pageSize: 50,
      });
      if (res) {
        if (pageNo.value === 1) {
          soHistoryList.value = res.data || [];
        } else {
          soHistoryList.value = [...soHistoryList.value, ...(res.data || [])];
        }
        // 判断是否有更多数据
        if (soHistoryList.value?.length >= res.totalCount || soHistoryList.value?.length >= 1000) {
          noMore.value = true;
        } else {
          pageNo.value += 1; // 页码+1
        }
      }
      // soHistoryList.value = res!.data;
    } catch(err) {
       console.error('数据加载失败：', err)
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取版本历史片段信息
   * @param id
   * @returns
   */
  async function loadSoHistoryInfo(id: string) {
    return getServiceOrchestrationVersionLogInfo({
      id,
    });
  }

  /**
   * 保存
   * @param active 是否激活
   */
  async function _save(active?: number) {
    const dataObject = {
      ...soDataObject.value,
      graphJSON: graph?.toJSON(),
    };
    validate(dataObject);
    const content = generate(dataObject);
    const soDataJson = JSON.stringify(dataObject);
    const { id, soKey, version, active: oldActive } = soVersion.value!;
    await putServiceOrchestrationVersionById(
      { id: id! },
      {
        active: active ?? Number(oldActive),
        content,
        dataJson: soDataJson,
        soKey,
        version,
        newLogId: (soHistoryList.value[0] ?? {}).id,
      },
    );
    createMessage.success(t('sys.operationSuccess'));
    cancelOccupy();
    loadSoHistoryList();
  }

  /**
   * 保存
   */
  async function save() {
    await _save();
  }
  /**
   * 保存并激活
   */
  async function saveAndActivate() {
    await _save(1);
  }

  /**
   * 另存为新版本
   * @param {string} version 版本号
   */
  async function saveAs(version: string) {
    const { soKey } = soVersion.value!;
    const dataObject = {
      ...soDataObject.value,
      graphJSON: graph?.toJSON(),
    };
    validate(dataObject);
    const content = generate(dataObject);
    const soDataJson = JSON.stringify(dataObject);
    const vid = await postServiceOrchestrationVersion({
      active: 0,
      content,
      version,
      soKey,
      dataJson: soDataJson,
    });
    changeVersion(vid!);
  }

  /**
   * 切换版本
   * @param {string} vid 版本id
   */
  async function changeVersion(vid: string) {
    // debugger;
    if (!vid) return;
    const version = soVersionList.value.find((item) => item.id === vid);
    if (!version) {
      await loadSoVersionList();
    }
    const res = await loadSoVersionInfo(vid);
    soVersion.value = res!;
    soDataObject.value = {
      controls: {},
      variables: [],
      graphJSON: [],
      ...JSON.parse(res?.dataJson || '{}'),
    };

    graph?.fromJSON(soDataObject.value.graphJSON);

    // 切换版本以后需要更新版本历史列表
    loadSoHistoryList();
  }

  /**
   * 设置历史可见
   * @param {boolean} visible
   */
  function setSoHistoryListVisible(visible: boolean) {
    soHistoryListVisible.value = visible;
  }

  /**
   * 代码执行
   */
  async function execute(params) {
    const dataObject = {
      ...soDataObject.value,
      graphJSON: graph?.toJSON(),
    };
    validate(dataObject);
    const code = generate(dataObject);
    const input = await getInputValue().catch(() => {
      showConsolePanel();
    });
    const values: object = JSON.parse(input);
    const res = (await postJsEngineExecute(
      {
        code,
        values,
        ...params,
      },
      {
        isTransformResponse: false,
      },
    )) as ResponseEntityobject;

    showConsolePanel();
    setConsoleResult(res);
  }

  function removeNode(nodeId: string) {
    graph?.unselect(nodeId);
    graph?.removeCell(nodeId);
    _showPorts(false);
    soDataObject.value.controls[nodeId] === undefined;
    controlId.value = '';
  }

  return {
    soId,

    init,
    drag,
    panel,
    setPanel,
    controlId,

    addVariable,
    updateVariable,
    deleteVariable,

    soVersion,
    soVersionList,
    soResponse,
    soDataObject,
    loading,

    loadSoHistoryInfo,
    loadSoHistoryList,
    soHistoryList,
    soHistoryListVisible,
    setSoHistoryListVisible,

    changeVersion,

    load,
    save,
    saveAs,
    saveAndActivate,

    execute,

    removeNode,
  };
}
