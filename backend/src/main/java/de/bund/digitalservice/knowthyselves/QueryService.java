package de.bund.digitalservice.knowthyselves;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import org.apache.jena.graph.Graph;
import org.apache.jena.graph.compose.MultiUnion;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.apache.jena.query.TxnType;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.update.UpdateExecution;
import org.apache.jena.update.UpdateFactory;
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

  public String runSelectQuery(String query, String dataset) {
    logger.info("Running SELECT query {} on dataset {}", query, dataset);

    Dataset ds = switch (dataset) {
      case "main" -> datasetService.getDataset("main");
      case "meta" -> datasetService.getDataset("meta");
      case "both" -> {
        Graph unionGraph = new MultiUnion(
            new Graph[]{
                datasetService.getDataset("main").getDefaultModel().getGraph(),
                datasetService.getDataset("meta").getDefaultModel().getGraph()
            });
        Model unionModel = ModelFactory.createModelForGraph(unionGraph);
        Dataset unionDataset = DatasetFactory.createTxnMem();
        unionDataset.setDefaultModel(unionModel);
        yield unionDataset;
      }
      default -> throw new IllegalArgumentException("Unknown dataset: " + dataset);
    };

    ds.begin(TxnType.READ);
    try (QueryExecution queryExecution = QueryExecutionFactory.create(query, ds)) {
      ResultSet resultSet = queryExecution.execSelect();
      OutputStream outStream = new ByteArrayOutputStream();
      ResultSetFormatter.outputAsJSON(outStream, resultSet);
      return outStream.toString();
    } finally {
      ds.end();
    }
  }

  public String runInsertQuery(String query, String dataset) {
    logger.info("Running INSERT query {} on dataset {}", query, dataset);
    Dataset ds = datasetService.getDataset(dataset);
    ds.begin(TxnType.WRITE);
    String result;
    try {
      UpdateExecution.dataset(ds).update(UpdateFactory.create(query)).execute();
      ds.commit();
      result = "Successfully executed INSERT query";
    } catch (Exception e) {
      ds.abort();
      logger.error(e);
      result = "Failed to execute INSERT query";
    } finally {
      ds.end();
    }
    return result;
  }
}
