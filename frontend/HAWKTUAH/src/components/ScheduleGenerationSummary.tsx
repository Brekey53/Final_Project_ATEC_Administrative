import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { ResumoAgendamentoModulo } from "../services/shedules/HorariosService";

/**
 * Propriedades para o resumo da geração de horários.
 */
interface ScheduleGenerationSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ResumoAgendamentoModulo[];
  totalScheduled: number;
}

/**
 * Modal que exibe o resumo da geração automática de horários.
 * Mostra o sucesso/falha de cada módulo e estatísticas gerais.
 */
export default function ScheduleGenerationSummary({
  isOpen,
  onClose,
  summary,
  totalScheduled,
}: ScheduleGenerationSummaryProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-dark">
                Resultado da Geração Automática
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-success d-flex align-items-center mb-4">
                <CheckCircle className="me-2" size={24} />
                <div>
                  <strong>Sucesso!</strong> Foram agendadas{" "}
                  <strong>{totalScheduled}</strong> aulas no total.
                </div>
              </div>

              <h6 className="fw-bold mb-3">Resumo por Módulo:</h6>

              <div className="table-responsive" style={{ maxHeight: "400px" }}>
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Módulo</th>
                      <th scope="col" className="text-center">
                        Prioridade
                      </th>
                      <th scope="col">Formador</th>
                      <th scope="col" className="text-center">
                        Progresso
                      </th>
                      <th scope="col" className="text-center">
                        Estado
                      </th>
                      <th scope="col">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{item.nomeModulo}</td>
                        <td className="fw-bold text-center">
                          {item.prioridades}
                        </td>
                        <td className="text-muted">{item.nomeFormador}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              item.concluidoComSucesso
                                ? "bg-success-subtle text-black border border-success"
                                : "bg-warning-subtle text-black border border-warning"
                            } rounded-pill`}
                          >
                            {item.horasAgendadas} / {item.horasTotais} h
                          </span>
                        </td>
                        <td className="text-center">
                          {item.concluidoComSucesso ? (
                            <CheckCircle className="text-success" size={20} />
                          ) : (
                            <XCircle className="text-danger" size={20} />
                          )}
                        </td>
                        <td>
                          {item.concluidoComSucesso ? (
                            <span className="text-muted small">
                              Agendado com sucesso
                            </span>
                          ) : (
                            <span className="text-danger small fw-bold">
                              {item.descricaoDetalhada}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer border-top-0">
              <button
                type="button"
                className="btn btn-secondary px-4 rounded-pill"
                onClick={onClose}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
