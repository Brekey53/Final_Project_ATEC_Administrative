import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { postNewCurso } from "../../services/cursos/CursosService";
import { useNavigate } from "react-router-dom";

export default function AddNewCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !area) {
      toast.error("Preenche todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    const payload = {
      nome,
      idArea: Number(area),
      descricao,
    };

    try {
      await postNewCurso(payload);

      toast.success("Curso criado com sucesso!");
      navigate(-1);
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.errors) {
        Object.values(errorData.errors)
          .flat()
          .forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorData?.message || "Erro ao criar curso.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registar Novo Curso</h2>
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row">
        {/* COLUNA ESQUERDA: ICONE/RESUMO */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light">
            <div className="display-1 text-primary mb-3">
              <i className="bi bi-book"></i>
              Curso 📚
            </div>
            <h5>Informação do Curso</h5>
            <p className="text-muted small">
              Preencha os detalhes técnicos do Curso. O código de curso deve ser
              único (Ex: 1).
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Dados Técnicos</h5>

            <div className="row">
              {/* NOME DO MÓDULO */}
              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold">Nome do Curso</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Ex: Técnico/a de Programação"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              {/* SELECT PARA ÁREA DO CURSO */}
              <div className="mb-3 col-md-6">
                <label className="form-label fw-semibold">Área do Curso</label>
                <select
                  className="form-select"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="">Selecionar área</option>
                  <option value="1">Informática</option>
                  <option value="2">Mecânica</option>
                  <option value="3">Eletrónica</option>
                  <option value="4">Gestão</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Descrição</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Breve descrição do curso..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5"
                disabled={loading}
              >
                {loading ? "A processar..." : "Criar Curso"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
