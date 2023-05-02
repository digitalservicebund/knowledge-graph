package de.bund.digitalservice.knowthyselves.io;

import de.bund.digitalservice.knowthyselves.DatasetService;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.TxnType;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RdfExporter {

  private final Path exportDir;

  public RdfExporter(@Value("${exporter.default.directory}") Path exportDir) {
    this.exportDir = exportDir;
  }

  public String doExport(DatasetService datasetService, String dataset) {
    Dataset ds = datasetService.getDataset(dataset);
    ds.begin(TxnType.READ);
    Model model = ds.getDefaultModel();
    // exportDir.toFile().mkdirs();
    // File exportFile = exportDir.resolve("main-" + getTimestamp() + ".ttls").toFile();
    // FileOutputStream fos = new FileOutputStream(exportFile);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    RDFDataMgr.write(out, model, Lang.TURTLE);
    ds.end();
    return out.toString();
  }

  public String getTimestamp() {
    return new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
  }
}
