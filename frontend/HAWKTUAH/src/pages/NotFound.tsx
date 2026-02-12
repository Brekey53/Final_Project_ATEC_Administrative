import FOTOERRO from "../img/errorImg.png";
import "../css/notFound.css";

export default function NotFound() {
  return (
    <div className="container mt-2">
      <div className="d-flex flex-column align-items-center">
        <div className="divImg">
          <img className="imgErro" src={FOTOERRO} />
        </div>
        <div>
          <h1 className="error-code">Erro 404</h1>
        </div>
      </div>
    </div>
  );
}
