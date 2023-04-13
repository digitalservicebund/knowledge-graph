package de.bund.digitalservice.knowthyselves.controller;

import de.bund.digitalservice.knowthyselves.DatasetService;
import de.bund.digitalservice.knowthyselves.io.MarkdownImporter;
import de.bund.digitalservice.knowthyselves.io.PlainTripleImporter;
import de.bund.digitalservice.knowthyselves.io.RdfExporter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/knowthyselves/io")
@CrossOrigin(origins = "http://localhost:3000")
public class ImportExportController {
  private final Logger logger = LogManager.getLogger(ImportExportController.class);

  private final DatasetService datasetService;

  private final MarkdownImporter markdownImporter;
  private final RdfExporter rdfExporter;
  private final PlainTripleImporter plainTripleImporter;

  public ImportExportController(DatasetService datasetService, MarkdownImporter markdownImporter, RdfExporter rdfExporter, PlainTripleImporter plainTripleImporter) {
    this.datasetService = datasetService;
    this.markdownImporter = markdownImporter;
    this.rdfExporter = rdfExporter;
    this.plainTripleImporter = plainTripleImporter;
  }

  @PostMapping(value = "/import-plain-triples")
  public String importPlainTriples(@RequestBody List<PlainTriple> triples) {
    logger.info("importing {} triples", triples.size());
    plainTripleImporter.doImport(datasetService, triples);
    return "Received and imported " + triples.size() + " triples";
  }

  @PostMapping(value = "/import")
  public String importFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format").toLowerCase();
    logger.info("import using format {}", format);

    if (format.equals("markdown")) {
      try {
        markdownImporter.doImport(datasetService, null);
        return format + "-import successful";
      } catch (IOException e) {
        logger.error("{}-import failed", format, e);
        return format + "-import failed: " + e.getMessage();
      }
    }
    return "Format " + format + " is unknown";
  }

  @PostMapping(value = "/export")
  public String exportFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format").toLowerCase();
    logger.info("export using format {}", format);

    if (format.equals("rdf/turtle")) {
      try {
        rdfExporter.doExport(datasetService);
        return format + "-export successful";
      } catch (FileNotFoundException e) {
        logger.error("{}-export failed", format, e);
        return format + "-export failed: " + e.getMessage();
      }
    }
    return "Format " + format + " is unknown.";
  }
}
