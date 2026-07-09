import { defineComponent, computed } from 'vue'; // 移除了 readonly
import { useNamespace } from '@gct-paas/core';
import { useReportDataSetDesignStore } from '../store';
import { ILinkData, INodeData } from '../interface';
import { ReportDataSetLinkConfig } from './report-data-set-link-config';
import { ReportDataSetNodeConfig } from './report-data-set-node-config';
import './report-data-set-item-edit-panel.scss';

/**
 * 编辑区子项配置面板
 */
export const ReportDataSetItemEditPanel = defineComponent({
  name: 'ReportDataSetItemEditPanel',
  setup() {
    const ns = useNamespace('report-data-set-item-edit-panel');
    const store = useReportDataSetDesignStore();

    const activeNodeData = computed<INodeData | null>(() => store.getActiveNodeData);
    const activeLinkData = computed<ILinkData | null>(() => store.getActiveLinkData);

    function renderLinkPanel() {
      if (!activeLinkData.value) {
        return <span></span>;
      }
      return <ReportDataSetLinkConfig key={activeLinkData.value.id} data={activeLinkData.value} />;
    }

    function renderNodePanel() {
      if (!activeNodeData.value) {
        return <span></span>;
      }
      return <ReportDataSetNodeConfig key={activeNodeData.value.id} data={activeNodeData.value} />;
    }

    return () => {
      // 将 activeNodeData 和其他可能的 props 传递给特定的配置组件
      return <div class={ns.b()}>{store.activeLink ? renderLinkPanel() : renderNodePanel()}</div>;
    };
  },
});
