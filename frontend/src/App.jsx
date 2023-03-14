import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./view/Main";
import Template from "./view/Template";

function App() {
  return (
      <div style={{display: "flex",  justifyContent: "center", alignItems: "center"}}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main />}/>
            <Route path="/template/:id" element={<Template />}  />
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
