const HostReg = /(https|http):\/\/([\w-]+\.)+[\w-]+(:[0-9]{1,5})?(\/[\w-{}?&%#.=/,^:~+@]*)?/;

/**
 *校验Url是否合规(带域名)
 *
 * @export
 * @param url
 * @return {*}
 */
export function validateUrl(url) {
  return HostReg.test(url);
}
