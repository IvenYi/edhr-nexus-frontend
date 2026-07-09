import { Namespace } from '../../utils';

/**
 * 生成当前组件样式变量命名空间
 *
 * @param block
 * @returns
 */
export function useNamespace(block: string): Namespace {
  return new Namespace(block, 'gct');
}
