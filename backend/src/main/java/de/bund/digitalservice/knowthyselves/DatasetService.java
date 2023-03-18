package de.bund.digitalservice.knowthyselves;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PreDestroy;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.fuseki.main.FusekiServer.Builder;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.tdb.TDBFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatasetService {
  private final Logger logger = LogManager.getLogger(DatasetService.class);

  private final List<String> initialDatasetNames = List.of("main", "demo");
  private final Map<String, Dataset> datasets = new HashMap<>();
  private final Map<String, Model> models = new HashMap<>();
  private final FusekiServer fusekiServer;

  public DatasetService(
      @Value("${tdb.dir}") Path tbd,
      @Value("${namespace.default.uri}") String defaultNs,
      @Value("${namespace.default.prefix}") String defaultNsPrefix
  ) {
    tbd.toFile().mkdirs();
    Builder fusekiServerBuilder = FusekiServer.create();

    for (String dsName : initialDatasetNames) {
      Path path = tbd.resolve(dsName);
      boolean addDemoData = dsName.equals("demo") && !Files.exists(path);
      Dataset ds = TDBFactory.createDataset(path.toString());
      datasets.put(dsName, ds);
      logger.info("Dataset {} loaded from: {}", dsName, path);

      Model model = ds.getDefaultModel();
      model.setNsPrefix(defaultNsPrefix, defaultNs);
      if (addDemoData) {
        try {
          File demoDataFile = Paths.get("backend").resolve("data").resolve("demo-data.ttls").toFile();
          RDFDataMgr.read(model, new FileInputStream(demoDataFile), Lang.TURTLE);
          logger.info("Added demo-data to dataset {}", dsName);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          logger.error("Failed to add demo data to dataset {}", dsName);
        }
      }
      models.put(dsName, model);
      logger.info("Triples in the default model of dataset {}:", dsName);
      model.listStatements().forEachRemaining(logger::info);

      fusekiServerBuilder.add("/" + dsName, ds);
    }

    fusekiServer = fusekiServerBuilder.enableCors(true).build().start();
  }

  public Model getModel(String dsName) {
    return models.get(dsName);
  }

  @PreDestroy
  private void close() {
    fusekiServer.stop();
    models.values().forEach(Model::close);
    datasets.values().forEach(Dataset::close);
  }
}
