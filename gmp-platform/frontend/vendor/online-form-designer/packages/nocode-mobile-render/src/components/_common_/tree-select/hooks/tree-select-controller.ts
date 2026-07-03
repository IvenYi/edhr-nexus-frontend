import { reactive } from 'vue';
import { SelectTreeNode } from '../types/tree-select-popup';

export interface TreeSelectControllerState {
  /** 是否加载完全 */
  isLoadEnd: boolean;
  /** 是否正在加载中 */
  isLoading: boolean;
  /** 树节点数据 */
  nodes: SelectTreeNode[];
  /** 搜索关键词 */
  query?: string;
  /** 当前页数 */
  currentPage: number;
  /** 每页数量 */
  pageSize: number;
  /** 选中的节点数 */
  selectedNodes: SelectTreeNode[];
}

export class TreeSelectController {
  state: TreeSelectControllerState = reactive({
    isLoadEnd: false,
    isLoading: false,
    nodes: [],
    query: undefined,
    currentPage: 0,
    pageSize: 20,
    selectedNodes: [],
  });

  /** 初始化数据 */
  async init() {
    // 重置相关状态
    this.state.currentPage = 0;
    this.state.isLoadEnd = false;
    this.state.nodes = [];

    try {
      this.state.isLoading = true;
      const res = await this.fetch({
        pageNo: this.state.currentPage + 1,
        pageSize: this.state.pageSize,
        query: this.state.query,
      });

      // 更新页数等状态
      this.state.currentPage += 1;
      if (res.totalPage <= this.state.currentPage) {
        this.state.isLoadEnd = true;
      }

      // 附加新数据
      if (res.nodes) {
        this.state.nodes = res.nodes;
      }
    } finally {
      this.state.isLoading = false;
    }
  }

  /** 加载更多 */
  async loadMore() {
    if (this.state.isLoadEnd) {
      console.warn('已经加载完成的数据，不能再加载更多了');
      return;
    }

    if (this.state.isLoading) {
      console.warn('正在加载中，请勿重复加载');
      return;
    }

    try {
      this.state.isLoading = true;
      const res = await this.fetch({
        pageNo: this.state.currentPage + 1,
        pageSize: this.state.pageSize,
        query: this.state.query,
      });

      // 更新页数等状态
      this.state.currentPage += 1;
      if (res.totalPage <= this.state.currentPage) {
        this.state.isLoadEnd = true;
      }

      // 附加新数据
      if (res.nodes) {
        this.state.nodes.push(...res.nodes);
      }
    } finally {
      this.state.isLoading = false;
    }
  }

  /** 查询数据，用于分页或者搜索等 */
  async fetch(opts: { query?: string; pageSize: number; pageNo: number }): Promise<{
    totalPage: number;
    nodes: SelectTreeNode[];
  }> {
    console.log('请求数据', opts);
    return {
      totalPage: 1,
      nodes: [],
    };
  }

  /** 设置查询条件 */
  async setQuery(query: string) {
    this.state.query = query;
    await this.init();
  }

  /** 用于回显查询不在nodes里面的数据 */
  async getNodesByIds(ids: string[]): Promise<SelectTreeNode[]> {
    console.log('请求数据', ids);
    return [];
  }

  /**
   * 设置选中节点数据集合（组件内部使用）
   */
  setSelectedNodes(nodes: SelectTreeNode[]) {
    this.state.selectedNodes = nodes;
  }

  /** 设置选中节点数据id集合（外部修改使用） */
  async setSelectedIds(ids: string[]) {
    // 根据id集合，判断缺失的节点数据并加载补全，删除多余的节点数据
    const hasNodes = this.state.selectedNodes.filter((i) => ids.includes(i.id));
    const hasIds = hasNodes.map((i) => i.id);
    const missingIds = ids.filter((id) => !hasIds.includes(id));
    if (missingIds.length) {
      const restNodes = await this.getNodesByIds(missingIds);
      hasNodes.push(...restNodes);
    }
    this.setSelectedNodes(hasNodes);
  }
}
