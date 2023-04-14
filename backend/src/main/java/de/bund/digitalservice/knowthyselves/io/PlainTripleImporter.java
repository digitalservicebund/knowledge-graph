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
        Model mainModel = datasetService.getModel("main");
        Model metaModel = datasetService.getModel("meta");
        for (PlainTriple triple : triples) {
            Statement mainStmt = mainModel.createStatement(
                    mainModel.createResource(defaultNs + triple.subject()),
                    mainModel.createProperty(defaultNs + triple.predicate()),
                    triple.type().equals("uri")
                            ? mainModel.createResource(defaultNs + triple.object())
                            : mainModel.createLiteral(triple.object())
            );
            mainModel.add(mainStmt);
            metaModel.add(
                metaModel.createResource(mainStmt),
                metaModel.createProperty(defaultNs + "hasImportSource"),
                metaModel.createLiteral(triple.source())
            );
        }
    }
}
