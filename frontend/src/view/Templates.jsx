import { queryTemplates } from "../data/query-templates";
import { Link } from "react-router-dom";

function Templates() {
  return (
      <div>
        <br/><br/>
        <h2>Templates</h2>
        <ul>
          { queryTemplates.map(t =>
              <li key={t.id}>
                <Link to={"/template/" + t.id}>{t.title}</Link>
              </li>
          )}
        </ul>
      </div>
  );
}

export default Templates;
