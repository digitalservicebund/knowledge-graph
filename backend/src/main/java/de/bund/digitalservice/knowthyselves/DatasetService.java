package de.bund.digitalservice.knowthyselves;

import de.bund.digitalservice.knowthyselves.io.MarkdownImporter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PreDestroy;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.tdb.TDBFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatasetService {
  private final Logger logger = LogManager.getLogger(DatasetService.class);

  private final List<String> initialDatasetNames = List.of("main"); // "demo"
  private final Map<String, Dataset> datasets = new HashMap<>();
  private final Map<String, Model> models = new HashMap<>();

  public DatasetService(
      @Value("${tdb.dir}") Path tbd,
      @Value("${namespace.default.uri}") String defaultNs,
      @Value("${namespace.default.prefix}") String defaultNsPrefix,
      MarkdownImporter markdownImporter
  ) {
    tbd.toFile().mkdirs();

    for (String dsName : initialDatasetNames) {
      Path tbdDir = tbd.resolve(dsName);
      boolean addDemoData = dsName.equals("demo") && !Files.exists(tbdDir);
      Dataset ds = TDBFactory.createDataset(tbdDir.toString());
      datasets.put(dsName, ds);
      logger.info("Dataset {} loaded from: {}", dsName, tbdDir);

      Model model = ds.getDefaultModel();
      model.setNsPrefix(defaultNsPrefix, defaultNs);
      models.put(dsName, model);
      if (addDemoData) {
        try {
          Path markdownDir = Paths.get("data/for-demo-20230321/as-markdown");
          markdownImporter.doImport(this, markdownDir);
          logger.info("Added demo-data in markdown format to dataset {} from directory {}", dsName, markdownDir);
        } catch (IOException e) {
          e.printStackTrace();
          logger.error("Failed to add demo data to dataset {}", dsName);
        }
      }
      logger.info("Triples in the default model of dataset {}:", dsName);
      model.listStatements().forEachRemaining(logger::info);
    }
  }

  public Model getModel(String dsName) {
    return models.get(dsName);
  }

  @PreDestroy
  private void close() {
    models.values().forEach(Model::close);
    datasets.values().forEach(Dataset::close);
  }
}
