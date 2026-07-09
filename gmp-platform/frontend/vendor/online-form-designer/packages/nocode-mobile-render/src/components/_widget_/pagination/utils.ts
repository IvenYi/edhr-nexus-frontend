export function calcText(exp: string, options: { no: number; total: number }): string {
  if (!exp) return '';
  let string = exp;
  if (options.no) {
    string = string.replace('${no}', options.no as unknown as string);
  }
  if (options.total) {
    string = string.replace('${total}', options.total as unknown as string);
  }
  return string;
}
