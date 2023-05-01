package de.bund.digitalservice.knowthyselves;

import java.util.ArrayList;
import java.util.List;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.TxnType;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.SimpleSelector;
import org.apache.jena.rdf.model.Statement;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TaskService {
  private final Logger logger = LogManager.getLogger(TaskService.class);

  private final String allowListed;
  private final DatasetService datasetService;

  public TaskService(@Value("${task.allow-listed}") String allowListed, DatasetService datasetService) {
    this.allowListed = allowListed;
    this.datasetService = datasetService;
  }

  public String moveTriplesWithPredicateToAnotherDataset(String from, String to, String predicate) {
    String predicateLocalName = predicate.substring(predicate.lastIndexOf("#") + 1).trim();
    if (allowListed != null && !allowListed.equalsIgnoreCase(from + "-" + to + "-" + predicateLocalName)) {
      return "This task is not allow-listed";
    }
    logger.info("Moving triples with predicate {} from dataset {} to dataset {}", predicate, from, to);
    Dataset fromDs = datasetService.getDataset(from);
    Dataset toDs = datasetService.getDataset(to);

    int count = 0;
    String response = "";

    fromDs.begin(TxnType.READ);
    Model fromModel = fromDs.getDefaultModel();
    List<Statement> matchingStatements = new ArrayList<>();
    try {
      matchingStatements = fromModel.listStatements(new SimpleSelector(
          null, fromModel.createProperty(predicate), (RDFNode) null)).toList();
      count = matchingStatements.size();
    } catch (Exception e) {
      response += " Error reading statements from dataset " + from + ": " + e.getMessage();
    } finally {
      fromDs.end();
    }

    toDs.begin(TxnType.WRITE);
    Model toModel = toDs.getDefaultModel();
    try {
      toModel.add(matchingStatements);
      toDs.commit();
    } catch (Exception e) {
      toDs.abort();
      response += " Error writing statements to dataset " + to + ": " + e.getMessage();
      logger.error(e);
    } finally {
      toDs.end();
    }

    fromDs.begin(TxnType.WRITE);
    fromModel = fromDs.getDefaultModel();
    try {
      fromModel.remove(matchingStatements);
      fromDs.commit();
    } catch (Exception e) {
      fromDs.abort();
      response += " Error removing statements from dataset " + from + ": " + e.getMessage();
      logger.error(e);
    } finally {
      fromDs.end();
    }

    return response.isEmpty() ?
        ("Successfully moved " + count + " statements with the predicate " + predicate +
        " from the dataset " + from + " to the dataset " + to)
        : response;
  }
}
