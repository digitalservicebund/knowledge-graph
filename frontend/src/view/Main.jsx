import { queryTemplates } from "../data/query-templates";
import { Link } from "react-router-dom";

function Main() {
  return (
    <div>
      <br/>
      <h2>KnowThyselves</h2>
      <br/>
      <Link to={"/add"}>Add triples</Link>
      <br/>
      <br/>
      <strong>Templates</strong>
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

export default Main;
