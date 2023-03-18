package de.bund.digitalservice.knowthyselves.io;

import de.bund.digitalservice.knowthyselves.DatasetService;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RdfExporter {

  private final DatasetService datasetService;
  private final Path exportDir;

  public RdfExporter(DatasetService datasetService,
      @Value("${exporter.default.directory}") Path exportDir) {
    this.datasetService = datasetService;
    this.exportDir = exportDir;
  }

  public void doExport() throws FileNotFoundException {
    Model model = datasetService.getModel();
    exportDir.toFile().mkdirs();
    File exportFile = exportDir.resolve("main-" + getTimestamp() + ".ttls").toFile();
    FileOutputStream fos = new FileOutputStream(exportFile);
    RDFDataMgr.write(fos, model, Lang.TURTLE);
  }

  public String getTimestamp() {
    return new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
  }
}
