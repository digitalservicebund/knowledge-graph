package de.bund.digitalservice.knowthyselves.io;

import de.bund.digitalservice.knowthyselves.DatasetService;
import de.bund.digitalservice.knowthyselves.controller.PlainTriple;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PlainTripleImporter {

    private final String defaultNs;

    public PlainTripleImporter(@Value("${namespace.default.uri}") String defaultNs) {
        this.defaultNs = defaultNs;
    }

    public void doImport(DatasetService datasetService, List<PlainTriple> triples) {
        Model model = datasetService.getModel("main");
        for (PlainTriple triple : triples) {
            Statement stmt = model.createStatement(
                    model.createResource(defaultNs + triple.subject()),
                    model.createProperty(defaultNs + triple.predicate()),
                    triple.type().equals("uri")
                            ? model.createResource(defaultNs + triple.object())
                            : model.createLiteral(triple.object())
            );
            model.add(stmt);
        }
    }
}
