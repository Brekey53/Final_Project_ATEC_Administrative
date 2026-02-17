import { useEffect, useMemo, useState } from "react";
import {
  getDisponibilidadeFormador,
  getHorariosFormador,
} from "../services/shedules/FormadorDisponibilidadeService";
import "../css/schedule.css";

type Disponibilidade = {
  data: string;
  horaInicio: string;
  horaFim: string;
};

type Horario = Disponibilidade;

type Bloco = Disponibilidade & {
  dia: string;
  ocupado: boolean;
};

const normalizarData = (d: string) => d.split("T")[0];

const horaParaMin = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
};

// Confirmar se duas datas se cruzam
const overlap = (
  aInicio: string,
  aFim: string,
  bInicio: string,
  bFim: string,
) =>
  horaParaMin(aInicio) < horaParaMin(bFim) &&
  horaParaMin(aFim) > horaParaMin(bInicio);

//Devolver os dias úteis
const getSemana = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);

  return Array.from({ length: 5 }, (_, i) => {
    const dia = new Date(d);
    dia.setDate(d.getDate() + i);
    return dia.toISOString().split("T")[0];
  });
};

/**
 * Componente que pré-visualiza a disponibilidade de um formador para uma data específica.
 * Cruza a disponibilidade definida com os horários já atribuídos.
 * @param props.data - Data de referência.
 * @param props.idFormador - ID do formador a verificar.
 */
export default function FormadorDisponibilidadePreview({
  data,
  idFormador,
}: {
  data: string;
  idFormador: string;
}) {
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    if (!idFormador) return;

    Promise.all([
      getDisponibilidadeFormador(+idFormador),
      getHorariosFormador(+idFormador),
    ]).then(([disp, hor]) => {
      setDisponibilidade(disp);
      setHorarios(hor);
    });
  }, [idFormador]);

  const blocosPorDia = useMemo(() => {
    if (!data) return [];

    const semana = getSemana(new Date(data));

    return semana.map((dia) => {
      const dispDia = disponibilidade.filter(
        (d) => normalizarData(d.data) === dia,
      );

      const horDia = horarios.filter((h) => normalizarData(h.data) === dia);

      const blocos: Bloco[] = dispDia.map((d) => ({
        ...d,
        dia,
        ocupado: horDia.some((h) =>
          overlap(d.horaInicio, d.horaFim, h.horaInicio, h.horaFim),
        ),
      }));

      return { dia, blocos };
    });
  }, [data, disponibilidade, horarios]);

  const temBlocos = blocosPorDia.some((d) => d.blocos.length > 0);

  return (
    <div className="card border-0 shadow-sm p-2 disponibilidade-preview w-100">
      <h6 className="fw-bold mb-2">Disponibilidade do Formador</h6>

      {!temBlocos && (
        <p className="text-muted small">
          Sem disponibilidade registada nesta semana.
        </p>
      )}

      {blocosPorDia.map(({ dia, blocos }) =>
        blocos.length === 0 ? null : (
          <div key={dia} className="mb-2">
            <div className="small fw-bold text-muted mb-1">
              {new Date(dia).toLocaleDateString("pt-PT", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
              })}
            </div>

            {blocos.map((b, i) => (
              <div
                key={i}
                className={`d-flex justify-content-between align-items-center px-2 py-1 mb-1 rounded disponibilidade-item ${
                  b.ocupado
                    ? "bg-danger-subtle text-danger"
                    : "bg-success-subtle text-success"
                }`}
              >
                <span>
                  {b.horaInicio} – {b.horaFim}
                </span>
                <span className="fw-semibold">
                  {b.ocupado ? "Ocupado" : "Livre"}
                </span>
              </div>
            ))}
          </div>
        ),
      )}
    </div>
  );
}
