using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Avaliacao;
using ProjetoAdministracaoEscola.ModelsDTO.Avaliacao.Responses;
using ProjetoAdministracaoEscola.ModelsDTO.Formador.Responses;
using ProjetoAdministracaoEscola.ModelsDTO.Turma.Responses;
using ProjetoAdministracaoEscola.ModelsDTO.TurmaAlocacoes.Request;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TurmaAlocacaoController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public TurmaAlocacaoController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de turmas e módulos atribuídos ao formador autenticado.
        /// </summary>
        /// <remarks>
        /// Para cada alocação são devolvidos:
        /// - Identificação da turma
        /// - Curso associado
        /// - Módulo lecionado
        /// - Total de horas já dadas até à data atual
        /// - Total de horas previstas para o módulo
        /// - Estado atual do módulo:
        ///     • "Para começar" (0 horas dadas)
        ///     • "A decorrer" (horas dadas inferiores ao total)
        ///     • "Terminado" (horas dadas iguais ou superiores ao total)
        ///
        /// Apenas utilizadores com política "Formador" podem aceder.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="TurmaFormadorDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="400">Utilizador autenticado não é formador.</response>
        [HttpGet("turmas/formador")]
        [Authorize(Policy = "Formador")]
        public async Task<ActionResult<IEnumerable<TurmaFormadorDTO>>> GetTurmasDoFormador()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            if (formadorId == 0)
                return BadRequest("Utilizador não é formador");

            var alocacoes = await _context.TurmaAlocacoes
                .Where(a => a.IdFormador == formadorId)
                .Include(a => a.IdTurmaNavigation)
                    .ThenInclude(t => t.IdCursoNavigation)
                .Include(a => a.IdModuloNavigation)
                .ToListAsync();

            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var resultado = alocacoes.Select(a =>
            {
                var horarios = _context.Horarios
                    .Where(h =>
                        h.IdTurma == a.IdTurma &&
                        h.IdCursoModuloNavigation.IdModulo == a.IdModulo &&
                        h.IdFormador == formadorId &&
                        h.Data <= hoje
                    )
                    .ToList();

                var horasDadas = CalcularHorasDadas(horarios);
                var horasTotais = a.IdModuloNavigation.HorasTotais;

                var dataInicio = a.IdTurmaNavigation.DataInicio;
                var dataFim = a.IdTurmaNavigation.DataFim;

                string estado;

                if (horasDadas == 0)
                {
                    estado = "Para começar";
                }
                else if (horasDadas < horasTotais)
                {
                    estado = "A decorrer";
                }
                else
                {
                    estado = "Terminado";
                }


                return new TurmaFormadorDTO
                {
                    IdTurma = a.IdTurma,
                    IdModulo = a.IdModulo,
                    NomeTurma = a.IdTurmaNavigation.NomeTurma,
                    NomeCurso = a.IdTurmaNavigation.IdCursoNavigation.Nome,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    HorasDadas = horasDadas,
                    HorasTotaisModulo = horasTotais,
                    Estado = estado
                };
            })
            .OrderBy(t => t.NomeTurma.Trim())
            .ThenBy(t => t.NomeModulo.Trim())
            .ToList();

            return Ok(resultado);
        }

        /// <summary>
        /// Obtém a lista de turmas e módulos atribuídos a um formador específico.
        /// </summary>
        /// <param name="idFormador">Identificador do formador.</param>
        /// <remarks>
        /// Para cada módulo são devolvidos:
        /// - Horas já dadas
        /// - Horas totais previstas
        /// - Horas já agendadas
        /// - Estado atual com indicação do progresso
        ///
        /// Apenas módulos que ainda não estejam terminados são incluídos na resposta.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="TurmaFormadorModuloCursoDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        /// <response code="400">Formador não encontrado.</response>
        /// <response code="403">Acesso negado.</response> e módulos atribuídos ao formador.
        /// </returns>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("turmas/formador/{idFormador}")]
        public async Task<ActionResult<IEnumerable<TurmaFormadorDTO>>> GetTurmasDoFormador(int idFormador)
        {

            // Validar se o formador existe
            var existeFormador = await _context.Formadores.AnyAsync(f => f.IdFormador == idFormador);
            if (!existeFormador) return BadRequest(new { message = "Formador não encontrado" });

            // Carregar Alocações e os Horários relacionados
            var alocacoes = await _context.TurmaAlocacoes
                    .Where(a => a.IdFormador == idFormador)
                    .Include(a => a.IdTurmaNavigation)
                        .ThenInclude(t => t.IdCursoNavigation)
                    .Include(a => a.IdModuloNavigation)
                    .ToListAsync();

            var hoje = DateOnly.FromDateTime(DateTime.Today);

            // Processamento em Memória (Muito mais rápido)
            var resultado = new List<TurmaFormadorModuloCursoDTO>();

            foreach (var a in alocacoes)
            {
                // A forma mais performante seria carregar todos os horários deste formador antes do loop,
                // mas vamos manter simples corrigindo apenas o erro principal.
                var horarios = await _context.Horarios
                    .Where(h =>
                        h.IdTurma == a.IdTurma &&
                        h.IdCursoModuloNavigation.IdModulo == a.IdModulo &&
                        h.IdFormador == idFormador &&
                        h.Data <= hoje
                    )
                    .ToListAsync();

                var aulasExistentes = await _context.Horarios
                    .Where(h =>
                        h.IdTurma == a.IdTurma &&
                        h.IdCursoModuloNavigation.IdModulo == a.IdModulo
                    )
                    .Select(h => new {h.HoraInicio, h.HoraFim })
                    .ToListAsync();

                var horasDadas = CalcularHorasDadas(horarios);
                var horasTotais = a.IdModuloNavigation.HorasTotais;


                double horasJaAgendadas = aulasExistentes.Sum(h => (h.HoraFim - h.HoraInicio).TotalHours);

                string estado;
                if (horasDadas == 0) estado = $"Para começar [{horasJaAgendadas}/{horasTotais}] ";
                else if (horasDadas < horasTotais) estado = $"A decorrer [{horasJaAgendadas}/{horasTotais}] ";
                else estado = $"Terminado [{horasTotais}] ";

                var cursoModulo = await _context.CursosModulos
                .FirstOrDefaultAsync(cm =>
                    cm.IdCurso == a.IdTurmaNavigation.IdCurso &&
                    cm.IdModulo == a.IdModulo
                );

                if (cursoModulo == null) continue;

                if (estado == "Terminado") continue;

                resultado.Add(new TurmaFormadorModuloCursoDTO
                {
                    IdTurma = a.IdTurma,
                    IdModulo = a.IdModulo,
                    IdCursoModulo = cursoModulo.IdCursoModulo,
                    NomeTurma = a.IdTurmaNavigation.NomeTurma,
                    NomeCurso = a.IdTurmaNavigation.IdCursoNavigation.Nome,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    HorasDadas = horasDadas,
                    HorasTotaisModulo = horasTotais,
                    Estado = estado
                });
            }

            return Ok(resultado.OrderBy(t => t.NomeTurma).ThenBy(t => t.NomeModulo));
        }


        /// <summary>
        /// Obtém as avaliações dos formandos de uma determinada turma e módulo.
        /// </summary>
        /// <param name="turmaId">Identificador da turma.</param>
        /// <param name="moduloId">Identificador do módulo.</param>
        /// <remarks>
        /// Para cada formando inscrito na turma é devolvido:
        /// - Identificador da inscrição
        /// - Identificador do formando
        /// - Nome do formando
        /// - Nota atribuída ao módulo (caso exista)
        ///
        /// Se o formando ainda não tiver avaliação registada,
        /// o campo Nota é devolvido com valor nulo.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="AvaliacaoAlunoDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        /// <response code="403">Acesso negado.</response>
        [Authorize(Policy = "Formador")]
        [HttpGet("avaliacoes")]
        public async Task<ActionResult<IEnumerable<AvaliacaoAlunoDTO>>> GetAvaliacoes(int turmaId, int moduloId)
        {
            var alunos = await _context.Inscricoes
                .Where(i => i.IdTurma == turmaId)
                .Select(i => new AvaliacaoAlunoDTO
                {
                    IdInscricao = i.IdInscricao,
                    IdFormando = i.IdFormando,
                    NomeFormando = i.IdFormandoNavigation.IdUtilizadorNavigation.Nome,
                    Email = i.IdFormandoNavigation.IdUtilizadorNavigation.Email,
                    Nota = _context.Avaliacoes
                        .Where(a => a.IdInscricao == i.IdInscricao && a.IdModulo == moduloId)
                        .Select(a => a.Nota)
                        .FirstOrDefault()
                })
                .OrderBy(i => i.NomeFormando)
                .ToListAsync();

            return Ok(alunos);
        }

        /// <summary>
        /// Regista ou atualiza avaliações de formandos para um determinado módulo.
        /// </summary>
        /// <param name="avaliacoes">
        /// Lista de objetos contendo:
        /// - IdInscricao
        /// - IdModulo
        /// - Nota (0 a 20)
        /// </param>
        /// <remarks>
        /// Regras aplicadas:
        /// - Se já existir avaliação para a inscrição e módulo, a nota é atualizada.
        /// - Caso contrário, é criada uma nova avaliação.
        /// - As notas devem estar no intervalo 0–20.
        /// - A data da avaliação é definida automaticamente como a data atual.
        /// 
        /// Apenas utilizadores com política "Formador" podem executar esta operação.
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="200">Avaliações guardadas com sucesso.</response>
        /// <response code="400">Lista inválida ou notas fora do intervalo permitido.</response>
        /// <response code="403">Acesso negado.</response>
        [Authorize(Policy = "Formador")]
        [HttpPost("avaliacoes")]
        public async Task<IActionResult> GuardarAvaliacoes(List<DarAvaliacaoDTO> avaliacoes)
        {
            if (avaliacoes == null || !avaliacoes.Any())
                return BadRequest();

            if (avaliacoes.Any(a => a.Nota < 0 || a.Nota > 20))
                return BadRequest("Notas inválidas");

            var hoje = DateOnly.FromDateTime(DateTime.Today);


            foreach (var a in avaliacoes)
            {
                var existente = await _context.Avaliacoes
                    .FirstOrDefaultAsync(x =>
                        x.IdInscricao == a.IdInscricao &&
                        x.IdModulo == a.IdModulo
                    );

                if (existente == null)
                {
                    _context.Avaliacoes.Add(new Avaliacao
                    {
                        IdInscricao = a.IdInscricao,
                        IdModulo = a.IdModulo,
                        Nota = a.Nota,
                        DataAvaliacao = hoje
                    });
                }
                else
                {
                    existente.Nota = a.Nota;
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        /// <summary>
        /// Calcula o total de horas lecionadas com base numa coleção de horários.
        /// </summary>
        /// <param name="horarios">
        /// Coleção de entidades <see cref="Horario"/> a analisar.
        /// </param>
        /// <remarks>
        /// Apenas são consideradas sessões válidas, isto é, aquelas em que 
        /// <c>HoraFim</c> é superior a <c>HoraInicio</c>.
        /// Sessões inválidas contribuem com 0 horas para o total.
        /// </remarks>
        /// <returns>
        /// Total de horas lecionadas expresso em valor decimal.
        /// </returns>
        private static double CalcularHorasDadas(IEnumerable<Horario> horarios)
        {
            return horarios.Sum(h =>
            {
                if (h.HoraFim <= h.HoraInicio)
                    return 0;

                return (h.HoraFim - h.HoraInicio).TotalHours;
            });
        }

        /// <summary>
        /// Obtém os formadores alocados a uma turma específica,
        /// incluindo os módulos que lecionam e o total de horas já dadas.
        /// </summary>
        /// <param name="idTurma">Identificador da turma.</param>
        /// <remarks>
        /// Para cada formador é devolvido:
        /// - Identificação do formador
        /// - Módulo lecionado
        /// - Total de horas dadas até à data atual
        /// 
        /// Apenas são consideradas horas com data igual ou anterior ao dia atual.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="FormadorTurmaDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        /// <response code="404">Turma não encontrada.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("turma/{idTurma}/formadores")]
        public async Task<ActionResult<IEnumerable<FormadorTurmaDTO>>> GetFormadoresDaTurma(int idTurma)
        {
            var existeTurma = await _context.Turmas.AnyAsync(t => t.IdTurma == idTurma);
            if (!existeTurma)
                return NotFound("Turma não encontrada");

            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var alocacoes = await _context.TurmaAlocacoes
                .Where(a => a.IdTurma == idTurma)
                .Include(a => a.IdFormadorNavigation)
                    .ThenInclude(f => f.IdUtilizadorNavigation)
                .Include(a => a.IdModuloNavigation)
                .ToListAsync();

            var resultado = alocacoes.Select(a =>
            {
                var horasDadas = _context.Horarios
                    .Where(h =>
                        h.IdTurma == a.IdTurma &&
                        h.IdFormador == a.IdFormador &&
                        h.IdCursoModuloNavigation.IdModulo == a.IdModulo &&
                        h.Data <= hoje
                    )
                    .ToList();

                return new FormadorTurmaDTO
                {
                    IdFormador = a.IdFormador,
                    NomeFormador = a.IdFormadorNavigation.IdUtilizadorNavigation.Nome,
                    IdModulo = a.IdModulo,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    HorasDadas = CalcularHorasDadas(horasDadas)
                };
            })
            .OrderBy(r => r.NomeModulo)
            .ThenBy(r => r.NomeFormador)
            .ToList();

            return Ok(resultado);
        }

        /// <summary>
        /// Obtém a lista de módulos de uma turma que ainda não estão alocados a nenhum formador.
        /// </summary>
        /// <param name="idTurma">Identificador da turma.</param>
        /// <remarks>
        /// São considerados apenas os módulos pertencentes ao curso da turma
        /// que ainda não tenham registo na tabela de alocações.
        /// 
        /// A resposta inclui também o tipo de matéria associado ao módulo.
        /// </remarks>
        /// <returns>
        /// Lista de módulos disponíveis para alocação.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        /// <response code="404">Turma não encontrada.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("turma/{idTurma}/modulos-disponiveis")]
        public async Task<IActionResult> GetModulosDisponiveis(int idTurma)
        {
            var turma = await _context.Turmas
                .Include(t => t.IdCursoNavigation)
                .FirstOrDefaultAsync(t => t.IdTurma == idTurma);

            if (turma == null)
                return NotFound();

            var modulosAlocados = await _context.TurmaAlocacoes
                .Where(a => a.IdTurma == idTurma)
                .Select(a => a.IdModulo)
                .ToListAsync();

            var modulosDisponiveis = await _context.CursosModulos
                .Where(cm =>
                    cm.IdCurso == turma.IdCurso &&
                    !modulosAlocados.Contains(cm.IdModulo)
                )
                .Include(cm => cm.IdModuloNavigation)
                    .ThenInclude(m => m.IdTipoMateriaNavigation)
                .Select(cm => new
                {
                    cm.IdModulo,
                    NomeModulo = cm.IdModuloNavigation.Nome,
                    cm.IdModuloNavigation.IdTipoMateria,
                    TipoMateria = cm.IdModuloNavigation.IdTipoMateriaNavigation.Tipo
                })
                .ToListAsync();

            return Ok(modulosDisponiveis);
        }

        /// <summary>
        /// Obtém a lista de formadores habilitados a lecionar um determinado tipo de matéria.
        /// </summary>
        /// <param name="idTipoMateria">
        /// Identificador do tipo de matéria associado ao módulo.
        /// </param>
        /// <remarks>
        /// Apenas são devolvidos formadores que possuam registo de habilitação
        /// para o tipo de matéria indicado.
        /// </remarks>
        /// <returns>
        /// Lista de formadores elegíveis.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("tipo-materia/{idTipoMateria}")]
        public async Task<IActionResult> GetFormadoresPorTipoMateria(int idTipoMateria)
        {
            var formadores = await _context.FormadoresTipoMaterias
                .Where(ftm => ftm.IdTipoMateria == idTipoMateria)
                .Include(ftm => ftm.Formador)
                    .ThenInclude(f => f.IdUtilizadorNavigation)
                .Select(ftm => new
                {
                    ftm.Formador.IdFormador,
                    NomeFormador = ftm.Formador.IdUtilizadorNavigation.Nome
                })
                .Distinct()
                .ToListAsync();

            return Ok(formadores);
        }

        /// <summary>
        /// Cria uma nova alocação de formador a um módulo numa determinada turma.
        /// </summary>
        /// <param name="dto">
        /// Objeto contendo:
        /// - IdTurma
        /// - IdModulo
        /// - IdFormador
        /// </param>
        /// <remarks>
        /// Não é permitido alocar o mesmo módulo duas vezes à mesma turma.
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="200">Alocação criada com sucesso.</response>
        /// <response code="400">O módulo já se encontra alocado à turma.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<IActionResult> AlocarFormador(CriarTurmaAlocacaoDTO dto)
        {
            var existe = await _context.TurmaAlocacoes.AnyAsync(a =>
                a.IdTurma == dto.IdTurma &&
                a.IdModulo == dto.IdModulo
            );

            if (existe)
                return BadRequest("Este módulo já está alocado à turma.");

            _context.TurmaAlocacoes.Add(new TurmaAlocaco
            {
                IdTurma = dto.IdTurma,
                IdModulo = dto.IdModulo,
                IdFormador = dto.IdFormador
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        /// <summary>
        /// Remove a alocação de um formador a um módulo de uma turma.
        /// </summary>
        /// <param name="idTurma">Identificador da turma.</param>
        /// <param name="idFormador">Identificador do formador.</param>
        /// <param name="idModulo">Identificador do módulo.</param>
        /// <remarks>
        /// A remoção só é permitida se:
        /// - Não existirem horas já lecionadas para o módulo.
        /// - Não existirem horários registados associados à alocação.
        /// 
        /// Caso contrário, a operação é bloqueada para garantir integridade dos dados.
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="204">Alocação removida com sucesso.</response>
        /// <response code="404">Alocação não encontrada.</response>
        /// <response code="409">
        /// Não é possível remover: já existem aulas dadas ou horários registados.
        /// </response>
        /// <response code="400">Matriz curso-módulo inválida.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("turma/{idTurma}/formador/{idFormador}/modulo/{idModulo}")]
        public async Task<IActionResult> RemoverFormadorDaTurma(
            int idTurma,
            int idFormador,
            int idModulo
            )
        {
            var alocacao = await _context.TurmaAlocacoes
                .Include(a => a.IdTurmaNavigation)
                .FirstOrDefaultAsync(a =>
                    a.IdTurma == idTurma &&
                    a.IdFormador == idFormador &&
                    a.IdModulo == idModulo
                );

            if (alocacao == null)
                return NotFound(new { message = "Alocação não encontrada" });

            var idCursoModulo = await _context.CursosModulos
                .Where(cm =>
                    cm.IdCurso == alocacao.IdTurmaNavigation.IdCurso &&
                    cm.IdModulo == idModulo
                )
                .Select(cm => cm.IdCursoModulo)
                .FirstOrDefaultAsync();

            if (idCursoModulo == 0)
                return BadRequest(new { message = "Matriz curso-módulo inválida" });


            var hoje = DateOnly.FromDateTime(DateTime.Today);

            // se aulas tiverem mais de 0h dadas nao é possivel eliminar 
            var jaTemHoras = await _context.Horarios.AnyAsync(h =>
                h.IdTurma == idTurma &&
                h.IdFormador == idFormador &&
                h.IdCursoModulo == idCursoModulo &&
                h.Data <= hoje
            );

            if (jaTemHoras)
            {
                return Conflict( new { message = "Não é possível remover o formador: o módulo já tem aulas dadas." });
            }

            // se existir uma entrada na tabela horários não é possivel eliminar
            var existemHorarios = await _context.Horarios.AnyAsync(h =>
                h.IdTurma == idTurma &&
                h.IdCursoModuloNavigation.IdModuloNavigation.IdModulo == idModulo &&
                h.IdFormador == idFormador
            );

            if (existemHorarios)
            {
                return Conflict(new { message = "Não é possível remover o formador: já existem horários registados." });
            }

            _context.TurmaAlocacoes.Remove(alocacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
