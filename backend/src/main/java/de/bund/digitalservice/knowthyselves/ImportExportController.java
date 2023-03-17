package de.bund.digitalservice.knowthyselves;

import de.bund.digitalservice.knowthyselves.io.MarkdownImporter;
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
@RequestMapping("api/v1/knowthyselves")
@CrossOrigin(origins = "http://localhost:3000")
public class ImportExportController {
  private final Logger logger = LogManager.getLogger(ImportExportController.class);

  private final MarkdownImporter markdownImporter;

  public ImportExportController(MarkdownImporter markdownImporter) {
    this.markdownImporter = markdownImporter;
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
}
