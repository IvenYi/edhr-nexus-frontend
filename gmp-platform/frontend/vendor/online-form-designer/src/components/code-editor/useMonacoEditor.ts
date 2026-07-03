export enum Theme {
  VS = 'vs',
  BLACK = 'hc-black',
  DARK = 'vs-dark',
}

export enum Lang {
  JS = 'javascript',
  SQL = 'sql',
  PWSH = 'powershell',
  Java = 'java',
  CSharp = 'csharp',
  JSON = 'json',
}

export class Prop {
  value?: string | null;
  /** 标题 */
  title?: string;
  /** 语言 */
  language?: string;
  /** 官方自带三种主题：vs、hc-black、vs-dark */
  theme?: Theme;
  /** 是否只读 */
  readonly?: boolean;
}
