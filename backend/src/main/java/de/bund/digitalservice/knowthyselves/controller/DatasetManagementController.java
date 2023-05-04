package de.bund.digitalservice.knowthyselves.controller;

import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/knowthyselves/ds")
@CrossOrigin(origins = "*")
public class DatasetManagementController {
  private final Logger logger = LogManager.getLogger(DatasetManagementController.class);

  @PostMapping(value = "/new")
  public String newDataset(@RequestBody Map<String, String> request) {
    String name = request.get("name");
    logger.info("Creating new dataset named {}", name);

    // TODO

    return "New dataset " + name + " created";
  }
}
