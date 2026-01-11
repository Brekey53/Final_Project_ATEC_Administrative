import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <>
      <div className="container">
        <div className="title-dashboard d-flex justify-content-between w-100">
          <div className="title-dashboard-left ">
            <h2>
              Dasboard
              <br />
            </h2>
            <span className="text-muted">
              Informação Rápida sobre o Sistema
            </span>
          </div>
          <div className="title-dashboard-right justify-content-end">
            <Link to="/assistenteAI" className="btn rounded">Assistente AI</Link>
            <Link to="/horarios" className="btn rounded">Ver Horários</Link>
          </div>
        </div>
        <div className="mt-5">
          aqui vai ser vários cards feito em componente
        </div>
        <div className="mt-5">2 CARDS   </div>
        <div className="mt-5">Cursos por área</div>
      </div>
    </>
  );
}
