import {
  AnchorPlacement,
  Endpoint,
  EndpointHandler,
  EndpointRepresentation,
  EndpointRepresentationParams,
  Orientation,
} from '@jsplumb/browser-ui';

/**
 * @public
 */
export interface ArrowEndpointParams extends EndpointRepresentationParams {
  /**
   * 箭头指向
   *
   * @default 'right'
   * @author zhanghanrui
   * @date 2024-04-14 14:04:09
   * @type {('left' | 'right')}
   */
  direction: 'left' | 'right';
}

export type ComputedArrowEndpoint = [number, number, number, number];

export class ArrowEndpoint extends EndpointRepresentation<ComputedArrowEndpoint> {
  constructor(endpoint: Endpoint, public params?: ArrowEndpointParams) {
    super(endpoint, params);
  }

  static type = 'Arrow';

  type = ArrowEndpoint.type;
}

export const ArrowEndpointHandler: EndpointHandler<ArrowEndpoint, ComputedArrowEndpoint> = {
  type: ArrowEndpoint.type,

  cls: ArrowEndpoint,

  compute: (
    ep: ArrowEndpoint,
    anchorPoint: AnchorPlacement,
    _orientation: Orientation,
    _endpointStyle: any,
  ): ComputedArrowEndpoint => {
    const { direction } = ep.params || {};
    ep.x = anchorPoint.curX - (direction === 'left' ? 0 : 4);
    ep.y = anchorPoint.curY - 2.6;
    ep.w = 6;
    ep.h = 6;
    return [anchorPoint.curX, anchorPoint.curY, 0, 0];
  },

  getParams: (_ep: ArrowEndpoint): Record<string, any> => {
    return {};
  },
};
