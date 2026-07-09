import { IModalData } from '@gct/runtime';
import { CardDesignView } from './views/card-design-view';

/**
 * 打开卡片设计界面
 *
 * @export
 * @param {string} id
 * @param {IParams} [params]
 * @returns {*}  {Promise<IModalData>}
 */
export function openCardDesign(id: string, params?: IParams): Promise<IModalData> {
  return window.gct.openUtil.fullScreen<IModalData>(
    CardDesignView,
    { id: id || undefined, params, modelKey: params?.modelKey },
    {},
  );
}
