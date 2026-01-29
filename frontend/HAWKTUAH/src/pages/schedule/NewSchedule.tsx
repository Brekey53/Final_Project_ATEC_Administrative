import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getHorariosTotal,
  type Horario,
} from "../../services/shedules/HorariosService";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function NewSchedule() {
  const [dataSelecionada, setDataSelecionada] = useState<Value>(new Date());
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);

  const formatarData = (data: any) => {
    if (!(data instanceof Date)) return "";
    return data.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    async function fetchHorarios() {
      setLoading(true);

      try {
        const data = await getHorariosTotal();

        console.log(data);

        setHorarios(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHorarios();
    console.log();
  }, []);

  const horariosFiltrados = horarios.filter((h) => {
    if (!(dataSelecionada instanceof Date)) return false;

    const dataDoEvento = new Date(h.data).toLocaleDateString("pt-PT");

    const dataAlvo = dataSelecionada.toLocaleDateString("pt-PT");

    return dataDoEvento === dataAlvo;
  });

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-hs-* gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Horários</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar horários.
          </p>
        </div>
        <Link to="adicionar-horarios">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Horário
          </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Horários..."
          />
        </div>
      </div>

      <div className="row g-4">
        {" "}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 p-3">
            <h5 className="text-center">Calendário</h5>
            <div>
              <Calendar
                onChange={setDataSelecionada}
                value={dataSelecionada}
                locale="pt-PT"
                className="border-1 w-100"
              />
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 p-5 text-center">
            <h6 className="text-center">
              Horários para <strong>{formatarData(dataSelecionada)}</strong>
            </h6>

            <div className="py-5">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">A carregar...</span>
                  </div>
                  <p className="mt-2 text-muted">A procurar horários...</p>
                </div>
              ) : horariosFiltrados.length > 0 ? (
                <div className="text-start">
                  {horariosFiltrados.map((h) => (
                    <div
                      key={h.idHorario}
                      className="card border-0 bg-light rounded-4 mb-3 shadow-sm"
                    >
                      <div className="card-body d-flex align-items-center p-3">
                        <div
                          className="text-center pe-4 border-end"
                          style={{ minWidth: "100px" }}
                        >
                          <h4
                            className="fw-bold mb-0"
                            style={{ color: "#065f5a" }}
                          >
                            {h.horaInicio}
                          </h4>
                          <small className="text-muted">até {h.horaFim}</small>
                        </div>

                        <div className="ps-4">
                          <h5 className="fw-bold mb-1">
                            {h.nomeTurma || "Aula Técnica"}
                          </h5>
                          <p className="text-muted small mb-2">
                            {h.nomeCurso} || <strong>{h.nomeModulo}</strong>
                          </p>

                          <div className="d-flex gap-3 small text-secondary">
                            <span>
                              <i className="bi bi-person me-1"></i> Formador:{" "}
                              <strong>{h.nomeFormador}</strong>
                            </span>
                            <span>
                              <i className="bi bi-geo-alt me-1"></i> Sala:{" "}
                              <strong>{h.nomeSala}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <i className="bi bi-calendar-x display-1 text-muted"></i>
                  <p className="mt-3 text-muted">
                    Nenhum horário para este dia
                  </p>
                  <Link to="/adicionar-horarios">
                    <button className="btn btn-outline-primary rounded-pill">
                      + Adicionar Horário
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
