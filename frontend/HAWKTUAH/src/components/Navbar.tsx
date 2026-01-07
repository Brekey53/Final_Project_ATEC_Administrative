export default function Navbar() {
  return (
    <>
      <nav className="bg-light">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="left-side-navbar d-flex align-items-center gap-4">
            <p>Imagem</p>
            <h2 className="mb-0">Atec Manager</h2>

            <div className="nav-links d-flex gap-3">
              <p className="mb-0">Dashboard</p>
              <p className="mb-0">Cursos</p>
              <p className="mb-0">Formandos</p>
              <p className="mb-0">Formadores</p>
              <p className="mb-0">Horários</p>
              <p className="mb-0">Assistente IA</p>
            </div>
          </div>

          <div className="right-side-navbar d-flex align-items-center gap-3">
            <p className="mb-0">Backoffice</p>
            <p className="mb-0">Imagem do Perfil</p>
          </div>
        </div>
      </nav>
    </>
  );
}
