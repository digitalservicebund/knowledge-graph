package de.bund.digitalservice.knowthyselves.controller;

import de.bund.digitalservice.knowthyselves.DatasetService;
import de.bund.digitalservice.knowthyselves.io.CsvExporter;
import de.bund.digitalservice.knowthyselves.io.MarkdownImporter;
import de.bund.digitalservice.knowthyselves.io.PlainTripleImporter;
import de.bund.digitalservice.knowthyselves.io.RdfExporter;
import de.bund.digitalservice.knowthyselves.io.RdfImporter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/knowthyselves/io")
@CrossOrigin(origins = "*")
public class ImportExportController {
  private final Logger logger = LogManager.getLogger(ImportExportController.class);

  private final DatasetService datasetService;

  private final MarkdownImporter markdownImporter;
  private final RdfImporter rdfImporter;
  private final RdfExporter rdfExporter;
  private final CsvExporter csvExporter;
  private final PlainTripleImporter plainTripleImporter;

  public ImportExportController(DatasetService datasetService, MarkdownImporter markdownImporter,
      RdfImporter rdfImporter, RdfExporter rdfExporter, CsvExporter csvExporter, PlainTripleImporter plainTripleImporter) {
    this.datasetService = datasetService;
    this.markdownImporter = markdownImporter;
    this.rdfImporter = rdfImporter;
    this.rdfExporter = rdfExporter;
    this.csvExporter = csvExporter;
    this.plainTripleImporter = plainTripleImporter;
  }

  @PostMapping(value = "/import-plain-triples")
  public ResponseEntity<String> importPlainTriples(@RequestBody @NonNull List<PlainTriple> triples) {
    if (triples.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NO_CONTENT).body("List of triples is empty");
    }
    String source = triples.get(0).source();
    logger.info("Importing {} triples from source {}", triples.size(), source);
    plainTripleImporter.doImport(datasetService, triples);
    return ResponseEntity.ok("Imported " + triples.size() + " triples from source " + source);
  }

  @PostMapping(value = "/import")
  public ResponseEntity<String> importFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format").toLowerCase();
    logger.info("import using format {}", format);

    if (format.equals("markdown")) {
      try {
        markdownImporter.doImport(datasetService, null);
        return ResponseEntity.ok(format + "-import successful");
      } catch (IOException e) {
        logger.error("{}-import failed", format, e);
        return ResponseEntity.internalServerError().body(format + "-import failed: " + e.getMessage());
      }
    }

    if (format.equals("rdf/turtle")) {
      rdfImporter.doImport(datasetService, request.get("turtleFileContent"), request.get("dataset"));
      return ResponseEntity.ok(format + "-import successful");
    }

    return ResponseEntity.internalServerError().body("Format " + format + " is unknown");
  }

  @PostMapping(value = "/export")
  public ResponseEntity<String> exportFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format").toLowerCase();
    String dataset = request.get("dataset").toLowerCase();
    logger.info("export using format {}", format);

    if (format.equals("rdf/turtle")) {
      return ResponseEntity.ok(rdfExporter.doExport(datasetService, dataset));
    }

    if (format.equals("csv")) {
      return ResponseEntity.ok(csvExporter.doExport(datasetService, dataset));
    }

    return ResponseEntity.internalServerError().body("Format " + format + " is unknown.");
  }
}
