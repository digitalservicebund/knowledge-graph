package de.bund.digitalservice.knowthyselves;

import de.bund.digitalservice.knowthyselves.io.MarkdownImporter;
import de.bund.digitalservice.knowthyselves.io.RdfExporter;
import java.io.FileNotFoundException;
import java.io.IOException;
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

  private final MarkdownImporter markdownImporter;
  private final RdfExporter rdfExporter;

  public ImportExportController(MarkdownImporter markdownImporter, RdfExporter rdfExporter) {
    this.markdownImporter = markdownImporter;
    this.rdfExporter = rdfExporter;
  }

  @PostMapping(value = "/import")
  public String importFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format").toLowerCase();
    logger.info("import using format {}", format);

    if (format.equals("markdown")) {
      try {
        markdownImporter.doImport();
        return format + "-import successful";
      } catch (IOException e) {
        logger.error("{}-import failed", format, e);
        return format + "-import failed: " + e.getMessage();
      }
    }
    return "Format " + format + " is unknown.";
  }

  @PostMapping(value = "/export")
  public String exportFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format").toLowerCase();
    logger.info("export using format {}", format);

    if (format.equals("rdf/turtle")) {
      try {
        rdfExporter.doExport();
        return format + "-export successful";
      } catch (FileNotFoundException e) {
        logger.error("{}-export failed", format, e);
        return format + "-export failed: " + e.getMessage();
      }
    }
    return "Format " + format + " is unknown.";
  }
}
