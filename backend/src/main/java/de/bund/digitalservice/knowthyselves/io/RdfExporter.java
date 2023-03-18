package de.bund.digitalservice.knowthyselves.io;

import de.bund.digitalservice.knowthyselves.DatasetController;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.jena.rdf.model.Model;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RdfExporter {

  private final DatasetController datasetController;
  private final Path exportDir;

  public RdfExporter(DatasetController datasetController,
      @Value("${exporter.default.directory}") Path exportDir) {
    this.datasetController = datasetController;
    this.exportDir = exportDir;
  }

  public void doExport() throws FileNotFoundException {
    Model model = datasetController.getModel();
    exportDir.toFile().mkdirs();
    File exportFile = exportDir.resolve("main-" + getTimestamp() + ".ttls").toFile();
    FileOutputStream fos = new FileOutputStream(exportFile);
    model.write(fos, "TURTLE");
  }

  public String getTimestamp() {
    return new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
  }
}
