package com.zencas.edhr.knowledge;

import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;

import static com.zencas.edhr.knowledge.BusinessKnowledgeModel.invalid;
import static com.zencas.edhr.knowledge.BusinessKnowledgeModel.stringKeyedMap;

final class BusinessKnowledgeModelLoader {

    private BusinessKnowledgeModelLoader() {
    }

    static BusinessKnowledgeModel load() throws IOException {
        return load(findRepositoryRoot(Path.of(System.getProperty("user.dir"))));
    }

    static BusinessKnowledgeModel load(Path repositoryRoot) throws IOException {
        Path normalizedRoot = repositoryRoot.toAbsolutePath().normalize();
        Path knowledgeRoot = normalizedRoot.resolve("docs/knowledge");
        Map<Path, Map<String, Object>> documents = new LinkedHashMap<>();

        LoaderOptions loaderOptions = new LoaderOptions();
        loaderOptions.setAllowDuplicateKeys(false);
        Yaml yaml = new Yaml(new SafeConstructor(loaderOptions));
        try (Stream<Path> paths = Files.walk(knowledgeRoot)) {
            for (Path path : paths.filter(Files::isRegularFile)
                    .filter(candidate -> candidate.getFileName().toString().endsWith(".yaml"))
                    .sorted()
                    .toList()) {
                Path relativePath = normalizedRoot.relativize(path.toAbsolutePath().normalize());
                String documentId = display(relativePath);
                Object loaded;
                try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                    loaded = yaml.load(reader);
                } catch (RuntimeException exception) {
                    throw new KnowledgeValidationException(
                            "Record " + documentId + " field 'document': invalid YAML: " + oneLine(exception.getMessage()),
                            exception);
                }
                if (!(loaded instanceof Map<?, ?> loadedMap) || loadedMap.isEmpty()) {
                    throw invalid(documentId, "document", "must be a non-empty map");
                }
                documents.put(relativePath, stringKeyedMap(loadedMap, documentId, "document"));
            }
        }
        if (documents.isEmpty()) {
            throw invalid("docs/knowledge", "documents", "no YAML documents found");
        }
        return new BusinessKnowledgeModel(normalizedRoot, documents);
    }

    static Path findRepositoryRoot(Path start) {
        Path current = start.toAbsolutePath().normalize();
        if (!Files.isDirectory(current)) {
            current = current.getParent();
        }
        while (current != null) {
            if (Files.isDirectory(current.resolve("docs/knowledge"))
                    && Files.isDirectory(current.resolve("gmp-platform"))) {
                return current;
            }
            current = current.getParent();
        }
        throw invalid(display(start), "user.dir",
                "cannot locate repository root containing docs/knowledge and gmp-platform");
    }

    static String display(Path path) {
        return path.normalize().toString().replace(path.getFileSystem().getSeparator(), "/");
    }

    private static String oneLine(String message) {
        return message == null ? "unknown parser error" : message.replaceAll("\\s+", " ").trim();
    }
}
