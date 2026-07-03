import { ref, inject } from 'vue';
import {
  PanelTypeEnum,
  RegisterOptionsInterface,
  VariableInterface,
  SystemEnum,
  WidgetEnum,
  ToolkitEnum,
  LoDataObject,
} from '../types';
import { Graph, Shape } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
// import { NodeConfigMap } from '../constants';
import { cloneDeep, omit } from 'lodash-es';
import { controlSchema } from '../schema';
import { validate } from '../utils/validate';
import { generate } from '../utils/generate';

let options: Partial<RegisterOptionsInterface> = {};
let graph: Graph | null = null;
let dnd: Dnd | null = null;

const DEFAULT_LO_DATA: LoDataObject = {
  name: '',
  title: '',
  controls: {},
  parameter: [],
  variables: [],
  graphJSON: {},
  runtimeJs: '',
  createBy: '',
  createTime: '',
  modifyBy: '',
  modifyTime: '',
  bindTo: [],
};

/** 数据对象 */
const loDataObject = ref<LoDataObject>(cloneDeep(DEFAULT_LO_DATA));
/** 当前属性面板 */
const panel = ref<PanelTypeEnum>(PanelTypeEnum.Basic);
/** 当前控件 */
const controlId = ref<string>('');

export function useLo() {
  const drawerCloseCallback = inject('drawerCloseCallback') as Function;

  /**
   * 更新图表
   * @returns
   */
  function _graphRender() {
    if (!graph) return;
    graph?.fromJSON(loDataObject.value.graphJSON ?? {});
    _initSystemControl();
  }

  /**
   * 初始化开始结束节点
   * @returns
   */
  function _initSystemControl() {
    if (!graph) return;
    if (Object.keys(loDataObject.value.controls).length === 0) {
      graph.addNode({
        shape: SystemEnum.Start,
        id: SystemEnum.Start,
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
        id: SystemEnum.End,
        shape: SystemEnum.End,
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
      const startControl = cloneDeep(controlSchema[SystemEnum.Start]);
      const endControl = cloneDeep(controlSchema[SystemEnum.End]);
      loDataObject.value.controls[startControl.id] = startControl;
      loDataObject.value.controls[endControl.id] = endControl;
    }
  }

  /**
   * 设置主数据
   * @param data  主数据
   * @param graphUpdate  是否需要更新图表 用于初始化编排
   */
  function setLoData(data, graphUpdate = false) {
    try {
      loDataObject.value = Object.assign({}, cloneDeep(DEFAULT_LO_DATA), data ?? {});
      graphUpdate && _graphRender();
    } catch (error) {
      console.warn(error);
    }
  }

  /**
   * 编排图表初始化
   * @param opts
   */
  function registerLoEditor(opts: RegisterOptionsInterface) {
    options = opts;
    graph = _initGraph();
    _graphRender();
    dnd = _initDnd();
    _initPlugin();
    _initListener();
  }

  /** 初始化画布 */
  function _initGraph() {
    return new Graph({
      // 画布的容器
      container: options.graphContainer,
      // 是否监听容器大小改变，并自动更新画布大小
      autoResize: true,
      // 画布是否可以拖拽平移
      panning: true,
      // 连线选项
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
        // 自定义连接线样式
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
        allowBlank: false, // 是否允许连接到画布空白位置的点
        allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点
        allowNode: false, // 是否允许边连接到节点（非节点上的连接桩）
        allowEdge: false, // 是否允许边链接到另一个边
        allowPort: true, // 是否允许边链接到连接桩
        allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
        validateMagnet({ cell }) {
          const { id, shape } = cell;
          // end节点无输出
          if (shape === SystemEnum.End) {
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
          if (targetCell?.shape === SystemEnum.Start) {
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
      // 网格
      grid: {
        visible: true,
        // 双线网状网格
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
          return !Object.values({ ...SystemEnum, ...WidgetEnum, ...ToolkitEnum }).includes(
            that?.id,
          );
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
      loDataObject.value.controls[id] = {
        ...omit(cloneDeep(controlSchema[shape]), ['size']),
        id,
        name: controlSchema[shape].title,
      };
      controlId.value = id;
      panel.value = PanelTypeEnum.Control;
      // graph?.resetSelection(id);
    });

    /**
     * 点击
     * 面板切换、控件切换
     */
    graph!.on('node:click', ({ node }) => {
      controlId.value = node.id;
      panel.value = PanelTypeEnum.Control;
    });

    /** 连接桩显影 */
    graph!.on('node:mouseenter', () => {
      _showPorts(true);
    });
    graph!.on('node:mouseleave', () => {
      _showPorts(false);
    });
    graph!.on('node:removed', ({ node }) => {
      /**各种删除交互走通用入口 */
      _showPorts(false);
      loDataObject.value.controls[node.id] = undefined;
      controlId.value = '';
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
  function setPanel(p: PanelTypeEnum = PanelTypeEnum.Basic) {
    panel.value = p;
  }

  /**
   * 生成控件唯一ID
   * @param shape
   * @returns
   */
  function _genUid(shape: string) {
    let uid = shape + '_' + Math.random().toString(36).substring(2, 10);
    if (loDataObject.value.controls[uid]) {
      uid = _genUid(shape);
    }
    return uid;
  }

  /**
   * 拖拽
   * @param e
   */
  function drag(e: MouseEvent, n: NodeConfigInterface) {
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

  /**
   * 保存
   */
  async function save() {
    loDataObject.value.graphJSON = graph?.toJSON() as any;
    validate(loDataObject.value);
    loDataObject.value.runtimeJs = generate(loDataObject.value);
    if (drawerCloseCallback && typeof drawerCloseCallback === 'function') {
      drawerCloseCallback(loDataObject.value);
    }
  }

  /**
   * 关闭
   */
  async function close() {
    if (drawerCloseCallback && typeof drawerCloseCallback === 'function') {
      drawerCloseCallback();
    }
  }

  //=============================================================================
  /**
   * 变量管理
   * @param data
   */
  function addVariable(data: VariableInterface) {
    loDataObject.value.variables.push(data);
  }
  function updateVariable(data: VariableInterface) {
    const index = loDataObject.value.variables.findIndex((item) => item.name === data.name);
    if (index < 0) return;
    loDataObject.value.variables.splice(index, 1, data);
  }
  function deleteVariable(data: VariableInterface) {
    loDataObject.value.variables = loDataObject.value.variables.filter(
      (item) => item.name !== data.name,
    );
  }
  //============================================================================
  function removeNode(nodeId: string) {
    graph?.removeCell(nodeId);
  }

  return {
    loDataObject,
    setLoData,
    registerLoEditor,

    panel,
    setPanel,

    drag,

    controlId,

    save,
    close,

    addVariable,
    updateVariable,
    deleteVariable,

    removeNode,
  };
}
