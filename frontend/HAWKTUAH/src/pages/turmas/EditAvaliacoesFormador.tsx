import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTurmaAvaliacao,
  postTurmaAvaliacao,
  type AvaliacaoAlunoDTO,
} from "../../services/turmas/TurmasService";
import { toast } from "react-hot-toast";
import "../../css/editAvaliacoesFormador.css";
import "../../css/layoutTabelas.css";
import { Search } from "lucide-react";
import { normalizarTexto } from "../../utils/stringUtils";



export default function EditAvaliacoesFormador() {
  const navigate = useNavigate();
  const { turmaId, moduloId } = useParams();

  const [alunos, setAlunos] = useState<AvaliacaoAlunoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

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
        toast.error("Erro ao carregar alunos", { id: "erroCarreAluns" });
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
    normalizarTexto(a.nomeFormando).includes(normalizarTexto(searchTerm)),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(alunosFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const alunosPaginados = alunosFiltrados.slice(startIndex, endIndex);

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

        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
          <button className="btn btn-light border" onClick={() => navigate(-1)}>
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
      <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
        <div className="row g-2 align-items-center p-2">
          <div className="col-md-12">
            <div className="input-group bg-white rounded-3 border px-2">
              <span className="input-group-text bg-white border-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 bg-white shadow-none py-2"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
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
            alunosPaginados.map((a) => (
              <div key={a.idInscricao} className="avaliacao-row">
                <div className="avaliacao-aluno">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {a.nomeFormando.charAt(0)}
                  </div>
                  <span>{a.nomeFormando}</span>
                </div>

                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.01}
                  value={a.nota ?? "0"}
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

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 py-4">
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Anterior
          </button>

          <span className="text-muted">
            Página {currentPage} de {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Seguinte
          </button>
        </div>
      )}

      <p className="text-muted small text-center mt-1">
        {alunosFiltrados.length} formando(s) encontrado(s)
      </p>
    </div>
  );
}
