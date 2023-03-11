package de.bund.digitalservice.knowthyselves;

import jakarta.annotation.PreDestroy;
import java.nio.file.Path;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.tdb.TDBFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatasetController {
  private final Logger logger = LogManager.getLogger(DatasetController.class);

  private final Dataset dataset;
  private final Model model;

  public DatasetController(@Value("${TDB_DIR}") Path tbd) {
    dataset = TDBFactory.createDataset(tbd.toString());
    logger.info("Dataset loaded from: {}", tbd);
    model = dataset.getDefaultModel();
  }

  @PreDestroy
  private void close() {
    model.close();
    dataset.close();
  }
}
