import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTurmaAvaliacao,
  postTurmaAvaliacao,
} from "../../services/turmas/TurmasService";
import { toast } from "react-hot-toast";
import "../../css/EditAvaliacoesFormador.css";

type AvaliacaoAlunoDTO = {
  idInscricao: number;
  idFormando: number;
  nomeFormando: string;
  nota: number | null;
};

export default function EditAvaliacoesFormador() {
  const navigate = useNavigate();
  const { turmaId, moduloId } = useParams();

  const [alunos, setAlunos] = useState<AvaliacaoAlunoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!turmaId || !moduloId) {
      setLoading(false);
      return;
    }

    async function fetchAlunos() {
      try {
        const data = await getTurmaAvaliacao(Number(turmaId), Number(moduloId));
        setAlunos(data);
      } catch {
        toast.error("Erro ao carregar alunos");
      } finally {
        setLoading(false);
      }
    }

    fetchAlunos();
  }, [turmaId, moduloId]);

  const atualizarNota = (idInscricao: number, valor: string) => {
    const nota = valor === "" ? null : Number(valor);
    if (nota !== null && (nota < 0 || nota > 20)) return;

    setAlunos((prev) =>
      prev.map((a) => (a.idInscricao === idInscricao ? { ...a, nota } : a)),
    );
  };

  const guardarAvaliacoes = async () => {
    setSaving(true);

    const payload = alunos
      .filter((a) => a.nota !== null)
      .map((a) => ({
        idInscricao: a.idInscricao,
        idModulo: Number(moduloId),
        nota: a.nota!,
      }));

    try {
      await postTurmaAvaliacao(payload);
      toast.success("Avaliações guardadas com sucesso", {
        id: "save-avaliacoes",
      });
    } catch {
      toast.error("Erro ao guardar avaliações", {
        id: "error-saving-avaliacoes",
      });
    } finally {
      setSaving(false);
      navigate(-1);
    }
  };

  const alunosFiltrados = alunos.filter((a) =>
    a.nomeFormando.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Avaliação do Módulo</h2>
          <p className="text-muted mb-0">
            Atribuir ou alterar a nota final dos formandos
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary px-4 py-2 rounded-pill"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>

          <button
            className="btn btn-success px-4 py-2 rounded-pill"
            onClick={guardarAvaliacoes}
            disabled={saving}
          >
            {saving ? "A guardar…" : "Guardar Avaliações"}
          </button>
        </div>
      </div>

      {/* PESQUISA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar formando…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          {/* HEADER */}
          <div className="avaliacao-header">
            <span>Formando</span>
            <span>Nota Final</span>
          </div>

          {/* LINHAS */}
          {!loading && alunosFiltrados.length > 0 ? (
            alunosFiltrados.map((a) => (
              <div key={a.idInscricao} className="avaliacao-row">
                <div className="avaliacao-aluno">
                  <div className="avaliacao-avatar">
                    {a.nomeFormando.charAt(0)}
                  </div>
                  <span>{a.nomeFormando}</span>
                </div>

                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.25}
                  value={a.nota ?? ""}
                  onChange={(e) => atualizarNota(a.idInscricao, e.target.value)}
                  className="avaliacao-input"
                />
              </div>
            ))
          ) : loading ? (
            <div className="p-5 text-center text-muted">A carregar alunos…</div>
          ) : (
            <div className="p-5 text-center text-muted">
              Nenhum formando encontrado
            </div>
          )}
        </div>
      </div>

      <p className="text-muted small text-center mt-5">
        {alunosFiltrados.length} formando(s)
      </p>
    </div>
  );
}
