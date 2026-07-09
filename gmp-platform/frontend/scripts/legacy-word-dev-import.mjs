import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const HELPER_DIR = path.join(os.tmpdir(), 'edhr-legacy-word-dev-import');
const HELPER_CLASSES_DIR = path.join(HELPER_DIR, 'classes');
const HELPER_CLASSPATH_FILE = path.join(HELPER_DIR, 'classpath.txt');
const HELPER_SOURCE_FILE = path.join(HELPER_DIR, 'LegacyWordImportCli.java');
const HELPER_SOURCE_ROOT = path.join(HELPER_DIR, 'java-src');
const LEGACY_WORD_IMPORT_PATH = '/api/v1/master-data/template-modeling/form-templates/import/legacy-word';
const DEFAULT_JAVA_HOME = '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home';

let compilePromise = null;

const JAVA_HELPER_SOURCE = `
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.template.service.TemplateLegacyWordImportService;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

public class LegacyWordImportCli {
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            throw new IllegalArgumentException("missing file path");
        }
        Path path = Path.of(args[0]);
        byte[] bytes = Files.readAllBytes(path);
        MultipartFile file = new SimpleMultipartFile(path.getFileName().toString(), bytes);
        ObjectMapper mapper = new ObjectMapper();
        System.out.print(mapper.writeValueAsString(new TemplateLegacyWordImportService().importDoc(file)));
    }

    private record SimpleMultipartFile(String originalFilename, byte[] bytes) implements MultipartFile {
        @Override public String getName() { return "file"; }
        @Override public String getOriginalFilename() { return originalFilename; }
        @Override public String getContentType() { return "application/msword"; }
        @Override public boolean isEmpty() { return bytes.length == 0; }
        @Override public long getSize() { return bytes.length; }
        @Override public byte[] getBytes() { return bytes; }
        @Override public InputStream getInputStream() { return new ByteArrayInputStream(bytes); }
        @Override public void transferTo(java.io.File dest) throws IOException { Files.write(dest.toPath(), bytes); }
        @Override public void transferTo(Path dest) throws IOException { Files.write(dest, bytes); }
        @Override public org.springframework.core.io.Resource getResource() { throw new UnsupportedOperationException(); }
    }
}
`.trim();

const ERROR_CODE_SOURCE = `
package com.zencas.edhr.common.exception;

public enum ErrorCode {
    GENERAL_001(400, "GENERAL-001", "请求参数校验失败");

    private final int httpStatus;
    private final String code;
    private final String message;

    ErrorCode(int httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
`.trim();

const BUSINESS_EXCEPTION_SOURCE = `
package com.zencas.edhr.common.exception;

public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String detail) {
        super(detail != null ? detail : errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }

    public int getHttpStatus() {
        return errorCode.getHttpStatus();
    }

    public String getCode() {
        return errorCode.getCode();
    }
}
`.trim();

function resolveJavaHome() {
  return process.env.JAVA_HOME && existsSync(process.env.JAVA_HOME)
    ? process.env.JAVA_HOME
    : DEFAULT_JAVA_HOME;
}

function buildJavaEnv() {
  const javaHome = resolveJavaHome();
  return {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH ?? ''}`,
  };
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 1024 * 1024 * 16,
    ...options,
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${command} failed`).trim());
  }

  return result.stdout.trim();
}

async function ensureHelperCompiled(repoRoot) {
  if (compilePromise) {
    return compilePromise;
  }

  compilePromise = (async () => {
    await fs.mkdir(HELPER_CLASSES_DIR, { recursive: true });
    await fs.mkdir(path.join(HELPER_SOURCE_ROOT, 'com/zencas/edhr/common/exception'), { recursive: true });
    await fs.writeFile(HELPER_SOURCE_FILE, `${JAVA_HELPER_SOURCE}\n`, 'utf8');
    await fs.writeFile(
      path.join(HELPER_SOURCE_ROOT, 'com/zencas/edhr/common/exception/ErrorCode.java'),
      `${ERROR_CODE_SOURCE}\n`,
      'utf8',
    );
    await fs.writeFile(
      path.join(HELPER_SOURCE_ROOT, 'com/zencas/edhr/common/exception/BusinessException.java'),
      `${BUSINESS_EXCEPTION_SOURCE}\n`,
      'utf8',
    );

    const backendRoot = path.join(repoRoot, 'gmp-platform', 'backend');
    const mvnSettingsFile = '/tmp/maven-settings-aliyun.xml';
    const env = buildJavaEnv();

    runCommand(
      'mvn',
      ['-s', mvnSettingsFile, '-q', 'dependency:build-classpath', `-Dmdep.outputFile=${HELPER_CLASSPATH_FILE}`],
      { cwd: backendRoot, env },
    );

    const classpath = (await fs.readFile(HELPER_CLASSPATH_FILE, 'utf8')).trim();
    const sourceRoot = path.join(backendRoot, 'src', 'main', 'java');
    const javaFiles = [
      path.join(HELPER_SOURCE_ROOT, 'com/zencas/edhr/common/exception/ErrorCode.java'),
      path.join(HELPER_SOURCE_ROOT, 'com/zencas/edhr/common/exception/BusinessException.java'),
      path.join(sourceRoot, 'com/zencas/edhr/template/dto/TemplateImportGridResponse.java'),
      path.join(sourceRoot, 'com/zencas/edhr/template/service/TemplateLegacyWordImportService.java'),
      HELPER_SOURCE_FILE,
    ];

    runCommand(
      'javac',
      [
        '--release',
        '21',
        '-proc:none',
        '-cp',
        classpath,
        '-sourcepath',
        `${sourceRoot}${path.delimiter}${HELPER_SOURCE_ROOT}`,
        '-d',
        HELPER_CLASSES_DIR,
        ...javaFiles,
      ],
      { cwd: backendRoot, env },
    );

    return {
      classpath,
      env,
    };
  })();

  return compilePromise;
}

function parseMultipartFile(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = boundaryMatch?.[1] ?? boundaryMatch?.[2];
  if (!boundary) {
    throw new Error('模板导入请求缺少 multipart boundary');
  }

  const raw = buffer.toString('latin1');
  const fileNameMatch = raw.match(/filename="([^"]+)"/i);
  if (!fileNameMatch) {
    throw new Error('模板导入请求缺少文件名');
  }

  const bodyStart = raw.indexOf('\r\n\r\n');
  if (bodyStart < 0) {
    throw new Error('模板导入请求体格式不正确');
  }

  const boundaryToken = `\r\n--${boundary}`;
  const bodyEnd = raw.indexOf(boundaryToken, bodyStart + 4);
  if (bodyEnd < 0) {
    throw new Error('模板导入请求体未找到结束边界');
  }

  return {
    filename: path.basename(fileNameMatch[1]),
    bytes: Buffer.from(raw.slice(bodyStart + 4, bodyEnd), 'latin1'),
  };
}

async function readRequestBuffer(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function writeJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export async function handleLegacyWordDevImport(request, response, repoRoot) {
  if (request.method !== 'POST' || !(request.url || '').startsWith(LEGACY_WORD_IMPORT_PATH)) {
    return false;
  }

  try {
    const buffer = await readRequestBuffer(request);
    const { filename, bytes } = parseMultipartFile(buffer, request.headers['content-type'] || '');
    await fs.mkdir(HELPER_DIR, { recursive: true });
    const tempFilePath = path.join(HELPER_DIR, `${Date.now()}${path.extname(filename) || '.doc'}`);
    await fs.writeFile(tempFilePath, bytes);

    try {
      const { classpath, env } = await ensureHelperCompiled(repoRoot);
      const output = runCommand(
        'java',
        ['-cp', `${classpath}${path.delimiter}${HELPER_CLASSES_DIR}`, 'LegacyWordImportCli', tempFilePath],
        { cwd: path.join(repoRoot, 'gmp-platform', 'backend'), env },
      );
      const jsonStart = output.indexOf('{');
      const jsonPayload = jsonStart >= 0 ? output.slice(jsonStart) : output;

      writeJson(response, 200, {
        code: 200,
        message: 'success',
        data: JSON.parse(jsonPayload),
      });
    } finally {
      await fs.rm(tempFilePath, { force: true });
    }
  } catch (error) {
    writeJson(response, 500, {
      code: 500,
      message: error instanceof Error ? error.message : 'Word 模板解析失败',
      data: null,
    });
  }

  return true;
}
