import { queryTemplates } from "../data/query-templates";
import { Link } from "react-router-dom";

function Main() {

  return (
    <div>
      <strong>Templates:</strong>
      { queryTemplates.map(t =>
          <div key={t.id}>
            <Link to={"/template/" + t.id}>{t.title}</Link>
          </div>
      )}
    </div>
  );
}

export default Main;
