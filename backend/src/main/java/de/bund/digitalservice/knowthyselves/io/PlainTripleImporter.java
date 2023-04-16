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

    private String uri(String localName) {
        return defaultNs + localName;
    }

    private Statement buildStatement(Model model, String sub, String pred, String obj, String objType) {
        return model.createStatement(
            model.createResource(uri(sub)),
            model.createProperty(uri(pred)),
            objType.equals("uri")
                ? model.createResource(uri(obj))
                : model.createLiteral(obj)
        );
    }

    private Statement buildRDFStarStatement(Model model, Statement subStmt, String pred, String obj, String objType) {
        return model.createStatement(
            model.createResource(subStmt),
            model.createProperty(uri(pred)),
            objType.equals("uri")
                ? model.createResource(uri(obj))
                : model.createLiteral(obj)
        );
    }

    public void doImport(DatasetService datasetService, List<PlainTriple> triples) {
        Model mainModel = datasetService.getModel("main");
        Model metaModel = datasetService.getModel("meta");
        for (PlainTriple triple : triples) {
            Statement stmt;
            String subjectType = triple.subjectType();
            if (subjectType.startsWith("triple")) {
                // ref = the triple that this triple is making a statement about
                String refObjectType = subjectType.substring(subjectType.lastIndexOf("-") + 1);
                String refSubject = triple.subject().split(" ")[0];
                String refPredicate = triple.subject().split(" ")[1];
                String refObject = triple.subject().split(" ")[2];
                Statement refStmt = buildStatement(mainModel, refSubject, refPredicate, refObject, refObjectType);
                stmt = buildRDFStarStatement(mainModel, refStmt, triple.predicate(), triple.object(), triple.objectType());
            } else {
                stmt = buildStatement(mainModel, triple.subject(), triple.predicate(), triple.object(), triple.objectType());
            }
            mainModel.add(stmt);
            metaModel.add(buildRDFStarStatement(metaModel, stmt, "hasImportSource", triple.source(), "literal"));
        }
    }
}
