package de.bund.digitalservice.knowthyselves;

import java.nio.file.Path;
import javax.annotation.PreDestroy;
import org.apache.jena.fuseki.main.FusekiServer;
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
  private final FusekiServer fusekiServer;

  public DatasetController(
      @Value("${tdb.dir}") Path tbd,
      @Value("${namespace.default.uri}") String defaultNs,
      @Value("${namespace.default.prefix}") String defaultNsPrefix
  ) {
    dataset = TDBFactory.createDataset(tbd.toString());
    logger.info("Dataset loaded from: {}", tbd);

    model = dataset.getDefaultModel();
    model.setNsPrefix(defaultNsPrefix, defaultNs);
    model.listStatements().forEachRemaining(logger::info);
    // RDFDataMgr.write(System.out, model, Lang.TURTLE);

    fusekiServer = FusekiServer.create()
        .add("/", dataset)
        .enableCors(true)
        .build();
    fusekiServer.start();
  }

  public Model getModel() {
    return model;
  }

  @PreDestroy
  private void close() {
    fusekiServer.stop();
    model.close();
    dataset.close();
  }
}
