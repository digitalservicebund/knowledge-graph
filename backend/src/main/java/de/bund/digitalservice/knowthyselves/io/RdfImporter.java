package de.bund.digitalservice.knowthyselves.io;

import de.bund.digitalservice.knowthyselves.DatasetService;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.TxnType;
import org.apache.jena.rdf.model.Model;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class RdfImporter {
  private final Logger logger = LogManager.getLogger(RdfImporter.class);

  public void doImport(DatasetService datasetService, String turtleFileContent, String dataset) {
    Dataset ds = datasetService.getDataset(dataset);
    ds.begin(TxnType.WRITE);
    Model model = ds.getDefaultModel();
    try(InputStream inputStream = new ByteArrayInputStream(turtleFileContent.getBytes())) {
      model.read(inputStream, null, "TURTLE");
      ds.commit();
    } catch (Exception e) {
      ds.abort();
      logger.error(e);
    } finally {
      ds.end();
    }
  }
}
