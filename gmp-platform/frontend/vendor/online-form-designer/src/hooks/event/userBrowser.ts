import FingerprintJS from '@fingerprintjs/fingerprintjs';

/** 获取浏览器标识 */
export function getBrowser() {
  const userAgent = navigator.userAgent;

  if (userAgent.indexOf('Firefox') !== -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
    return 'Opera';
  } else if (userAgent.indexOf('Edge') !== -1) {
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') !== -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') !== -1) {
    return 'Safari';
  } else {
    return 'unknown';
  }
}

/** 获取移动端系统类型 */
export function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor;

  if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return 'iOS';
  } else if (userAgent.match(/Android/i)) {
    return 'Android';
  } else if (userAgent.match(/BlackBerry/i)) {
    return 'BlackBerry';
  } else if (userAgent.match(/Windows Phone/i)) {
    return 'Windows Phone';
  } else {
    return 'unknown';
  }
}

/** 获取浏览器指纹Id */
export async function getFingerprint() {
  const fp = await FingerprintJS.load();
  const fingerprint = await fp.get();
  return fingerprint;
}

/** web端浏览器指纹标识 */
export async function getBrowserFingerprint() {
  if (localStorage.getItem('FINGERPRINT')) {
    return `${getBrowser()}/${localStorage.getItem('FINGERPRINT')}`;
  }
  const fingerprint = await getFingerprint();
  localStorage.setItem('FINGERPRINT', fingerprint.visitorId);
  return `${getBrowser()}/${fingerprint.visitorId}`;
}

/** mobile端浏览器指纹标识 */
export async function getMobileBrowserFingerprint() {
  const fingerprint = await getFingerprint();
  return `${getMobileOperatingSystem()}/${fingerprint.visitorId}`;
}

/** 页签唯一标识 */
export function getPageIdentification() {
  const session = sessionStorage.getItem('currentPageTag');

  if (session) {
    return session;
  }

  const pageTag = Date.now().toString();

  sessionStorage.setItem('currentPageTag', pageTag);
  return pageTag;
}
