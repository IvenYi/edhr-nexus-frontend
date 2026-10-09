package com.zencas.edhr.production.service;

import org.apache.poi.hssf.eventusermodel.HSSFEventFactory;
import org.apache.poi.hssf.eventusermodel.HSSFRequest;
import org.apache.poi.hssf.record.BOFRecord;
import org.apache.poi.hssf.record.FilePassRecord;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.poifs.filesystem.DirectoryEntry;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.HashSet;
import java.util.zip.ZipInputStream;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Format inspection only. Never executes macros, renders, or rewrites the original bytes. */
final class DhrOfficeAttachment {
    private static final Map<String, String> MIME_TYPES = Map.of(
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xls", "application/vnd.ms-excel",
            "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private DhrOfficeAttachment() { }

    static String mimeType(String extension) { return MIME_TYPES.get(extension); }

    static String extension(String mime) {
        return switch (mime) {
            case "application/pdf" -> "pdf";
            case "image/png" -> "png";
            case "image/jpeg" -> "jpg";
            default -> MIME_TYPES.entrySet().stream().filter(entry -> entry.getValue().equals(mime))
                    .map(Map.Entry::getKey).findFirst().orElseThrow(() -> invalid("附件类型无效"));
        };
    }

    static void inspect(byte[] bytes, String mime) throws Exception {
        String extension = extension(mime);
        if (extension.equals("doc") || extension.equals("xls")) {
            try (var fs = new POIFSFileSystem(new ByteArrayInputStream(bytes))) {
                inspectDirectory(fs.getRoot());
                if (extension.equals("doc")) {
                    try (var document = new HWPFDocument(fs)) {
                        if (document.getFileInformationBlock().getFibBase().isFEncrypted())
                            throw invalid("不支持加密的 Office 附件");
                    }
                } else {
                    // Includes Excel 4.0 macro sheets and encryption, not just VBA directory names.
                    var request = new HSSFRequest();
                    request.addListenerForAllRecords(record -> {
                        if (record instanceof FilePassRecord) throw invalid("不支持加密的 Office 附件");
                        if (record instanceof BOFRecord bof && (bof.getType() == BOFRecord.TYPE_EXCEL_4_MACRO
                                || bof.getType() == BOFRecord.TYPE_VB_MODULE)) throw invalid("不支持含宏的 Office 附件");
                    });
                    new HSSFEventFactory().processWorkbookEvents(request, fs);
                    try (var workbook = new HSSFWorkbook(fs)) { workbook.getNumberOfSheets(); }
                }
            }
        } else {
            inspectZipSize(bytes);
            var pkg = OPCPackage.open(new ByteArrayInputStream(bytes));
            try {
                for (var part : pkg.getParts()) {
                    String type = part.getContentType().toLowerCase(Locale.ROOT);
                    String name = part.getPartName().getName().toLowerCase(Locale.ROOT);
                    if (type.contains("macro") || type.contains("vba") || name.contains("vbaproject") || name.contains("macrosheet"))
                        throw invalid("不支持含宏的 Office 附件");
                }
                if (extension.equals("docx")) {
                    try (var document = new XWPFDocument(pkg)) {
                        if (!"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
                                .equals(document.getPackagePart().getContentType())) throw invalid("Office 文件类型与扩展名不一致");
                    }
                } else {
                    try (var workbook = new XSSFWorkbook(pkg)) {
                        if (!"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"
                                .equals(workbook.getPackagePart().getContentType())) throw invalid("Office 文件类型与扩展名不一致");
                    }
                }
            } finally { pkg.revert(); }
        }
    }

    private static void inspectDirectory(DirectoryEntry directory) {
        for (var entry : directory) {
            String name = entry.getName().toLowerCase(Locale.ROOT);
            if (name.equals("encryptedpackage") || name.equals("encryptioninfo")) throw invalid("不支持加密的 Office 附件");
            if (name.equals("vba") || name.equals("macros") || name.startsWith("_vba_project"))
                throw invalid("不支持含宏的 Office 附件");
            if (entry instanceof DirectoryEntry child) inspectDirectory(child);
        }
    }

    private static void inspectZipSize(byte[] bytes) throws IOException {
        // Require a complete central directory as well as valid local entries. POI's streaming
        // reader otherwise tolerates a missing index; never silently accept a repaired original.
        try (var channel = new org.apache.commons.compress.utils.SeekableInMemoryByteChannel(bytes);
             var index = org.apache.commons.compress.archivers.zip.ZipFile.builder().setSeekableByteChannel(channel).get();
             var zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            var remaining = new HashSet<String>();
            var indexedEntries = index.getEntries();
            while (indexedEntries.hasMoreElements()) {
                String name = indexedEntries.nextElement().getName();
                if (!remaining.add(name)) throw invalid("Office 文件存在重复压缩项");
                if (remaining.size() > 10_000) throw invalid("Office 文件包含过多压缩项");
            }
            long expanded = 0;
            byte[] buffer = new byte[8192];
            java.util.zip.ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (!remaining.remove(entry.getName())) throw invalid("Office 压缩索引与内容不一致");
                int count;
                while ((count = zip.read(buffer)) != -1) {
                    expanded += count;
                    if (expanded > 100L * 1024 * 1024) throw invalid("Office 文件解压后过大，请拆分文件");
                }
                var indexed = index.getEntry(entry.getName());
                if (indexed.getSize() != entry.getSize() || indexed.getCrc() != entry.getCrc())
                    throw invalid("Office 压缩索引与内容不一致");
            }
            if (!remaining.isEmpty()) throw invalid("Office 压缩文件不完整");
        }
    }
}
