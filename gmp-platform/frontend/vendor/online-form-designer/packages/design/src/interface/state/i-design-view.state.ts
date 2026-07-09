import { IDesignNode, IDesignPageNodeData, IDesignTreeItem, LinkedList } from '@gct/base';

/**
 * 设计界面状态
 *
 * @author zhanghanrui
 * @date 2024-07-05 13:07:00
 * @export
 * @interface IDesignViewState
 */
export interface IDesignViewState {
  /**
   * 状态机唯一标识
   *
   * @type {string}
   */
  readonly uuid: string;

  /**
   * 配置区导航标题
   *
   * @type {string}
   */
  rootExpLabel: string;

  /**
   * 前缀
   *
   * @author zhanghanrui
   * @date 2024-07-12 15:07:09
   * @type {string}
   */
  prefix: string;

  /**
   * 是否触发缓存
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-08-30 09:08:39
   * @type {boolean}
   */
  isTriggerCache: boolean;

  /**
   * 节点映射，方便根据 id 查找节点
   *
   * @author zhanghanrui
   * @date 2024-07-05 13:07:01
   * @type {Map<string, IDesignNode>}
   */
  map: Map<string, IDesignNode>;

  /**
   * 页面节点
   *
   * @author zhanghanrui
   * @date 2024-07-24 10:07:15
   * @type {IDesignNode<IDesignPageNodeData> | null}
   */
  pageNode: IDesignNode<IDesignPageNodeData> | null;

  /**
   * 结构树
   *
   * @author zhanghanrui
   * @date 2024-08-21 11:08:04
   * @type {IDesignTreeItem[]}
   */
  tree: IDesignTreeItem[];

  /**
   * 操作历史
   *
   * @author zhanghanrui
   * @date 2024-07-31 17:07:35
   * @type {LinkedList<IDesignTreeItem[]>}
   */
  history: LinkedList<IDesignTreeItem[]>;

  /**
   * 当前选中的节点
   *
   * @author zhanghanrui
   * @date 2024-07-22 16:07:40
   * @type {(IDesignNode | IDesignData | null)}
   */
  selected: IDesignNode | null;

  /**
   * 是否正在拖拽节点
   *
   * @author zhanghanrui
   * @date 2024-07-16 19:07:04
   * @type {boolean}
   */
  isDragging: boolean;

  /**
   * 当前悬浮节点的标识
   *
   * @author zhanghanrui
   * @date 2024-07-11 20:07:11
   * @type {(string | null)}
   */
  hoverId: string | null;

  /**
   * 数据是否变更
   *
   * @author zhanghanrui
   * @date 2024-07-22 11:07:51
   * @type {boolean}
   */
  isChange: boolean;

  /**
   * 数据修改触发计数（主要用于监听数据修改，来进行页面状态变更）
   *
   * @author zhanghanrui
   * @date 2024-08-15 16:08:50
   * @type {number}
   */
  count: number;

  /**
   * 当前放置的容器节点，目前用于悬浮子项时容器高亮指示
   *
   * @type {(IDesignNode | null)}
   */
  dropContainer: IDesignNode | null;

  /**
   * 展开的容器节点标识
   *
   * @type {Set<string>}
   */
  expansions: Set<string>;
}
