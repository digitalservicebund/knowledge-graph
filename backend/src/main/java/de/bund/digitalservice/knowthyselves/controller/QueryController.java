package de.bund.digitalservice.knowthyselves.controller;

import de.bund.digitalservice.knowthyselves.QueryService;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/knowthyselves/query")
@CrossOrigin(origins = "http://localhost:3000")
public class QueryController {
  private final Logger logger = LogManager.getLogger(QueryController.class);

  private final QueryService queryService;

  public QueryController(QueryService queryService) {
    this.queryService = queryService;
  }

  @PostMapping(value = "")
  public ResponseEntity<String> runQuery(@RequestBody Map<String, String> request) {
    return ResponseEntity.ok(queryService.runQuery(request.get("query")));
  }
}
