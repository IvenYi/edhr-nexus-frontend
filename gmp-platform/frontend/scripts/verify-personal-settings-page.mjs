import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  packageJson: 'package.json',
  router: 'src/router/index.tsx',
  appLayout: 'src/components/shared/AppLayout.tsx',
  personalSettingsPage: 'src/pages/account/PersonalSettingsPage.tsx',
  identityApi: 'src/api/identity.ts',
  authController: '../backend/src/main/java/com/zencas/edhr/identity/controller/AuthController.java',
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
  '姓名',
  '账号',
  '角色',
  '手机',
  '绑定邮箱账号',
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
  '认证密码',
  '签名含义',
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
  '绑定QQ',
  '绑定微信',
  '绑定支付宝',
  '绑定微博',
  '绑定Github',
  '绑定Paypal',
  '更换绑定',
  '当前未绑定绑定微信账号',
  '当前未绑定绑定支付宝账号',
  '当前未绑定绑定微博账号',
  '当前未绑定绑定Github账号',
  '当前未绑定绑定Paypal账号',
  'AUTH_USER_CHANGE_EVENT',
  'localStorage.setItem(\'user\', JSON.stringify(nextUser));',
  'data-personal-settings-basic-panel',
  'data-avatar-crop-dialog',
  'data-avatar-crop-frame',
  '头像裁剪',
  'createCroppedAvatarFile',
  'cropScale',
  'cropOffset',
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
  'label="性别"',
  'label="生日"',
  'label="个人简介"',
  '认证签名',
  '最近认证时间',
  '尚未完成电子签名认证',
  '电子签名认证需完成手写签名、当前账号密码二次认证、身份证正反面上传，以及三段合规声明逐项确认。',
  '<DateField',
  '<Select',
  '<DrawOutlined',
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
  { name: '个人设置页应提供两个固定标签页', pattern: /const SETTINGS_TABS = \['基本信息', '账号绑定'\]/ },
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
  { name: '左侧电子签名区域应使用虚线方框展示状态和认证按钮', pattern: /borderStyle:\s*'dashed'[\s\S]*signatureStatus[\s\S]*onClick=\{handleOpenSignatureDialog\}[\s\S]*>\s*认证\s*</ },
  { name: '认证弹窗应复用电子签名认证内容', pattern: /data-signature-certification-dialog[\s\S]*电子签名认证[\s\S]*签名含义[\s\S]*认证密码/ },
  { name: '认证弹窗应提供手写签名画板和清空操作', pattern: /data-signature-pad[\s\S]*清空[\s\S]*data-signature-canvas[\s\S]*onPointerDown=\{handleSignaturePointerDown\}/ },
  { name: '认证弹窗应提供身份证正反面上传', pattern: /EvidenceUploadBox[\s\S]*label="身份证正面"[\s\S]*label="身份证反面"/ },
  { name: '认证弹窗三段声明必须逐项确认', pattern: /SIGNATURE_CONFIRMATION_KEYS[\s\S]*signatureStatements\.map[\s\S]*confirmed:\s*signatureState\.confirmations\[statement\.key\]/ },
  { name: '认证按钮应在声明、签名、证件和密码齐备前置灰', pattern: /const canSubmitSignature[\s\S]*signatureState\.password\.trim\(\)[\s\S]*signatureState\.hasHandwrittenSignature[\s\S]*idCardFrontFile[\s\S]*idCardBackFile[\s\S]*allSignatureStatementsConfirmed/ },
  { name: '签名提交应上传签名图和证件图后再认证', pattern: /createSignaturePadFile[\s\S]*uploadSignatureEvidence[\s\S]*signatureImageFileId[\s\S]*idCardFrontFileId[\s\S]*idCardBackFileId/ },
  { name: '基础信息保存只提交姓名、邮箱和手机', pattern: /updateCurrentUserProfile\(\{[\s\S]*displayName:[\s\S]*email:[\s\S]*phone:[\s\S]*\}\)/ },
  { name: '基础信息姓名和邮箱应放在同一行', pattern: /Stack direction=\{\{ xs: 'column', sm: 'row' \}\}[\s\S]*label="姓名"[\s\S]*data-bind-email-button/ },
  { name: '邮箱应显示为蓝色绑定邮箱账号文字按钮', pattern: /data-bind-email-button[\s\S]*variant="text"[\s\S]*color: COLORS\.primary[\s\S]*>\s*绑定邮箱账号\s*</ },
  { name: '邮箱绑定弹窗应提供邮箱输入和保存能力', pattern: /data-email-binding-dialog[\s\S]*绑定邮箱账号[\s\S]*label="邮箱"[\s\S]*error=\{emailDraftError\}/ },
  { name: '基础信息应提供姓名和手机可编辑字段', pattern: /label="姓名"[\s\S]*setState[\s\S]*displayName[\s\S]*label="手机"[\s\S]*setState[\s\S]*phone/ },
  { name: '邮箱和手机字段应声明正则校验状态', pattern: /EMAIL_PATTERN[\s\S]*CHINA_MOBILE_PATTERN[\s\S]*emailDraftError[\s\S]*phoneError/ },
  { name: '邮箱绑定弹窗应使用邮箱校验状态', pattern: /data-email-binding-dialog[\s\S]*error=\{emailDraftError\}[\s\S]*helperText=\{emailDraftError \? '请输入正确的邮箱地址' : ''\}/ },
  { name: '手机字段应使用手机校验状态', pattern: /label="手机"[\s\S]*error=\{phoneError\}[\s\S]*helperText=\{phoneError \? '请输入正确的手机' : ''\}/ },
  { name: '右侧滚动条应在基本信息容器内部', pattern: /data-personal-settings-basic-panel[\s\S]*overflow:\s*'auto'/ },
  { name: '当前用户应通过弹窗提供密码修改入口', pattern: /data-password-change-dialog[\s\S]*当前密码[\s\S]*新密码[\s\S]*确认密码[\s\S]*>\s*修改密码\s*</ },
  { name: '当前用户应提供密码修改接口调用', pattern: /changeCurrentUserPassword\(\{[\s\S]*currentPassword[\s\S]*newPassword[\s\S]*confirmPassword/ },
  { name: '电子签名应要求密码二次认证', pattern: /password[\s\S]*createPersonalSignature[\s\S]*meaning/ },
  { name: '绑定列表应包含六个账号项', pattern: /const BINDING_ITEMS[\s\S]*绑定QQ[\s\S]*绑定微信[\s\S]*绑定支付宝[\s\S]*绑定微博[\s\S]*绑定Github[\s\S]*绑定Paypal/ },
], files.personalSettingsPage);

const identityApi = read(files.identityApi);
assertContains(identityApi, [
  'uploadSignatureEvidence',
  "targetType', 'SIGNATURE_EVIDENCE'",
  "client.post('/files/upload'",
], files.identityApi);

const authController = read(files.authController);
assertContains(authController, [
  'signatureImageFileId',
  'idCardFrontFileId',
  'idCardBackFileId',
  'statements',
  'requireSignatureEvidenceFile',
  'SIGNATURE_CONFIRMATION_STATEMENT_COUNT',
  'PASSWORD+HANDWRITTEN_SIGNATURE+ID_CARD',
], files.authController);
assertMatches(authController, [
  { name: '后端应校验三段声明全部确认', pattern: /validateSignatureEvidence[\s\S]*SIGNATURE_CONFIRMATION_STATEMENT_COUNT[\s\S]*Boolean\.TRUE\.equals\(statement\.getConfirmed\(\)\)/ },
  { name: '后端应校验签名图和身份证正反面文件存在', pattern: /requireSignatureEvidenceFile\(request\.getSignatureImageFileId\(\), "请上传手写签名"\)[\s\S]*requireSignatureEvidenceFile\(request\.getIdCardFrontFileId\(\), "请上传身份证正面"\)[\s\S]*requireSignatureEvidenceFile\(request\.getIdCardBackFileId\(\), "请上传身份证反面"\)/ },
  { name: '后端签名快照应保存文件引用和确认声明', pattern: /snapshot\.put\("signatureImage"[\s\S]*snapshot\.put\("idCardFront"[\s\S]*snapshot\.put\("idCardBack"[\s\S]*snapshot\.put\("statements"/ },
], files.authController);

const uiStandard = read(files.uiStandard);
assertContains(uiStandard, [
  '左侧个人资料卡右上角必须提供蓝色“修改密码”文字按钮',
  '所属组织不得再放在下方信息行中',
  '信息行顺序固定为姓名、账号、角色、手机、邮箱',
  '所属组织显示当前用户主组织路径，无组织时显示“-”',
  '姓名和邮箱必须位于同一行',
  '邮箱不得使用常规输入框，必须显示为蓝色“绑定邮箱账号”文字按钮',
  '基础信息表单只展示姓名、邮箱、手机',
  '右侧基础信息区域不展示性别、生日和个人简介',
  '手机必须可编辑，邮箱和手机保存前前端和后端都要做格式校验',
  '保存成功后必须同步当前用户查询缓存和本地用户资料',
  '页面刷新后仍能显示最新数据',
  '右侧内容区滚动条只能出现在基本信息内容容器内部',
  '点击头像必须打开头像裁剪弹窗',
  '头像裁剪弹窗必须支持上传或更换图片、鼠标拖拽定位、缩放滑块放大缩小、取消和保存',
  '保存头像前必须在前端生成统一尺寸的裁剪文件',
  '右侧基本信息 Tab 中不再展示独立电子签名卡片',
  '左侧电子签名区域必须在虚线方框中提供蓝色“认证”文字按钮',
  '电子签名认证必须在模态框内完成',
  '认证弹窗必须包含手写签名板、签名密码、身份证正反面上传和三段声明逐条确认',
  '三段声明未全部确认时认证按钮必须置灰',
], files.uiStandard);

console.log('Personal settings page verification passed.');
