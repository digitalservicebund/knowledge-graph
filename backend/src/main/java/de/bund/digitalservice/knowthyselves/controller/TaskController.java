package de.bund.digitalservice.knowthyselves.controller;

import de.bund.digitalservice.knowthyselves.TaskService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/knowthyselves/task")
@CrossOrigin(origins = "*")
public class TaskController {

  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @PostMapping(value = "")
  public ResponseEntity<String> task(@RequestBody Map<String, String> request) {
    String task = request.get("task");
    if (task.equals("move-triples-with-predicate-to-another-dataset")) {
      return ResponseEntity.ok(taskService.moveTriplesWithPredicateToAnotherDataset(
          request.get("from"), request.get("to"), request.get("predicate")
      ));
    }
    return ResponseEntity.internalServerError().body("Task unknown: " + task);
  }
}
