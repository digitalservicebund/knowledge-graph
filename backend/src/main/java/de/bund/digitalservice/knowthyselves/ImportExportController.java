package de.bund.digitalservice.knowthyselves;

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

  @PostMapping(value = "/import")
  public String importFormat(@RequestBody Map<String, String> request) {
    String format = request.get("format");
    logger.info("import using format {}", format);
    // TODO
    return "Import successful";
  }
}
