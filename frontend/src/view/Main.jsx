import { queryTemplates } from "../data/query-templates";
import { Link } from "react-router-dom";

function Main() {

  return (
    <div>
      <br/>
      <strong style={{margin: "20px"}}>Templates</strong>
      <br/><br/>
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
