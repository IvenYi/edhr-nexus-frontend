import { ref } from 'vue';
import { Graph } from '@antv/x6';
import { WorkflowNodeTypeEnum } from '../types';

const COLOR_RED = '#FF0606';
const COLOR_GREEN = '#0DAA9C';
const COLOR_ORANGE = '#FFB45D';

const COMMON_LABEL = {
  refX: 0.5,
  refY: '100%',
  refY2: 4,
  textAnchor: 'middle',
  textVerticalAnchor: 'top',
};

const NODE_SPEC = {
  inherit: 'rect',
  width: 56,
  height: 56,
  markup: [
    {
      tagName: 'rect', // 标签名称
      selector: 'body', // 选择器
    },
    {
      tagName: 'image',
      selector: 'img',
    },
    {
      tagName: 'text',
      selector: 'label',
    },
    {
      tagName: 'foreignObject',
      selector: 'status',
      children: [
        {
          tagName: 'div',
          selector: 'statusContent',
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          attrs: {
            class: 'status-container',
          },
        },
      ],
    },
  ],
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
    },
    img: {
      'xlink:href': '/assets/workflow-spec.png',
      width: 56,
      height: 56,
    },
    label: COMMON_LABEL,
    status: {
      width: 56,
      height: 56,
    },
  },
  ports: {
    groups: {
      [WorkflowNodeTypeEnum.PATH_MAIN]: {
        position: {
          name: 'right',
          args: { dy: -18 },
        },
        markup: [
          {
            tagName: 'circle', // 标签名称
            selector: 'body', // 选择器
          },
          {
            tagName: 'polyline',
            selector: 'line',
          },
        ],
        attrs: {
          body: {
            magnet: true,
            r: 8,
            stroke: COLOR_GREEN,
            fill: COLOR_GREEN,
            strokeWidth: 1,
          },
          line: {
            magnet: true,
            fill: 'transparent',
            stroke: '#ffffff',
            points: '-2 4, 2 0, -2 -4',
            strokeWidth: 2,
          },
        },
      },
      [WorkflowNodeTypeEnum.PATH_OPTIONAL]: {
        position: {
          name: 'right',
          args: { dy: 0 },
        },
        markup: [
          {
            tagName: 'circle', // 标签名称
            selector: 'body', // 选择器
          },
          {
            tagName: 'polyline',
            selector: 'line',
          },
        ],
        attrs: {
          body: {
            magnet: true,
            r: 8,
            stroke: COLOR_GREEN,
            fill: '#ffffff',
            strokeWidth: 1,
            strokeDasharray: 2,
          },
          line: {
            magnet: true,
            fill: 'transparent',
            stroke: COLOR_GREEN,
            points: '-2 4, 2 0, -2 -4',
            strokeWidth: 2,
          },
        },
      },
      [WorkflowNodeTypeEnum.PATH_PARALLEL]: {
        position: {
          name: 'right',
          args: { dy: 18 },
        },
        markup: [
          {
            tagName: 'circle', // 标签名称
            selector: 'body', // 选择器
          },
          {
            tagName: 'polyline',
            selector: 'line',
          },
        ],
        attrs: {
          body: {
            magnet: true,
            r: 8,
            stroke: COLOR_ORANGE,
            fill: '#ffffff',
            strokeWidth: 1,
            strokeDasharray: 2,
          },
          line: {
            magnet: true,
            fill: 'transparent',
            stroke: COLOR_ORANGE,
            points: '-2 4, 2 0, -2 -4',
            strokeWidth: 2,
          },
        },
      },
      [WorkflowNodeTypeEnum.PATH_BACK]: {
        position: {
          name: 'left',
        },
        markup: [
          {
            tagName: 'circle', // 标签名称
            selector: 'body', // 选择器
          },
          {
            tagName: 'polyline',
            selector: 'line',
          },
        ],
        attrs: {
          body: {
            magnet: true,
            r: 8,
            stroke: COLOR_RED,
            fill: '#ffffff',
            strokeWidth: 1,
            strokeDasharray: 2,
          },
          line: {
            magnet: true,
            fill: 'transparent',
            stroke: COLOR_RED,
            points: '2 -4, -2 0, 2 4',
            strokeWidth: 2,
          },
        },
      },
    },
    items: [
      { id: `${WorkflowNodeTypeEnum.PATH_MAIN}_1`, group: WorkflowNodeTypeEnum.PATH_MAIN },
      {
        id: `${WorkflowNodeTypeEnum.PATH_OPTIONAL}_1`,
        group: WorkflowNodeTypeEnum.PATH_OPTIONAL,
      },
      {
        id: `${WorkflowNodeTypeEnum.PATH_PARALLEL}_1`,
        group: WorkflowNodeTypeEnum.PATH_PARALLEL,
      },
      { id: `${WorkflowNodeTypeEnum.PATH_BACK}_1`, group: WorkflowNodeTypeEnum.PATH_BACK },
    ],
  },
};

const NODE_WORKFLOW = JSON.parse(JSON.stringify(NODE_SPEC));
NODE_WORKFLOW.attrs.img['xlink:href'] = '/assets/workflow-sub.png';

const registered = ref<boolean>(false);

export function useRegister() {
  /**
   * 注册工作流节点
   * @returns
   */
  function register() {
    if (registered.value === true) return;

    registered.value = true;

    // 分组
    Graph.registerNode(
      WorkflowNodeTypeEnum.NODE_GROUP,
      {
        inherit: 'rect',
        width: 120,
        height: 120,
        markup: [
          {
            tagName: 'rect', // 标签名称
            selector: 'body', // 选择器
          },
          {
            tagName: 'text',
            selector: 'label',
          },
        ],
        attrs: {
          body: {
            fill: '#ffffff',
            stroke: '#c4c4c4',
            strokeWidth: 1,
            strokeDasharray: 4,
            rx: 4,
            ry: 4,
          },
          label: COMMON_LABEL,
        },
        ports: {
          groups: {
            [WorkflowNodeTypeEnum.PATH_MAIN]: {
              position: {
                name: 'right',
                args: { dy: -20 },
              },
              markup: [
                {
                  tagName: 'circle', // 标签名称
                  selector: 'body', // 选择器
                },
                {
                  tagName: 'polyline',
                  selector: 'line',
                },
              ],
              attrs: {
                body: {
                  magnet: true,
                  r: 8,
                  stroke: '#0DAA9C',
                  fill: '#0DAA9C',
                  strokeWidth: 1,
                },
                line: {
                  magnet: true,
                  fill: 'transparent',
                  stroke: '#ffffff',
                  points: '-2 4, 2 0, -2 -4',
                  strokeWidth: 2,
                },
              },
            },
            [WorkflowNodeTypeEnum.PATH_OPTIONAL]: {
              position: {
                name: 'right',
                args: { dy: 20 },
              },
              markup: [
                {
                  tagName: 'circle', // 标签名称
                  selector: 'body', // 选择器
                },
                {
                  tagName: 'polyline',
                  selector: 'line',
                },
              ],
              attrs: {
                body: {
                  magnet: true,
                  r: 8,
                  stroke: COLOR_GREEN,
                  fill: '#ffffff',
                  strokeWidth: 1,
                  strokeDasharray: 2,
                },
                line: {
                  magnet: true,
                  fill: 'transparent',
                  stroke: COLOR_GREEN,
                  points: '-2 4, 2 0, -2 -4',
                  strokeWidth: 2,
                },
              },
            },
          },
          items: [
            { id: `${WorkflowNodeTypeEnum.PATH_MAIN}_1`, group: WorkflowNodeTypeEnum.PATH_MAIN },
            {
              id: `${WorkflowNodeTypeEnum.PATH_OPTIONAL}_1`,
              group: WorkflowNodeTypeEnum.PATH_OPTIONAL,
            },
          ],
        },
      },
      true,
    );

    /**
     * 工艺
     */
    Graph.registerNode(WorkflowNodeTypeEnum.NODE_SPEC, NODE_SPEC, true);

    /**
     * 子流程
     */
    Graph.registerNode(WorkflowNodeTypeEnum.NODE_WORKFLOW, NODE_WORKFLOW, true);

    // 主路径
    Graph.registerEdge(WorkflowNodeTypeEnum.PATH_MAIN, {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: COLOR_GREEN,
          strokeWidth: 2,
          targetMarker: 'classic',
        },
      },
    });

    // 可选路径
    Graph.registerEdge(WorkflowNodeTypeEnum.PATH_OPTIONAL, {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: COLOR_GREEN,
          strokeWidth: 2,
          strokeDasharray: 5,
          targetMarker: 'classic',
        },
      },
    });

    // 并行
    Graph.registerEdge(WorkflowNodeTypeEnum.PATH_PARALLEL, {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: COLOR_ORANGE,
          strokeWidth: 2,
          strokeDasharray: 5,
          targetMarker: 'classic',
        },
      },
    });

    // 返回路径
    Graph.registerEdge(WorkflowNodeTypeEnum.PATH_BACK, {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: COLOR_RED,
          strokeWidth: 2,
          strokeDasharray: 5,
          targetMarker: 'classic',
        },
      },
    });

    /**
     * 开始节点
     */
    Graph.registerNode(WorkflowNodeTypeEnum.NODE_START, {
      inherit: 'rect',
      width: 26,
      height: 26,
      label: $t('sys.start'),
      attrs: {
        body: {
          fill: '#0DCF8D',
          strokeWidth: 0,
          rx: 4,
          ry: 4,
        },
        label: COMMON_LABEL,
      },
      ports: {
        groups: {
          [WorkflowNodeTypeEnum.PATH_MAIN]: {
            position: {
              name: 'right',
            },
            markup: [
              {
                tagName: 'circle', // 标签名称
                selector: 'body', // 选择器
              },
              {
                tagName: 'polyline',
                selector: 'line',
              },
            ],
            attrs: {
              body: {
                magnet: true,
                r: 8,
                stroke: '#0DAA9C',
                fill: '#0DAA9C',
                strokeWidth: 1,
              },
              line: {
                magnet: true,
                fill: 'transparent',
                stroke: '#ffffff',
                points: '-2 4, 2 0, -2 -4',
                strokeWidth: 2,
              },
            },
          },
        },
        items: [
          { id: `${WorkflowNodeTypeEnum.PATH_MAIN}_1`, group: WorkflowNodeTypeEnum.PATH_MAIN },
        ],
      },
    });

    /**
     * 结束节点
     */
    Graph.registerNode(WorkflowNodeTypeEnum.NODE_END, {
      inherit: 'circle',
      label: $t('sys.end'),
      width: 26,
      height: 26,
      attrs: {
        body: {
          fill: COLOR_RED,
          strokeWidth: 0,
          r: 13,
        },
        label: COMMON_LABEL,
      },
    });
  }

  return {
    register,
  };
}
