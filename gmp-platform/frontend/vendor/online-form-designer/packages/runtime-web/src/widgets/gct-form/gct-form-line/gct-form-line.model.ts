import { IFormLine } from '@gct/runtime';

/**
 * 表单分割线
 *
 * @export
 * @class GctFormLineModel
 * @implements {IFormLine}
 */
export class GctFormLineModel implements IFormLine {
  type: string = 'line';
  layout: 'flex' | 'grid' = 'grid';
  name: string = '';
  isContainer: boolean = true;

  constructor(name: string, opts: Partial<IFormLine> = {}) {
    this.name = name;
    Object.assign(this, opts);
  }
}
