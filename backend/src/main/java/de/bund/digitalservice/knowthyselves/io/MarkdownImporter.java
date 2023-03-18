package de.bund.digitalservice.knowthyselves.io;

import static org.apache.commons.io.FilenameUtils.getBaseName;

import de.bund.digitalservice.knowthyselves.DatasetService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.apache.commons.io.FilenameUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MarkdownImporter {
  private final DatasetService datasetService;
  private final Path importDir;
  private final String defaultNs;

  public MarkdownImporter(DatasetService datasetService,
      @Value("${importer.markdown.directory}") Path importDir,
      @Value("${namespace.default.uri}") String defaultNs) {
    this.datasetService = datasetService;
    this.importDir = importDir;
    this.defaultNs = defaultNs;
  }

  public void doImport() throws IOException {
    Model model = datasetService.getModel();

    for (Path path : getMarkdownFiles(importDir)) {
      Resource subject = model.createResource(defaultNs + getBaseName(path.getFileName().toString()));
      for (String line : Files.lines(path).toList()) {
        String predicateLocalName = line.trim().split(" ")[0];
        Property predicate = model.createProperty(defaultNs + predicateLocalName);
        String restOfLine = line.trim().substring(predicateLocalName.length()).trim();
        String objectRaw;
        String rdfStarPart = null;
        if (restOfLine.contains(">>")) {
          objectRaw = restOfLine.split(">>")[0].trim();
          rdfStarPart = restOfLine.split(">>")[1].trim();
        } else {
          objectRaw = restOfLine;
        }
        RDFNode object = extractObject(objectRaw, model);
        model.add(subject, predicate, object);

        if (rdfStarPart == null) continue;

        String predicateLocalNameRdfStar = rdfStarPart.split(" ")[0];
        Property predicateRdfStar = model.createProperty(defaultNs + predicateLocalNameRdfStar);
        String rdfStarObjectRaw = rdfStarPart.trim().substring(predicateLocalNameRdfStar.length()).trim();
        Statement stmt = model.createStatement(subject, predicate, object);
        model.add(model.createResource(stmt), predicateRdfStar, extractObject(rdfStarObjectRaw, model));
      }
    }
  }

  private List<Path> getMarkdownFiles(Path dir) throws IOException {
    return Files.walk(dir)
        .filter(Files::isRegularFile)
        .filter(path -> !path.toString().contains(".Trash"))
        .filter(path -> FilenameUtils.isExtension(path.toString(), "md"))
        .toList();
  }

  private RDFNode extractObject(String objectRaw, Model model) {
    if (objectRaw.startsWith("\"")) {
      // TODO support date type
      return model.createLiteral(objectRaw.substring(1, objectRaw.length() - 1));
    }
    if (objectRaw.startsWith("[[")) {
      return model.createResource(defaultNs + objectRaw.substring(2, objectRaw.length() - 2));
    }
    return model.createResource(defaultNs + objectRaw);
  }
}
