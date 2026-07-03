import { provide, inject } from 'vue';
import { GctContext } from '../../context';

/**
 * 获取上下文实例
 *
 * @author zhanghanrui
 * @date 2024-05-06 10:05:42
 * @export
 * @param {boolean} [ext=false] 是否创建新实例，并集成父上下文实例
 * @return {*}  {IGctContext}
 */
export function useGctContext(ext: boolean = false): IGctContext {
  let context = inject('gct-context') as IGctContext;
  if (!context) {
    context = GctContext.create({});
  } else if (ext === true) {
    context = GctContext.create({}, context);
  }
  provide('gct-context', context);
  return context;
}
