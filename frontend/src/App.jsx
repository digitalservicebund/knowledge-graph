import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./component/TopBar";
import Main from "./view/Main";
import Templates from "./view/Templates";
import Template from "./view/Template";
import Query from "./view/Query";
import Data from "./view/Data";
import Schema from "./view/Schema";
import Visualize from "./view/Visualize";

function App() {
  return (
      <BrowserRouter>
        <TopBar />
        <div style={{display: "flex",  justifyContent: "center", alignItems: "center"}}>
          <Routes>
            <Route path="/" element={<Main />}/>
            <Route path="/templates" element={<Templates />}/>
            <Route path="/template/:id" element={<Template />}  />
            <Route path="/query" element={<Query />}/>
            <Route path="/data" element={<Data />}/>
            <Route path="/schema" element={<Schema />}/>
            <Route path="/visualize" element={<Visualize />}/>
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;
