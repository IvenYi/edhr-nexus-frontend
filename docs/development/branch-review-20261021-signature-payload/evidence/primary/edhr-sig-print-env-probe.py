from pathlib import Path
import hashlib,json,os,subprocess,zipfile

tools=Path('/workspace/.edhr-cloud-tools')
repository=Path('/workspace/.pr6-m2')
java=tools/'jdk-21.0.12.1+1/bin/java'
jar_paths=[repository/'com/microsoft/playwright'/artifact/'1.58.0'/f'{artifact}-1.58.0.jar'
           for artifact in ['playwright','driver','driver-bundle']]
jar_paths.append(repository/'com/google/code/gson/gson/2.10.1/gson-2.10.1.jar')
probe=Path('/tmp/EdhrPlaywrightProbe.java')
cache=Path('/tmp/edhr-sig-playwright-cache')
cache.mkdir(exist_ok=True)
links=[]
for name in ['chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
             'chromium-1208/chrome-linux64/chrome']:
    path=cache/name
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():path.symlink_to('/usr/bin/chromium')
    if not path.is_symlink() or path.resolve()!=Path('/usr/bin/chromium'):
        raise RuntimeError('Unexpected cache entry; do not replace it')
    links.append({'path':str(path),'symlinkTo':'/usr/bin/chromium'})
env=os.environ.copy()
env['PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD']='1'
env['PLAYWRIGHT_BROWSERS_PATH']=str(cache)
command=[str(java),'-cp',':'.join(str(p) for p in jar_paths),str(probe)]
result=subprocess.run(command,env=env,capture_output=True,text=True)
Path('/tmp/edhr-sig-playwright-default-probe.log').write_text(result.stdout+result.stderr)
pdf=Path('/tmp/edhr-sig-playwright-probe.pdf')
if result.returncode!=0 or 'DRIVER_CREATED' not in result.stdout or not pdf.read_bytes().startswith(b'%PDF-'):
    raise RuntimeError('Default browser/driver probe failed; see local synthetic-only probe log')
version=subprocess.check_output(['/usr/bin/chromium','--version'],text=True).strip()
text_result=subprocess.run(['pdftotext',str(pdf),'-'],capture_output=True,text=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
with zipfile.ZipFile(jar_paths[2]) as z:
    member=next(n for n in z.namelist() if n.endswith('/package/browsers.json') and '/linux/' in n)
    browsers=json.loads(z.read(member))
summary={
 'level':'L0','role':'environment assistance, not product or independent quality verification',
 'contractReadCommit':'c3343f45bb79f72368937f0d197ae01f989f0390',
 'repositoryMutations':False,'productTestsExecuted':[],
 'rootCause':{'observed':'Playwright.create attempted automatic browser installation under missing /home/agent/.cache/ms-playwright and failed with ENOENT, then wrapped the failure as Failed to create driver.',
              'originalSyntheticProbeExit':1,'notProductFailure':True},
 'runtimeEnvironment':{'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD':'1','PLAYWRIGHT_BROWSERS_PATH':str(cache)},
 'cacheLinks':links,'browserVersion':version,
 'driverBrowserMetadata':[v for v in browsers['browsers'] if v['name'] in ['chromium','chromium-headless-shell']],
 'defaultLaunchProbe':{'exit':result.returncode,'playwrightCreate':True,'explicitExecutablePathUsed':False,
                      'browserLaunch':'chromium().launch(headless=true)',
                      'pdfPath':str(pdf),'pdfBytes':pdf.stat().st_size,'pdfSha256':sha(pdf.read_bytes()),
                      'chineseTextExtracted':text_result.returncode==0 and '合成打印验证' in text_result.stdout,
                      'syntheticOnly':True,'isProductOrVisualAcceptance':False},
 'files':[{'path':str(p),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in jar_paths+[probe]],
 'downloads':[],
 'limitations':['System Chromium is used via documented local cache symlinks; the bundled browser version is not claimed installed.',
                'This standalone driver/default-launch/PDF smoke test does not replace parent regression, actual DHR renderer or visual acceptance.',
                'Authorization-notice TrueType font setup is handled separately by root and was not validated here.'],
 'rawLogQualification':'Local standalone probe logs contain only synthetic HTML and library exceptions; no Maven logs, XML, settings, environment dumps or tokens were copied.',
 'status':'FINAL'
}
Path('/tmp/edhr-sig-print-env-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exit':result.returncode,'browserVersion':version,'defaultLaunch':True,'pdfBytes':pdf.stat().st_size,'chineseTextExtracted':summary['defaultLaunchProbe']['chineseTextExtracted']}))
