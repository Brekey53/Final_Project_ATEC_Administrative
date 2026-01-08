import React from "react";

interface Curso {
  id_curso: number;
  id_area: number;
  nome: string;
}

const cursosIniciais = [
  { id_curso: 1, id_area: 1, nome: "TPSI" },
  { id_curso: 2, id_area: 1, nome: "CISEG" },
  { id_curso: 3, id_area: 1, nome: "REDES" },
];

export default function Cursos() {
  const [cursos, setCursos] = React.useState<Curso[]>(cursosIniciais);
  const [filtro, setFiltro] = React.useState("");

  const cursosFiltrados = cursos.filter((cursos) =>
    cursos.nome.toLocaleLowerCase().includes(filtro.toLocaleLowerCase())
  );

  return (
    <div className="container mt-4 mb-5">
      <div className="text-center mb-5">
        <h2 className="mb-3 text-muted fw-bold">Cursos</h2>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg shadow-sm"
              placeholder="Pesquisar curso"
              id="textFilter"
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <div className="card h-100 shadow border-0 rounded-4 mb-5">
            <div className="card-body d-flex flex-column text-start">
              <h5 className="card-title fw-bold"> Cursos disponiveis</h5>
              <p className="card-text text-muted small"> bues!</p>

              {cursosFiltrados.length === 0 ? (
                <div className="text-center mt-5 text-muted">
                  <h3>Nenhum curso encontrado</h3>
                </div>
              ) : (
                <div className="row g-4">
                  {cursosFiltrados.map((curso) => (
                    <div
                      className="col-md-3 h-100 rounded-4 shadow-sm p-2"
                      key={curso.id_curso}
                    >
                      {curso.nome}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
