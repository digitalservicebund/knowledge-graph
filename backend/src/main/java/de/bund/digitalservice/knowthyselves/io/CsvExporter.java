package de.bund.digitalservice.knowthyselves.io;

import de.bund.digitalservice.knowthyselves.DatasetService;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.TxnType;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.springframework.stereotype.Component;

@Component
public class CsvExporter {

  public String doExport(DatasetService datasetService, String dataset) {
    Dataset ds = datasetService.getDataset(dataset);
    ds.begin(TxnType.READ);
    StringBuilder csv = new StringBuilder("subject,predicate,object\n");
    StmtIterator iter = ds.getDefaultModel().listStatements();
    while (iter.hasNext()) {
      Statement stmt = iter.next();
      csv
          .append("\"")
          .append(stmt.getSubject().toString())
          .append("\",\"")
          .append(stmt.getPredicate().toString())
          .append("\",\"")
          .append(stmt.getObject().toString())
          .append("\"\n");
    }
    ds.end();
    return csv.toString();
  }
}
