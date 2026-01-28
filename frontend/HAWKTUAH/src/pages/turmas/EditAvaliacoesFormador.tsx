import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTurmaAvaliacao,
  postTurmaAvaliacao
} from "../../services/turmas/TurmasService";

type AvaliacaoAlunoDTO = {
  idInscricao: number;
  idFormando: number;
  nomeFormando: string;
  nota: number | null;
};

export default function EditAvaliacoesFormador() {
  const { turmaId, moduloId } = useParams();

  const [alunos, setAlunos] = useState<AvaliacaoAlunoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!turmaId || !moduloId) return;

    setLoading(true);

    getTurmaAvaliacao(Number(turmaId), Number(moduloId))
      .then(setAlunos)
      .catch(() => setError("Erro ao carregar alunos"))
      .finally(() => setLoading(false));
  }, [turmaId, moduloId]);

  const atualizarNota = (idInscricao: number, nota: string) => {
    const valor = nota === "" ? null : Number(nota);

    if (valor !== null && (valor < 0 || valor > 20)) return;

    setAlunos(prev =>
      prev.map(a =>
        a.idInscricao === idInscricao ? { ...a, nota: valor } : a
      )
    );
  };

  const guardar = async () => {
    setSaving(true);

    const payload = alunos
      .filter(a => a.nota !== null)
      .map(a => ({
        idInscricao: a.idInscricao,
        idModulo: Number(moduloId),
        nota: a.nota!
      }));

    try {
      await postTurmaAvaliacao(payload);
      alert("Avaliações guardadas com sucesso");
    } catch {
      alert("Erro ao guardar avaliações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>A carregar alunos…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Avaliação do Módulo</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          {alunos.map(a => (
            <div
              key={a.idInscricao}
              className="d-flex justify-content-between align-items-center mb-3"
            >
              <span>{a.nomeFormando}</span>

              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={a.nota ?? ""}
                onChange={e =>
                  atualizarNota(a.idInscricao, e.target.value)
                }
                className="form-control w-25"
              />
            </div>
          ))}

          <button
            onClick={guardar}
            className="btn btn-primary mt-3"
            disabled={saving}
          >
            {saving ? "A guardar…" : "Guardar Avaliações"}
          </button>
        </div>
      </div>
    </div>
  );
}

