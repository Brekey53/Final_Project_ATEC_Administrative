import "../css/login.css";

export default function Login() {
  return (
    <div className="container-login">
      <div className="row">
        <div className="col-6 col-lg-4 banner-login">
          <div className="ball ball-1"></div>
          <div>
            <p className="eyebrow-login">Manager HAWKTUAH</p>
            <h1 className="title-login">
              Sistema de <br />
              Gestão de Notas
            </h1>
            <p>
              Gerir cursos, formandos, formadores e horários
              <br />
              de forma eficiente e intuitiva
            </p>
            <div className="cards-login">
              <div className="row">
                <div className="col-6">
                  <div className="card-login card-1">
                    <p>Gestão de Formandos</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-login card-2">
                    <p>Horários</p>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="card-login card-3">
                    <p>Cursos e Módulos</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-login card-4">
                    <p>Chatbot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ball ball-2"></div>
        </div>
        <div className="col-6 col-lg-8 credentials-login"></div>
      </div>
    </div>
  );
}
