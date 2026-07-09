import { inject } from 'vue';
import { ControllerTag } from '../constant';
import { RelationshipDiagramConfigController } from '../relationship-diagram-config.controller';

/**
 * 获取根控制器实例
 *
 * @author zhanghanrui
 * @date 2024-06-25 09:06:08
 * @export
 * @return {*}  {RelationshipDiagramConfigController}
 */
export function useRootController(): RelationshipDiagramConfigController {
  const rootController = inject(ControllerTag.ROOT) as RelationshipDiagramConfigController;
  if (!rootController) {
    throw new Error('root controller not found');
  }
  return rootController;
}
