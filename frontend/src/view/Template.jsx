import { useParams } from "react-router-dom";

function Template() {
  let { id } = useParams();

  return (
      <div>
        template id: {id}
      </div>
  );
}

export default Template;
