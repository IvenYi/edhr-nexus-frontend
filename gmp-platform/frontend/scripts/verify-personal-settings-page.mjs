import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  packageJson: 'package.json',
  router: 'src/router/index.tsx',
  appLayout: 'src/components/shared/AppLayout.tsx',
  personalSettingsPage: 'src/pages/account/PersonalSettingsPage.tsx',
  identityApi: 'src/api/identity.ts',
  auditApi: 'src/api/audit.ts',
  loginLogApi: 'src/api/loginLogs.ts',
  authController: '../backend/src/main/java/com/zencas/edhr/identity/controller/AuthController.java',
  auditController: '../backend/src/main/java/com/zencas/edhr/compliance/controller/AuditController.java',
  loginLogController: '../backend/src/main/java/com/zencas/edhr/identity/controller/LoginLogController.java',
  uiStandard: '../../docs/design-audit/organization-management-ui-standard.md',
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`缺少文件: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function assertContains(source, snippets, label) {
  const missing = snippets.filter((snippet) => !source.includes(snippet));
  if (missing.length > 0) {
    throw new Error(`${label} 缺少: ${missing.join(', ')}`);
  }
}

function assertMatches(source, checks, label) {
  const missing = checks.filter(({ pattern }) => !pattern.test(source)).map(({ name }) => name);
  if (missing.length > 0) {
    throw new Error(`${label} 未匹配: ${missing.join(', ')}`);
  }
}

const packageJson = read(files.packageJson);
assertContains(packageJson, ['"verify:personal-settings"'], files.packageJson);

const router = read(files.router);
assertContains(router, [
  'PersonalSettingsPage',
  "@/pages/account/PersonalSettingsPage",
  'path="account"',
  'path="settings"',
], files.router);

const appLayout = read(files.appLayout);
assertContains(appLayout, [
  'PERSONAL_SETTINGS_ROUTE',
  "navigate(PERSONAL_SETTINGS_ROUTE)",
  'handleOpenPersonalSettings',
  '个人设置',
  'PERSONAL_SETTINGS_TAB',
  'PERSONAL_SETTINGS_BREADCRUMBS',
  'avatarUrl',
], files.appLayout);
assertMatches(appLayout, [
  { name: '个人设置菜单项应调用跳转处理器', pattern: /<MuiMenuItem[\s\S]*?onClick=\{handleOpenPersonalSettings\}[\s\S]*?>[\s\S]*?个人设置[\s\S]*?<\/MuiMenuItem>/ },
  { name: '个人设置路由应生成独立标签', pattern: /if\s*\(pathname === PERSONAL_SETTINGS_ROUTE\)\s*return PERSONAL_SETTINGS_TAB;/ },
  { name: '个人设置路由应生成独立面包屑', pattern: /if\s*\(pathname === PERSONAL_SETTINGS_ROUTE\)\s*return PERSONAL_SETTINGS_BREADCRUMBS;/ },
  { name: '个人设置面包屑只展示个人设置', pattern: /const PERSONAL_SETTINGS_BREADCRUMBS[\s\S]*?\[\s*\{\s*label: '个人设置'[\s\S]*?\]\s*;/ },
  { name: '顶部用户头像应支持图片地址', pattern: /src=\{user\.avatarUrl \|\| undefined\}/ },
], files.appLayout);

const personalSettingsPage = read(files.personalSettingsPage);
assertContains(personalSettingsPage, [
  'data-personal-settings-page',
  '基本信息',
  '账号绑定',
  '数据审计',
  '登录日志',
  '姓名',
  '账号',
  '角色',
  '手机',
  'label="性别"',
  'label="邮箱"',
  '所属组织',
  '电子签名',
  'data-signature-certification-dialog',
  'data-signature-pad',
  'data-signature-canvas',
  '手写签名板',
  '身份证正面',
  '身份证反面',
  '请上传身份证正面',
  '请上传身份证反面',
  'SIGNATURE_CONFIRMATION_KEYS',
  'buildSignatureStatements',
  '本系统账号（{account}）及绑定的电子签名凭证由本人（{name}）专属持有、独立控制',
  '本人（{name}）授权该电子签名用于本系统内各类电子表单的审核、确认与批准等合规操作',
  '所有以本账号（{account}）完成的电子签名行为',
  '电子签名密码',
  '当前系统登录密码',
  'signatureExpiresAt',
  'signatureAuthorizationNoticeFileId',
  'signatureAuthorizationNoticePreviewUrl',
  'getSignatureStatusMeta',
  '电子签名已认证',
  '电子签名已过期',
  '未认证',
  '已认证',
  '已过期',
  '失效于',
  '重新认证',
  '授权通知书',
  '授权通知书.pdf',
  'PDF',
  '预览',
  'CloseOutlined',
  'aria-label="关闭授权通知书预览"',
  'data-signature-name-guide',
  'signaturePasswordVisible',
  'loginPasswordVisible',
  '显示电子签名密码',
  '隐藏电子签名密码',
  '显示当前系统登录密码',
  '隐藏当前系统登录密码',
  'responseData.message',
  'responseData.detail',
  'responseData.error',
  "Request failed with status code",
  '认证中',
  'fileId',
  'aria-label="上传头像"',
  '保存',
  'uploadUserAvatar',
  'uploadSignatureEvidence',
  'createPersonalSignature',
  'changeCurrentUserPassword',
  '当前密码',
  '新密码',
  '确认密码',
  '修改密码',
  '电子签名未认证',
  '绑定微信',
  '绑定企业微信',
  '绑定钉钉',
  '绑定飞书',
  'BindingWechatIcon',
  'BindingWeComIcon',
  'BindingDingTalkIcon',
  'BindingFeishuIcon',
  '更换绑定',
  '添加绑定',
  '当前未绑定绑定微信账号',
  '当前未绑定绑定企业微信账号',
  '当前未绑定绑定钉钉账号',
  '当前未绑定绑定飞书账号',
  'AUTH_USER_CHANGE_EVENT',
  'localStorage.setItem(\'user\', JSON.stringify(nextUser));',
  'data-personal-settings-basic-panel',
  'data-avatar-crop-dialog',
  'data-avatar-crop-frame',
  '头像裁剪',
  'createCroppedAvatarFile',
  'cropScale',
  'cropOffset',
  'getMyAuditLogs',
  'getMyLoginLogs',
  '个人资料变更记录',
  '包含当前用户自己在个人设置页的改动以及管理员改动您用户资料的记录。',
  '本人登录登出记录',
  'data-personal-settings-audit-panel',
  'data-personal-settings-login-panel',
  "organizationName: '所属组织'",
  "return `历史组织ID(${trimmed})`;",
  "record.organizationName !== undefined || record.organization !== undefined",
  "!['primaryDepartmentId', 'departmentId', 'departmentIds', 'departmentName'].includes(field)",
], files.personalSettingsPage);
[
  'Follow me',
  '昵称',
  '标签',
  '个性标签',
  '添加标签',
  '手机号',
  '腹黑',
  '怕麻烦',
  '小仙女',
  '仙气飘飘',
  'label="生日"',
  'label="个人简介"',
  '认证签名',
  '最近认证时间',
  '尚未完成电子签名认证',
  '电子签名认证需完成手写签名、当前账号密码二次认证、身份证正反面上传，以及三段合规声明逐项确认。',
  '<DateField',
  '<Select',
  '<DrawOutlined',
  'OpenInNewOutlined',
  'PictureAsPdfOutlined',
  '在线预览',
  'DownloadOutlined',
  'handleDownloadSignatureAuthorizationNotice',
  'signatureAuthorizationNoticeDownloadUrl',
  'downloadLink.download',
  'data-bind-email-button',
  'data-email-binding-dialog',
  '绑定邮箱账号',
  '绑定邮箱',
  'BindingEmailIcon',
  "type BindingKey = 'email' |",
  "const BINDING_ITEMS: BindingKey[] = ['email'",
  "case 'email':",
  "当前未绑定绑定邮箱账号",
  'label="签名含义"',
  '>\n                签名含义\n              <',
  'validateIdCardEvidenceImage',
  'loadImageFromFile',
  '请上传清晰的身份证正反面图片',
  "side === 'front' && (inferredSide.includes('back') || inferredSide.includes('反面'))",
].forEach((forbidden) => {
  if (personalSettingsPage.includes(forbidden)) {
    throw new Error(`${files.personalSettingsPage} 不应再包含: ${forbidden}`);
  }
});
[
  />\s*上传头像\s*</,
  /“\{state\.biography\}”/,
].forEach((pattern) => {
  if (pattern.test(personalSettingsPage)) {
    throw new Error(`${files.personalSettingsPage} 存在不符合截图要求的展示: ${pattern}`);
  }
});
assertMatches(personalSettingsPage, [
  { name: '个人设置页应使用左右两列布局', pattern: /gridTemplateColumns:\s*\{\s*xs:\s*'1fr',\s*lg:\s*'320px minmax\(0, 1fr\)'/ },
  { name: '个人设置页外层不得出现页面级滚动条', pattern: /<Box sx=\{\{ flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: COLORS\.pageBg/ },
  { name: '个人设置页应提供四个固定标签页', pattern: /const SETTINGS_TABS = \['基本信息', '账号绑定', '数据审计', '登录日志'\]/ },
  { name: '无头像时应截取用户名称第一个字', pattern: /function initials\(value: string\)[\s\S]*?charAt\(0\)/ },
  { name: '头像上传成功后应写入本地用户并广播', pattern: /avatarUrl[\s\S]*localStorage\.setItem\('user', JSON\.stringify\(nextUser\)\);[\s\S]*AUTH_USER_CHANGE_EVENT/ },
  { name: '点击头像应打开头像裁剪弹窗', pattern: /<Avatar[\s\S]*onClick=\{handleOpenAvatarEditor\}[\s\S]*aria-label="打开头像裁剪"/ },
  { name: '头像裁剪应支持拖拽图片位置', pattern: /const handleCropMouseDown[\s\S]*mousemove[\s\S]*data-avatar-crop-frame[\s\S]*onMouseDown=\{handleCropMouseDown\}/ },
  { name: '头像裁剪应支持缩放滑块', pattern: /<Slider[\s\S]*value=\{cropScale\}[\s\S]*min=\{0\.5\}[\s\S]*max=\{3\}/ },
  { name: '头像裁剪弹窗不得因缩放滑块或图片放大出现横向滚动条', pattern: /data-avatar-crop-dialog[\s\S]*overflowX:\s*'hidden'[\s\S]*data-avatar-scale-row[\s\S]*overflow:\s*'hidden'[\s\S]*<Slider/ },
  { name: '头像裁剪预览图片必须被框体裁切且自身不得触发滚动条', pattern: /data-avatar-crop-frame[\s\S]*overflow:\s*'hidden'[\s\S]*data-avatar-crop-image[\s\S]*display:\s*'block'[\s\S]*maxWidth:\s*'none'/ },
  { name: '头像保存前应使用 canvas 输出裁剪文件', pattern: /function createCroppedAvatarFile[\s\S]*canvas[\s\S]*drawImage[\s\S]*toBlob/ },
  { name: '头像保存应按裁剪框当前可见区域生成，不再次裁掉原图内容', pattern: /function createCroppedAvatarFile[\s\S]*sourceX[\s\S]*sourceY[\s\S]*sourceWidth[\s\S]*sourceHeight[\s\S]*outputX[\s\S]*outputY[\s\S]*outputWidth[\s\S]*outputHeight[\s\S]*drawImage\(image,\s*sourceX,\s*sourceY,\s*sourceWidth,\s*sourceHeight,\s*outputX,\s*outputY,\s*outputWidth,\s*outputHeight\)/ },
  { name: '头像预览加载失败时应展示自定义占位而不是浏览器裂图', pattern: /cropImageLoadFailed[\s\S]*onError=\{handleCropImageError\}[\s\S]*头像图片加载失败，请重新上传/ },
  { name: '头像预览失败或无图片时不得允许保存', pattern: /disabled=\{!cropImageSource \|\| cropImageLoadFailed \|\| avatarMutation\.isPending \|\| cropSaving\}/ },
  { name: '头像裁剪弹窗应提供上传、取消和保存操作', pattern: /data-avatar-crop-dialog[\s\S]*>\s*上传\s*<[\s\S]*>\s*取消\s*<[\s\S]*>\s*保存\s*</ },
  { name: '保存成功后应同步当前用户查询缓存', pattern: /queryClient\.setQueryData\(\['auth', 'me'\], nextUser\)/ },
  { name: '左侧头像卡右上角应提供蓝色修改密码文字按钮', pattern: /data-profile-summary-card[\s\S]*onClick=\{\(\) => setPasswordDialogOpen\(true\)\}[\s\S]*color: COLORS\.primary[\s\S]*>\s*修改密码\s*</ },
  { name: '左侧头像下方应展示姓名和所属组织', pattern: /<Typography[\s\S]*>\{nameValue\}<\/Typography>[\s\S]*<Typography[\s\S]*>\{organizationValue\}<\/Typography>[\s\S]*<\/Box>\s*<Divider \/>/ },
  { name: '左侧信息顺序应为姓名、账号、角色、手机、邮箱且不含所属组织信息行', pattern: /InfoRow[\s\S]*label="姓名"[\s\S]*InfoRow[\s\S]*label="账号"[\s\S]*InfoRow[\s\S]*label="角色"[\s\S]*InfoRow[\s\S]*label="手机"[\s\S]*InfoRow[\s\S]*label="邮箱"(?![\s\S]*InfoRow[\s\S]*label="所属组织")/ },
  { name: '左侧电子签名标题行应与信息行对齐', pattern: /VerifiedUserOutlined[\s\S]*minWidth:\s*48[\s\S]*电子签名/ },
  { name: '左侧电子签名标题右侧应显示状态徽标', pattern: /电子签名[\s\S]*StatusBadge[\s\S]*label=\{signatureStatusMeta\.badgeLabel\}[\s\S]*color=\{signatureStatusMeta\.color\}/ },
  { name: '左侧电子签名区域应使用虚线方框展示状态和认证按钮', pattern: /borderStyle:\s*'dashed'[\s\S]*signatureStatusMeta\.summary[\s\S]*onClick=\{handleOpenSignatureDialog\}[\s\S]*>\s*\{signatureActionLabel\}\s*</ },
  { name: '电子签认证成功或过期后按钮应显示重新认证', pattern: /const signatureActionLabel = signatureStatusMeta\.status === 'UNVERIFIED' \? '认证' : '重新认证'/ },
  { name: '电子签名区域应同时展示认证于和失效于', pattern: /认证于 \{certifiedAt\}[\s\S]*失效于 \{expiresAt\}/ },
  { name: '电子签名区域应在虚线框下方展示授权通知书 PDF 操作且只保留预览按钮', pattern: /data-signature-authorization-notice[\s\S]*>\s*PDF\s*<[\s\S]*授权通知书\.pdf[\s\S]*signatureAuthorizationNoticePreviewUrl[\s\S]*>\s*\{signatureNoticeAction === 'preview' \? '打开中' : '预览'\}\s*</ },
  { name: '当前用户类型应保留电子签名到期时间和授权通知书文件 ID', pattern: /interface StoredUser[\s\S]*signatureExpiresAt\?: string \| null[\s\S]*signatureAuthorizationNoticeFileId\?: string \| number \| null/ },
  { name: '签名认证响应应读取到期时间和授权通知书文件 ID', pattern: /return response\.data\.data as \{[\s\S]*expiresAt\?: string[\s\S]*authorizationNoticeFileId\?: string \| number \| null/ },
  { name: '签名认证成功后应合并保留到期时间和授权通知书文件 ID', pattern: /mergeUserData\(currentUser, \{[\s\S]*signatureExpiresAt: payload\.expiresAt[\s\S]*signatureAuthorizationNoticeFileId: payload\.authorizationNoticeFileId/ },
  { name: '授权通知书预览应使用受控文件预览端点', pattern: /function buildFilePreviewUrl\(fileId: string \| number \| null \| undefined\)[\s\S]*`\/api\/v1\/files\/\$\{fileId\}\/preview`[\s\S]*signatureAuthorizationNoticePreviewUrl = buildFilePreviewUrl\(signatureAuthorizationNoticeFileId\)/ },
  { name: '授权通知书预览应通过带认证头的 Blob 请求执行并使用页面内 PDF 预览弹窗', pattern: /async function fetchAuthenticatedFileBlob[\s\S]*localStorage\.getItem\('token'\)[\s\S]*Authorization: `Bearer \$\{token\}`[\s\S]*response\.blob\(\)[\s\S]*handlePreviewSignatureAuthorizationNotice[\s\S]*setSignatureNoticePreviewUrl\(\(currentUrl\) => \{[\s\S]*URL\.revokeObjectURL\(currentUrl\)[\s\S]*return objectUrl;[\s\S]*data-signature-authorization-preview-dialog[\s\S]*aria-label="关闭授权通知书预览"[\s\S]*CloseOutlined[\s\S]*component="iframe"[\s\S]*src=\{signatureNoticePreviewUrl\}/ },
  { name: '认证弹窗应复用电子签名认证内容且不展示签名含义字段', pattern: /data-signature-certification-dialog[\s\S]*电子签名认证[\s\S]*手写签名板[\s\S]*电子签名密码[\s\S]*当前系统登录密码/ },
  { name: '手写签名板应显示当前用户名灰色指引且不写入 canvas', pattern: /data-signature-pad[\s\S]*data-signature-name-guide[\s\S]*\{signatureGuideText\}[\s\S]*data-signature-canvas/ },
  { name: '手写签名板用户名指引字号应比原始样式放大一倍', pattern: /data-signature-name-guide[\s\S]*fontSize:\s*\{\s*xs:\s*88,\s*sm:\s*116,\s*md:\s*136\s*\}/ },
  { name: '认证弹窗应提供手写签名画板和清空操作', pattern: /data-signature-pad[\s\S]*清空[\s\S]*data-signature-canvas[\s\S]*onPointerDown=\{handleSignaturePointerDown\}/ },
  { name: '电子签名密码应支持眼睛图标切换明文显示', pattern: /signaturePasswordVisible[\s\S]*type=\{signaturePasswordVisible \? 'text' : 'password'\}[\s\S]*aria-label=\{signaturePasswordVisible \? '隐藏电子签名密码' : '显示电子签名密码'\}[\s\S]*setSignaturePasswordVisible/ },
  { name: '当前系统登录密码应支持眼睛图标切换明文显示', pattern: /loginPasswordVisible[\s\S]*type=\{loginPasswordVisible \? 'text' : 'password'\}[\s\S]*aria-label=\{loginPasswordVisible \? '隐藏当前系统登录密码' : '显示当前系统登录密码'\}[\s\S]*setLoginPasswordVisible/ },
  { name: '认证弹窗应提供身份证正反面上传', pattern: /EvidenceUploadBox[\s\S]*label="身份证正面"[\s\S]*label="身份证反面"/ },
  { name: '身份证正反面上传只做图片类型限制，暂不做内容和正反面预检', pattern: /const handleSignatureEvidenceChange[\s\S]*file\.type\.startsWith\('image\/'\)[\s\S]*setSignatureState[\s\S]*idCardFrontFile[\s\S]*idCardBackFile(?![\s\S]*validateIdCardEvidenceImage)/ },
  { name: '认证提交前不再执行身份证内容和正反面预检', pattern: /const handleSignatureSubmit[\s\S]*if \(!signatureState\.idCardBackFile\)[\s\S]*if \(!allSignatureStatementsConfirmed\)[\s\S]*signatureMutation\.mutate\(\)(?![\s\S]*validateIdCardEvidenceImage)/ },
  { name: '认证提交按钮应显示认证中状态', pattern: /signatureMutation\.isPending \? '认证中' : '认证'/ },
  { name: '认证弹窗三段声明必须逐项确认且整行可点击', pattern: /SIGNATURE_CONFIRMATION_KEYS[\s\S]*signatureStatements\.map[\s\S]*role="button"[\s\S]*onClick=\{\(\) => handleSignatureConfirmationChange\(statement\.key, !signatureState\.confirmations\[statement\.key\]\)\}[\s\S]*onKeyDown=\{\(event\) =>/ },
  { name: '声明 checkbox 点击不得触发行容器二次切换', pattern: /<Checkbox[\s\S]*onChange=\{\(event\) => handleSignatureConfirmationChange\(statement\.key, event\.target\.checked\)\}[\s\S]*onClick=\{\(event\) => event\.stopPropagation\(\)\}/ },
  { name: '认证按钮应在声明、签名、证件、电子签名密码和登录密码齐备前置灰', pattern: /const canSubmitSignature[\s\S]*signatureState\.signaturePassword\.trim\(\)[\s\S]*signatureState\.loginPassword\.trim\(\)[\s\S]*signatureState\.hasHandwrittenSignature[\s\S]*idCardFrontFile[\s\S]*idCardBackFile[\s\S]*allSignatureStatementsConfirmed/ },
  { name: '签名提交应上传签名图和证件图后再认证', pattern: /createSignaturePadFile[\s\S]*uploadSignatureEvidence[\s\S]*signatureImageFileId[\s\S]*idCardFrontFileId[\s\S]*idCardBackFileId/ },
  { name: '上传文件 ID 应优先使用后端字符串 fileId 避免大整数精度丢失', pattern: /function extractUploadedFileId\(payload: unknown\)[\s\S]*fileId\?: string \| number \| null[\s\S]*const rawId = data\.fileId \?\? data\.id/ },
  { name: '基础信息保存应提交姓名、性别、邮箱和手机', pattern: /updateCurrentUserProfile\(\{[\s\S]*displayName:[\s\S]*gender:[\s\S]*email:[\s\S]*phone:[\s\S]*\}\)/ },
  { name: '基础信息姓名和性别应放在同一行', pattern: /Stack direction=\{\{ xs: 'column', sm: 'row' \}\}[\s\S]*label="姓名"[\s\S]*label="性别"/ },
  { name: '基础信息邮箱和手机应放在同一行且邮箱是输入框', pattern: /Stack direction=\{\{ xs: 'column', sm: 'row' \}\}[\s\S]*label="邮箱"[\s\S]*error=\{emailError\}[\s\S]*label="手机"[\s\S]*error=\{phoneError\}/ },
  { name: '基础信息应提供姓名、性别、邮箱和手机可编辑字段', pattern: /label="姓名"[\s\S]*setState[\s\S]*displayName[\s\S]*label="性别"[\s\S]*setState[\s\S]*gender[\s\S]*label="邮箱"[\s\S]*setState[\s\S]*email[\s\S]*label="手机"[\s\S]*setState[\s\S]*phone/ },
  { name: '邮箱和手机字段应声明正则校验状态', pattern: /EMAIL_PATTERN[\s\S]*CHINA_MOBILE_PATTERN[\s\S]*emailError[\s\S]*phoneError/ },
  { name: '手机字段应使用手机校验状态', pattern: /label="手机"[\s\S]*error=\{phoneError\}[\s\S]*helperText=\{phoneError \? '请输入正确的手机' : ''\}/ },
  { name: '右侧滚动条应在基本信息容器内部', pattern: /data-personal-settings-basic-panel[\s\S]*overflow:\s*'auto'/ },
  { name: '当前用户应通过弹窗提供密码修改入口', pattern: /data-password-change-dialog[\s\S]*当前密码[\s\S]*新密码[\s\S]*确认密码[\s\S]*>\s*修改密码\s*</ },
  { name: '当前用户应提供密码修改接口调用', pattern: /changeCurrentUserPassword\(\{[\s\S]*currentPassword[\s\S]*newPassword[\s\S]*confirmPassword/ },
  { name: '电子签名应要求密码二次认证', pattern: /password[\s\S]*createPersonalSignature[\s\S]*meaning/ },
  { name: '绑定列表应按微信、企业微信、钉钉、飞书排序且不含邮箱', pattern: /const BINDING_ITEMS: BindingKey\[\] = \['wechat', 'wecom', 'dingtalk', 'feishu'\][\s\S]*绑定微信[\s\S]*绑定企业微信[\s\S]*绑定钉钉[\s\S]*绑定飞书/ },
  { name: '绑定列表不得再展示 QQ、支付宝、微博、Github、Paypal 或邮箱', pattern: /type BindingKey = 'wechat' \| 'wecom' \| 'dingtalk' \| 'feishu'/ },
  { name: '绑定列表应逐一使用专属品牌识别图标', pattern: /function getBindingIcon\(bindingKey: BindingKey\)[\s\S]*case 'wechat':[\s\S]*return <BindingWechatIcon \/>;[\s\S]*case 'wecom':[\s\S]*return <BindingWeComIcon \/>;[\s\S]*case 'dingtalk':[\s\S]*return <BindingDingTalkIcon \/>;[\s\S]*case 'feishu':[\s\S]*return <BindingFeishuIcon \/>;/ },
  { name: '绑定按钮应根据是否已有值显示更换绑定或添加绑定', pattern: /\{value \? '更换绑定' : '添加绑定'\}/ },
  { name: '数据审计 Tab 必须使用当前用户目标审计接口', pattern: /useQuery[\s\S]*personal-settings-audit-logs[\s\S]*getMyAuditLogs\(\{[\s\S]*page: auditPage[\s\S]*enabled: activeTab === 2/ },
  { name: '登录日志 Tab 必须使用当前用户登录日志接口', pattern: /useQuery[\s\S]*personal-settings-login-logs[\s\S]*getMyLoginLogs\(\{[\s\S]*page: loginPage[\s\S]*enabled: activeTab === 3/ },
  { name: '个人设置审计与登录日志不得调用系统总列表接口', pattern: /import \{ getMyAuditLogs, type AuditLogItem \} from '@\/api\/audit';[\s\S]*import \{ getMyLoginLogs, type LoginLogItem \} from '@\/api\/loginLogs';/ },
  { name: '数据审计 Tab 应使用四列表格展示关键操作信息', pattern: /data-personal-settings-audit-panel[\s\S]*个人资料变更记录[\s\S]*headers=\{\['操作人', '账号', '操作时间', '操作动作'\]\}[\s\S]*colSpan=\{4\}/ },
  { name: '数据审计 Tab 行应支持展开查看变更前和变更后卡片', pattern: /PersonalAuditLogRow[\s\S]*data-personal-audit-change-row[\s\S]*data-personal-audit-change-panel[\s\S]*PersonalAuditFieldBlock[\s\S]*title="变更前"[\s\S]*title="变更后"/ },
  { name: '数据审计 Tab 展开卡片应使用个人审计字段中文映射', pattern: /personalAuditFieldLabelMap[\s\S]*displayName: '姓名'[\s\S]*email: '邮箱'[\s\S]*phone: '手机'[\s\S]*status: '状态'[\s\S]*organizationName: '所属组织'/ },
  { name: '数据审计 Tab 展开卡片应复用可读字段格式', pattern: /function formatPersonalAuditFieldRows[\s\S]*getPersonalAuditFieldLabel\(field\)[\s\S]*getPersonalAuditDisplayValue\(field, fieldValue\)/ },
  { name: '数据审计 Tab 展开卡片空值应显示短横线', pattern: /function getPersonalAuditDisplayValue[\s\S]*if \(normalized === undefined \|\| normalized === null\) return '-'[\s\S]*if \(!trimmed \|\| trimmed === 'undefined' \|\| trimmed === 'null'\) return '-'/ },
  { name: '登录日志 Tab 应只展示本人登录登出记录', pattern: /data-personal-settings-login-panel[\s\S]*本人登录登出记录[\s\S]*事件类型[\s\S]*登录\/登出方式[\s\S]*平台[\s\S]*客户端[\s\S]*浏览器[\s\S]*IP/ },
  { name: '个人设置日志表格行高应保持 40px 且空态撑满容器', pattern: /PERSONAL_TABLE_DATA_ROW_HEIGHT = 40[\s\S]*height: PERSONAL_TABLE_DATA_ROW_HEIGHT[\s\S]*const showEmptyState = loading \|\| error \|\| isEmpty[\s\S]*height: showEmptyState \? '100%' : 'auto'/ },
  { name: '个人设置日志表格字段列应撑满表格容器', pattern: /<Table stickyHeader size="small" sx=\{\{ tableLayout: 'fixed', width: '100%', minWidth, height: showEmptyState \? '100%' : 'auto' \}\}/ },
  { name: '个人设置日志分页每页条数应包含 20、50、100、200', pattern: /PERSONAL_LOG_PAGE_SIZE_OPTIONS = \[20, 50, 100, 200\]/ },
], files.personalSettingsPage);

const identityApi = read(files.identityApi);
assertContains(identityApi, [
  'uploadSignatureEvidence',
  "targetType', 'SIGNATURE_EVIDENCE'",
  "client.post('/files/upload'",
  "client.post('/auth/me/signature', body, { timeout: 60000 })",
], files.identityApi);

const auditApi = read(files.auditApi);
assertContains(auditApi, [
  'getMyAuditLogs',
  "client.get('/audit/logs/me'",
], files.auditApi);

const loginLogApi = read(files.loginLogApi);
assertContains(loginLogApi, [
  'getMyLoginLogs',
  "client.get('/identity/login-logs/me'",
], files.loginLogApi);

const auditController = read(files.auditController);
assertMatches(auditController, [
  { name: '个人设置审计接口应按当前用户 ID 查询 USER_ACCOUNT 目标记录', pattern: /@GetMapping\("\/me"\)[\s\S]*listMyProfileLogs[\s\S]*@RequestAttribute\(value = "userId"[\s\S]*"USER_ACCOUNT"[\s\S]*String\.valueOf\(currentUser\.getId\(\)\)/ },
], files.auditController);

const loginLogController = read(files.loginLogController);
assertMatches(loginLogController, [
  { name: '个人登录日志接口应按当前用户 operatorId 过滤', pattern: /@GetMapping\("\/me"\)[\s\S]*listMine[\s\S]*@RequestAttribute\(value = "userId"[\s\S]*buildSpecification\(eventType, null, startTime, endTime, Long\.parseLong\(userId\)\)/ },
], files.loginLogController);

const fileController = read('../backend/src/main/java/com/zencas/edhr/compliance/controller/FileController.java');
assertMatches(fileController, [
  { name: '上传接口应返回字符串 fileId，避免前端 Snowflake ID 精度丢失', pattern: /Map<String, Object> response = new LinkedHashMap<>\(\);[\s\S]*response\.put\("id", String\.valueOf\(fileObject\.getId\(\)\)\);[\s\S]*response\.put\("fileId", String\.valueOf\(fileObject\.getId\(\)\)\);[\s\S]*response\.put\("targetId", fileObject\.getTargetId\(\)\);[\s\S]*return ApiResponse\.success\(response\)/ },
], '../backend/src/main/java/com/zencas/edhr/compliance/controller/FileController.java');

const authController = read(files.authController);
assertContains(authController, [
  'signatureImageFileId',
  'idCardFrontFileId',
  'idCardBackFileId',
  'statements',
  'signaturePasswordHash',
  'requireSignatureEvidenceFile',
  'SIGNATURE_CONFIRMATION_STATEMENT_COUNT',
  'PASSWORD+HANDWRITTEN_SIGNATURE+ID_CARD',
], files.authController);
assertMatches(authController, [
  { name: '后端应校验三段声明全部确认', pattern: /validateSignatureEvidence[\s\S]*SIGNATURE_CONFIRMATION_STATEMENT_COUNT[\s\S]*Boolean\.TRUE\.equals\(statement\.getConfirmed\(\)\)/ },
  { name: '后端应校验签名图和身份证正反面文件存在', pattern: /requireSignatureEvidenceFile\(request\.getSignatureImageFileId\(\), "请上传手写签名"\)[\s\S]*requireSignatureEvidenceFile\(request\.getIdCardFrontFileId\(\), "请上传身份证正面"\)[\s\S]*requireSignatureEvidenceFile\(request\.getIdCardBackFileId\(\), "请上传身份证反面"\)/ },
  { name: '后端应校验当前系统登录密码但单独存储电子签名密码哈希', pattern: /passwordEncoder\.matches\(request\.getLoginPassword\(\), user\.getPasswordHash\(\)\)[\s\S]*passwordEncoder\.encode\(request\.getSignaturePassword\(\)\)[\s\S]*signaturePasswordHash\(signaturePasswordHash\)/ },
  { name: '后端签名快照应保存文件引用和确认声明', pattern: /snapshot\.put\("signatureImage"[\s\S]*snapshot\.put\("idCardFront"[\s\S]*snapshot\.put\("idCardBack"[\s\S]*snapshot\.put\("statements"/ },
], files.authController);
if (/createPersonalSignature[\s\S]*idCardOcrService\.validateIdCard(Front|Back)/.test(authController)) {
  throw new Error(`${files.authController} 电子签认证暂不应执行身份证正反面 OCR 校验`);
}

const uiStandard = read(files.uiStandard);
assertContains(uiStandard, [
  '左侧个人资料卡右上角必须提供蓝色“修改密码”文字按钮',
  '所属组织不得再放在下方信息行中',
  '信息行顺序固定为姓名、账号、角色、手机、邮箱',
  '所属组织显示当前用户主组织路径，无组织时显示“-”',
  '姓名和性别必须位于同一行',
  '邮箱和手机必须位于同一行',
  '邮箱使用常规输入框',
  '账号绑定 Tab 按顺序展示微信、企业微信、钉钉、飞书四类绑定',
  '账号绑定图标必须逐一使用对应平台的专属识别图标',
  '已绑定账号右侧使用蓝色“更换绑定”文字按钮，未绑定账号右侧使用蓝色“添加绑定”文字按钮',
  '基础信息表单只展示姓名、性别、邮箱、手机',
  '右侧基础信息区域不展示生日和个人简介',
  '邮箱和手机保存前前端和后端都要做格式校验',
  '保存成功后必须同步当前用户查询缓存和本地用户资料',
  '页面刷新后仍能显示最新数据',
  '右侧内容区滚动条只能出现在基本信息内容容器内部',
  '点击头像必须打开头像裁剪弹窗',
  '头像裁剪弹窗必须支持上传或更换图片、鼠标拖拽定位、缩放滑块放大缩小、取消和保存',
  '保存头像前必须在前端生成统一尺寸的裁剪文件',
  '右侧基本信息 Tab 中不再展示独立电子签名卡片',
  '标题行右侧必须使用统一状态徽标展示“未认证”“已认证”或“已过期”',
  '虚线方框内展示签名状态、认证于、失效于以及蓝色文字操作按钮',
  '未认证时按钮为“认证”，已认证或已过期时按钮为“重新认证”',
  '左侧电子签名区域必须在虚线方框中提供蓝色“认证”或“重新认证”文字按钮',
  '虚线框下方展示电子签名授权通知书 PDF 区域',
  '/api/v1/files/{id}/preview',
  '个人设置页不提供授权通知书下载入口',
  '预览弹窗标题“授权通知书预览”和右上角关闭 X 图标必须位于同一行',
  '弹窗底部不再提供“关闭”文字按钮',
  '文件类型必须标识为 PDF',
  '电子签名认证必须在模态框内完成',
  '手写签名板必须在画板内显示当前用户名灰色指引',
  '用户名灰色指引字号必须足够大',
  '身份证正反面上传暂时只限制图片文件类型',
  '不得在电子签认证链路中执行正反面识别或身份证内容预检',
  '签名含义不再作为用户可编辑字段展示',
  '电子签名密码必须由用户单独设置并单独存储哈希',
  '当前系统登录密码只用于本次身份校验',
  '电子签名密码和当前系统登录密码都必须支持眼睛图标切换明文显示',
  '认证弹窗必须包含手写签名板、电子签名密码、当前系统登录密码、身份证正反面上传和三段声明逐条确认',
  '三段声明未全部确认时认证按钮必须置灰',
  '个人设置必须提供“数据审计”和“登录日志”两个只读 Tab',
  '个人设置数据审计 Tab 必须通过后端当前用户专用接口按目标用户查询',
  '当前用户自己在个人设置页里做的改动，以及管理员或其他授权用户在用户管理等位置改动该用户资料的记录，都必须一起展示',
  '个人设置登录日志 Tab 必须通过后端当前用户专用接口按当前账号过滤',
], files.uiStandard);

console.log('Personal settings page verification passed.');
