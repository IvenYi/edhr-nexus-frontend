package com.zencas.edhr.identity.controller;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** No host font dependency: invalid explicit configuration must fail rather than fall back. */
class AuthorizationNoticeFontTest {
    @TempDir Path directory;

    @Test void missingExplicitFontDoesNotUseHostFallback() {
        assertRejected(directory.resolve("missing.ttf"));
    }

    @Test void directoryIsNotAcceptedAsAFont() {
        assertRejected(directory);
    }

    @Test void corruptExplicitFontDoesNotUseHostFallback() throws IOException {
        Path corrupt = directory.resolve("corrupt.ttf");
        Files.writeString(corrupt, "not a font");
        assertRejected(corrupt);
    }

    @Test void relativeExplicitFontIsRejected() {
        assertRejected(Path.of("relative-font.ttf"));
    }

    private void assertRejected(Path path) {
        assertThatThrownBy(() -> load(path))
                .isInstanceOf(IOException.class)
                .hasMessageContaining("中文字体")
                .hasMessageContaining("EDHR_AUTHORIZATION_NOTICE_FONT");
    }

    private void load(Path path) throws Exception {
        var method = AuthController.class.getDeclaredMethod("loadAuthorizationNoticeFont", PDDocument.class, String.class);
        method.setAccessible(true);
        try (PDDocument document = new PDDocument()) {
            try {
                method.invoke(null, document, path.toString());
            } catch (InvocationTargetException error) {
                if (error.getCause() instanceof Exception cause) throw cause;
                throw error;
            }
        }
    }
}
