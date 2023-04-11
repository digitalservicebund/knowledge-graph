package de.bund.digitalservice.knowthyselves;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.apache.jena.rdf.model.Model;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class QueryService {
  private final Logger logger = LogManager.getLogger(QueryService.class);

  private final DatasetService datasetService;

  public QueryService(DatasetService datasetService) {
    this.datasetService = datasetService;
  }

  public String runQuery(String query) {
    logger.info("Running query {}", query);

    Model model = datasetService.getModel("demo");

    try(QueryExecution queryExecution = QueryExecutionFactory.create(query, model)) {
      ResultSet resultSet = queryExecution.execSelect();
      OutputStream outStream = new ByteArrayOutputStream();
      ResultSetFormatter.outputAsJSON(outStream, resultSet);
      return outStream.toString();
    }
  }
}
