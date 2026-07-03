export interface Position {
  line: number;
  column: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

export interface ITokenEntry {
  type: string;
  value: string;
  regex?: {
    pattern: string;
    flags: string;
  };
  range?: [number, number];
  loc?: SourceLocation;
}
