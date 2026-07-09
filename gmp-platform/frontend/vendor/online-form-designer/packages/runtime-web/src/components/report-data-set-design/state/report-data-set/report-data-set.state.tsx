import { DagreLayout } from '@antv/layout';
import { type Graph } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { ModelMetaDTO } from '@gct/runtime';
import { IFieldData, ILinkData, INodeData, IReportDataSetState } from '../../interface';
import { ReportDataSetStep } from '../../enums';
import { AsyncSeriesHook } from 'qx-util';

export class ReportDataSetState implements IReportDataSetState {
  hooks = {
    active: {
      before: new AsyncSeriesHook<[type: 'link' | 'node', id: string], { isOk: boolean }>(),
    },
  };

  isPreview: boolean = false;

  isLoaded: boolean = false;

  isNew: boolean = false;

  isChanged: boolean = false;

  isDragging: boolean = false;

  step: ReportDataSetStep = ReportDataSetStep.MODEL_CONFIG;

  graph: Graph | null = null;

  active: string = '';

  activeLink: string = '';

  nodes: INodeData[] = [];

  links: ILinkData[] = [];

  fields: IFieldData[] = [];

  modelFields: IFieldData[] = [];

  x6Layout: DagreLayout = new DagreLayout({
    type: 'dagre',
    rankdir: 'LR',
    align: 'UL',
    nodesep: 35,
    ranksep: 130,
  });

  dnd: Dnd | null = null;

  modelMap: Map<string, ModelMetaDTO> = new Map<string, ModelMetaDTO>();

  data = {};

  isBI: boolean = false;

  databaseId: string = '';
}
