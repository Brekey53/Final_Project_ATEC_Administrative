using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Horario;
using ProjetoAdministracaoEscola.Services;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HorariosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;
        private readonly HorarioGeradorService _horarioGeradorService;

        public HorariosController(SistemaGestaoContext context, HorarioGeradorService horarioGeradorService)
        {
            _context = context;
            _horarioGeradorService = horarioGeradorService;
        }

        /// <summary>
        /// Obtém a lista completa de todos os horários registados no sistema.
        /// </summary>
        /// <returns>
        /// Lista de horarios <see cref="Horario"/>.
        /// </returns>
        /// <response code="200">Lista de horários devolvida com sucesso.</response>
        // GET: api/Horarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Horario>>> GetHorarios()
        {
            return await _context.Horarios.ToListAsync();
        }

        /// <summary>
        /// Obtém os detalhes de um horário específico.
        /// </summary>
        /// <param name="id">Identificador do horário.</param>
        /// <returns>
        /// Objeto <see cref="HorarioSaveDTO"/> com os dados do horário.
        /// </returns>
        /// <response code="200">Horário encontrado e devolvido com sucesso.</response>
        /// <response code="404">Horário não encontrado.</response>
        // GET: api/Horarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HorarioSaveDTO>> GetHorario(int id)
        {
            var horarioDto = await _context.Horarios
                .Where(h => h.IdHorario == id)
                .Select(h => new HorarioSaveDTO
                {
                    IdHorario = h.IdHorario,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio.ToString(@"HH\:mm"),
                    HoraFim = h.HoraFim.ToString(@"HH\:mm"),
                    IdFormador = h.IdFormador,
                    IdSala = h.IdSala,
                    IdCursoModulo = h.IdCursoModulo
                })
                .FirstOrDefaultAsync();

            if (horarioDto == null)
            {
                return NotFound(new { message = "Horário não encontrado." });
            }

            return Ok(horarioDto);
        }

        /// <summary>
        /// Obtém os horários associados ao formador autenticado.
        /// </summary>
        /// <returns>
        /// Lista de horários em formato <see cref="ScheduleCalendarDTO"/>.
        /// </returns>
        /// <response code="200">Horários devolvidos com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        [HttpGet("formador")]
        public async Task<ActionResult<IEnumerable<ScheduleCalendarDTO>>> GetHorariosFormador()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // ir buscar o formador associado ao utilizador
            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            var horarios = await _context.Horarios
                .Where(h => h.IdFormador == formadorId)
                .Include(h => h.IdSalaNavigation)
                .Include(h => h.IdCursoModuloNavigation)
                    .ThenInclude(cm => cm.IdCursoNavigation)
                .Include(h => h.IdCursoModuloNavigation)
                    .ThenInclude(cm => cm.IdModuloNavigation)
                .Select(h => new ScheduleCalendarDTO
                {
                    IdHorario = h.IdHorario,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio,
                    HoraFim = h.HoraFim,
                    NomeSala = h.IdSalaNavigation.Descricao,
                    NomeCurso = h.IdCursoModuloNavigation.IdCursoNavigation.Nome,
                    //NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome // TODO:AQUI!
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            return Ok(horarios);
        }

        /// <summary>
        /// Obtém os horários das turmas em que o formando autenticado está inscrito.
        /// </summary>
        /// <returns>
        /// Lista de horários em formato <see cref="ScheduleCalendarDTO"/>.
        /// </returns>
        /// <response code="200">Horários devolvidos com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        [HttpGet("formando")]
        public async Task<IActionResult> GetHorariosFormando()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            // Verificar se é formando
            var formando = await _context.Formandos
                .FirstOrDefaultAsync(f => f.IdUtilizador == userId);

            // obter as turmas onde o formando está inscrito
            if (formando == null)
                return Ok(new List<ScheduleCalendarDTO>());

            // Turmas onde está inscrito
            var turmasIds = await _context.Inscricoes
                .Where(i => i.IdFormando == formando.IdFormando)
                .Select(i => i.IdTurma)
                .ToListAsync();

            if (!turmasIds.Any())
                return Ok(new List<ScheduleCalendarDTO>());

            // Horários
            var horarios = await _context.Horarios
                .Where(h => turmasIds.Contains(h.IdTurma))
                .Select(h => new ScheduleCalendarDTO
                {
                    IdHorario = h.IdHorario,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio,
                    HoraFim = h.HoraFim,
                    NomeSala = h.IdSalaNavigation.Descricao,
                    NomeCurso = h.IdCursoModuloNavigation.IdCursoNavigation.Nome
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            return Ok(horarios);
        }

        /// <summary>
        /// Obtém a listagem completa de horários com informação detalhada
        /// (turma, curso, módulo, formador e sala).
        /// </summary>
        /// <returns>
        /// Lista de horários em formato <see cref="HorarioGetDTO"/>.
        /// </returns>
        /// <response code="200">Horários devolvidos com sucesso.</response>
        [HttpGet("horario-get")]
        public async Task<ActionResult<IEnumerable<HorarioGetDTO>>> GetHorariosTotal()
        {

            var horarios = await _context.Horarios
                .OrderBy(h => h.HoraInicio)
                .ThenBy(h => h.IdTurmaNavigation.NomeTurma)
                .Select(h => new HorarioGetDTO
                {
                    IdHorario = h.IdHorario,
                    NomeTurma = h.IdTurmaNavigation.NomeTurma,
                    NomeCurso = h.IdCursoModuloNavigation.IdCursoNavigation.Nome,
                    NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome,
                    NomeFormador = h.IdFormadorNavigation.IdUtilizadorNavigation.Nome,
                    NomeSala = h.IdSalaNavigation.Descricao,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio.ToString(@"HH\:mm"),
                    HoraFim = h.HoraFim.ToString(@"HH\:mm")
                })
                .ToListAsync();

            return Ok(horarios);
        }

        /// <summary>
        /// Atualiza um horário existente.
        /// </summary>
        /// <param name="id">Identificador do horário.</param>
        /// <param name="dto">Dados atualizados do horário.</param>
        /// <returns>
        /// NoContent se a atualização for bem-sucedida.
        /// </returns>
        /// <response code="204">Horário atualizado com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="404">Horário não encontrado.</response>
        /// <response code="409">Conflito de horários ou limite de horas ultrapassado.</response>
        // PUT: api/Horarios/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHorario(int id, [FromForm] HorarioSaveDTO dto)
        {
            if (id != dto.IdHorario)
                BadRequest(new { message = "Os IDs não coincidem." });

            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null)
                return NotFound(new { message = "Horário não encontrado." });

            TimeOnly inicio, fim;
            try
            {
                inicio = TimeOnly.Parse(dto.HoraInicio);
                fim = TimeOnly.Parse(dto.HoraFim);
            }
            catch
            {
                return BadRequest(new { message = "Formato de hora inválido." });
            }

            if (inicio >= fim)
                return BadRequest(new { message = "Hora de início deve ser anterior ao fim." });

            // Validar Limite de Horas
            string? erroHoras = await ValidarLimiteHoras(dto.IdCursoModulo, dto.IdTurma, inicio, fim, id);

            if (erroHoras != null)
                return Conflict(new { message = erroHoras });

            // Validar Conflitos
            string? erroConflito = await ValidarConflitos(dto, inicio, fim, id);

            if (erroConflito != null)
                return Conflict(new { message = erroConflito });

            // dto para entidade + atualizar
            try
            {
                horario.Data = dto.Data;
                horario.HoraInicio = inicio;
                horario.HoraFim = fim;
                horario.IdFormador = dto.IdFormador;
                horario.IdSala = dto.IdSala;
                horario.IdCursoModulo = dto.IdCursoModulo;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao atualizar horário" });
            }
        }

        /// <summary>
        /// Cria um novo horário.
        /// </summary>
        /// <param name="dto">Dados do horário a criar.</param>
        /// <returns>
        /// Horário criado com sucesso.
        /// </returns>
        /// <response code="201">Horário criado com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="409">Conflito de horários ou limite de horas ultrapassado.</response>
        // POST: api/Horarios
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<ActionResult<Horario>> PostHorario([FromForm] HorarioSaveDTO dto)
        {

            if (dto.IdTurma == 0 || dto.IdFormador == 0 || dto.IdSala == 0 || dto.IdCursoModulo == 0)
                return BadRequest(new { message = "Dados incompletos." });

            TimeOnly inicio, fim;
            try
            {
                inicio = TimeOnly.Parse(dto.HoraInicio);
                fim = TimeOnly.Parse(dto.HoraFim);
            }
            catch
            {
                return BadRequest(new { message = "Formato de hora inválido." });
            }

            if (inicio >= fim)
                return BadRequest(new { message = "Hora de início deve ser anterior ao fim." });


            // Validar Limite de Horas
            string? erroHoras = await ValidarLimiteHoras(dto.IdCursoModulo, dto.IdTurma, inicio, fim, null);
            if (erroHoras != null)
                return Conflict(new { message = erroHoras });

            // Validar Conflitos
            string? erroConflito = await ValidarConflitos(dto, inicio, fim, null);
            if (erroConflito != null)
                return Conflict(new { message = erroConflito });

            // dto para entidade + gravar
            var novoHorario = new Horario
            {
                IdTurma = dto.IdTurma,
                IdFormador = dto.IdFormador,
                IdSala = dto.IdSala,
                IdCursoModulo = dto.IdCursoModulo,
                Data = dto.Data,
                HoraInicio = inicio,
                HoraFim = fim
            };

            try
            {
                _context.Horarios.Add(novoHorario);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao gravar n BD" });
            }

            return CreatedAtAction("GetHorario", new { id = novoHorario.IdHorario }, novoHorario);
        }

        /// <summary>
        /// Gera automaticamente o horário para uma turma específica,
        /// com base nas disponibilidades, módulos e salas.
        /// </summary>
        /// <param name="idTurma">Identificador da turma.</param>
        /// <returns>
        /// Resultado da operação com resumo do horário gerado.
        /// </returns>
        /// <response code="200">Horário gerado com sucesso.</response>
        /// <response code="400">Não foi possível gerar horário com as condições atuais.</response>
        /// <response code="404">Turma não encontrada.</response>
        /// <response code="500">Erro interno durante a geração.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost("gerar-automatico/{idTurma}")]
        public async Task<IActionResult> GerarHorarioAutomatico(int idTurma)
        {
            // para segurança iniciar uma transação e só confirmar se tudo correr bem, caso contrário reverter
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var turma = await _context.Turmas
                    .Include(t => t.IdMetodologiaNavigation)
                    .Include(t => t.IdCursoNavigation)
                    .FirstOrDefaultAsync(t => t.IdTurma == idTurma);

                if (turma == null)
                {
                    return NotFound(new { message = "Turma não encontrada." });
                }

                var cursoModulos = await _context.CursosModulos
                    .Include(cm => cm.IdModuloNavigation)
                        .ThenInclude(m => m.IdTipoMateriaNavigation)
                            .ThenInclude(tm => tm.IdTipoSalas)
                    .OrderBy(cm => cm.Prioridade)
                    .Where(cm => cm.IdCurso == turma.IdCurso)
                    .ToListAsync();

                if (!cursoModulos.Any())
                {
                    return BadRequest(new { message = "Este curso não tem módulos associados." });
                }

                var turmaAlocacoes = await _context.TurmaAlocacoes
                    .Include(ta => ta.IdFormadorNavigation)
                        .ThenInclude(f => f.DisponibilidadeFormadores)
                    .Where(ta => ta.IdTurma == idTurma)
                    .ToListAsync();

                if (!turmaAlocacoes.Any())
                {
                    return BadRequest(new { message = "Esta turma não tem formadores alocados." });
                }

                var salas = await _context.Salas
                    .Include(s => s.IdTipoSalaNavigation)
                    .ToListAsync();

                if (!salas.Any())
                {
                    return BadRequest(new { message = "Não existem salas disponíveis." });
                }

                // para blacklist de horários já ocupados (para evitar gerar sobreposições)
                // buscar apenas horarios que coincidam com o horário da turma para não carregar horarios antigos que não interessam
                var listaHorariosOcupados = await _context.Horarios
                    .Where(h => h.Data >= turma.DataInicio && h.Data <= turma.DataFim)
                    .ToListAsync();

                // Converter os horarios em HashSet para pesquisa mais rápida (e é o que está a ser esperado na função)
                var horariosHashSet = new HashSet<Horario>(listaHorariosOcupados);

                // Executar o serviço de geração automática
                var novosHorarios = await _horarioGeradorService.GerarHorario(
                    turma,
                    cursoModulos,
                    turmaAlocacoes,
                    salas,
                    horariosHashSet
                    );

                if (novosHorarios.Count == 0)
                {
                    return BadRequest(new { message = "Não foi possível gerar um horário automático com as condições atuais." });
                }

                // Apagar horários antigos desta turma
                var horariosAntigos = await _context.Horarios.Where(h => h.IdTurma == idTurma).ToListAsync();
                _context.Horarios.RemoveRange(horariosAntigos);

                // Adicionar os novos
                await _context.Horarios.AddRangeAsync(novosHorarios);
                await _context.SaveChangesAsync();

                // Confirmar a transação
                await transaction.CommitAsync();

                return Ok(new
                {
                    Mensagem = "Horário gerado com sucesso!",
                    TotalAulasAgendadas = novosHorarios.Count,
                    DataInicio = novosHorarios.Min(h => h.Data),
                    DataFim = novosHorarios.Max(h => h.Data)
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Erro interno ao gerar horário");
            }
        }

        /// <summary>
        /// Remove um horário do sistema.
        /// </summary>
        /// <param name="id">Identificador do horário.</param>
        /// <returns>
        /// NoContent se removido com sucesso.
        /// </returns>
        /// <response code="204">Horário removido com sucesso.</response>
        /// <response code="404">Horário não encontrado.</response>
        // DELETE: api/Horarios/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHorario(int id)
        {
            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null)
            {
                return NotFound();
            }

            _context.Horarios.Remove(horario);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        /* 
        * METODOS AUXILIARES DE VALIDAÇÃO:
        */

        /// <summary>
        /// Valida se existem conflitos ao agendar ou atualizar um horário.
        /// Verifica sobreposição de horários do formador, disponibilidade,
        /// conflitos da turma e ocupação da sala (exceto salas online).
        /// </summary>
        /// <param name="dto">DTO com os dados do horário.</param>
        /// <param name="inicio">Hora de início da aula.</param>
        /// <param name="fim">Hora de fim da aula.</param>
        /// <param name="idIgnorar">
        /// Identificador do horário a ignorar (utilizado em operações de edição).
        /// </param>
        /// <returns>
        /// Mensagem de erro caso exista conflito; caso contrário, <c>null</c>.
        /// </returns>
        private async Task<string?> ValidarConflitos(HorarioSaveDTO dto, TimeOnly inicio, TimeOnly fim, int? idIgnorar = null)
        {
            // Verificar Formador não tem sobreposição 
            var formadorOcupado = await _context.Horarios.AnyAsync(h =>
                (idIgnorar == null || h.IdHorario != idIgnorar) && // Ignora o próprio (no caso de edit)
                h.IdFormador == dto.IdFormador &&
                // Comparação de Data (Ajusta conforme o tipo na tua BD)
                h.Data == dto.Data &&
                // Lógica de Sobreposição: (InicioA < FimB) E (FimA > InicioB)
                h.HoraInicio < fim && h.HoraFim > inicio
            );

            if (formadorOcupado)
                return "Conflito: Este Formador já tem uma aula nesse horário (sobreposição detetada).";

            // Verificar Disponibilidade Formador
            var formadorDisponivel = await _context.DisponibilidadeFormadores.AnyAsync(df => df.IdFormador == dto.IdFormador
                 && df.DataDisponivel == dto.Data && df.HoraInicio <= inicio && df.HoraFim >= fim);

            if (!formadorDisponivel)
                return "Conflito: Este Formador não tem disponibilidade para esse horário.";

            // Verificar Turma
            var turmaOcupada = await _context.Horarios.AnyAsync(h =>
                (idIgnorar == null || h.IdHorario != idIgnorar) &&
                h.IdTurma == dto.IdTurma &&
                h.Data == dto.Data &&
                h.HoraInicio < fim && h.HoraFim > inicio
            );

            if (turmaOcupada)
                return "Conflito: Esta Turma já tem outra aula marcada que coincide com este horário.";

            var isSalaOnline = await _context.Salas
            .AnyAsync(s =>
                s.IdSala == dto.IdSala &&
                s.IdTipoSalaNavigation.IdTipoSala == 10
            );
            if (!isSalaOnline)
            {
                var salaOcupada = await _context.Horarios.AnyAsync(h =>
                    (idIgnorar == null || h.IdHorario != idIgnorar) &&
                    h.IdSala == dto.IdSala &&
                    h.Data == dto.Data &&
                    h.HoraInicio < fim &&
                    h.HoraFim > inicio
                );

                if (salaOcupada)
                    return "Conflito: A Sala selecionada já está ocupada neste intervalo.";
            }

            return null;

        }

        /// <summary>
        /// Valida se a nova aula ultrapassa o limite total de horas definido
        /// para o módulo dentro da turma.
        /// </summary>
        /// <param name="idCursoModulo">Identificador da relação curso-módulo.</param>
        /// <param name="idTurma">Identificador da turma.</param>
        /// <param name="inicio">Hora de início da aula.</param>
        /// <param name="fim">Hora de fim da aula.</param>
        /// <param name="idIgnorar">
        /// Identificador do horário a ignorar (utilizado em operações de edição).
        /// </param>
        /// <returns>
        /// Mensagem de erro caso o limite seja ultrapassado; caso contrário, <c>null</c>.
        /// </returns>
        private async Task<string?> ValidarLimiteHoras(int idCursoModulo, int idTurma, TimeOnly inicio, TimeOnly fim, int? idIgnorar = null)
        {
            // Obter dados do módulo
            var dadosModulo = await _context.CursosModulos
                .Include(cm => cm.IdModuloNavigation)
                .Where(cm => cm.IdCursoModulo == idCursoModulo)
                .Select(cm => new { LimitHours = cm.IdModuloNavigation.HorasTotais, NomeModulo = cm.IdModuloNavigation.Nome })
                .FirstOrDefaultAsync();

            if (dadosModulo == null) return "Módulo não encontrado.";

            // Calcular duração da aula que estamos a tentar gravar
            double duracaoNovaAula = (fim - inicio).TotalHours;

            // Somar horas já agendadas na BD
            var aulasExistentes = await _context.Horarios
                .Where(h =>
                    h.IdTurma == idTurma &&
                    h.IdCursoModulo == idCursoModulo &&
                    (idIgnorar == null || h.IdHorario != idIgnorar) // Garante funcionamento no PUT
                )
                .Select(h => new { h.HoraInicio, h.HoraFim })
                .ToListAsync();

            double horasJaAgendadas = aulasExistentes.Sum(h => (h.HoraFim - h.HoraInicio).TotalHours);

            // Verificar limite
            if (horasJaAgendadas + duracaoNovaAula > dadosModulo.LimitHours)
            {
                return $"Impossível agendar! O módulo '{dadosModulo.NomeModulo}' tem {dadosModulo.LimitHours}h totais. " +
                       $"Já estão marcadas {horasJaAgendadas}h. Com esta alteração passaria para {horasJaAgendadas + duracaoNovaAula}h.";
            }

            return null; // Tudo OK
        }

        /// <summary>
        /// Obtém a disponibilidade registada de um formador específico.
        /// </summary>
        /// <param name="idFormador">Identificador do formador.</param>
        /// <returns>
        /// Lista de disponibilidades em formato <see cref="DisponibilidadeFormadorMarcarHorarios"/>.
        /// </returns>
        /// <response code="200">Disponibilidade devolvida com sucesso.</response>
        /// <response code="404">Formador não encontrado.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{idFormador}/disponibilidade")]
        public async Task<ActionResult<IEnumerable<DisponibilidadeFormadorMarcarHorarios>>> GetDisponibilidadeFormador(int idFormador)
        {
            var existe = await _context.Formadores.AnyAsync(f => f.IdFormador == idFormador);
            if (!existe)
                return NotFound(new { message = "Formador não encontrado." });

            var dispDb = await _context.DisponibilidadeFormadores
                .Where(d => d.IdFormador == idFormador)
                .OrderBy(d => d.DataDisponivel)
                .ThenBy(d => d.HoraInicio)
                .ToListAsync();

            var disponibilidade = dispDb.Select(d => new DisponibilidadeFormadorMarcarHorarios
            {
                Data = d.DataDisponivel.ToDateTime(TimeOnly.MinValue),
                HoraInicio = d.HoraInicio.ToTimeSpan(),
                HoraFim = d.HoraFim.ToTimeSpan(),
            })
            .ToList();

            return Ok(disponibilidade);
        }

        /// <summary>
        /// Obtém os horários já marcados para um formador específico.
        /// </summary>
        /// <param name="idFormador">Identificador do formador.</param>
        /// <returns>
        /// Lista de horários marcados em formato <see cref="HorarioMarcadoFormador"/>.
        /// </returns>
        /// <response code="200">Horários devolvidos com sucesso.</response>
        /// <response code="404">Formador não encontrado.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{idFormador}/marcados")]
        public async Task<ActionResult<IEnumerable<HorarioMarcadoFormador>>> GetHorariosFormador(int idFormador)
        {
            var existe = await _context.Formadores.AnyAsync(f => f.IdFormador == idFormador);
            if (!existe)
                return NotFound(new { message = "Formador não encontrado." });


            var horariosDb = await _context.Horarios
            .Where(h => h.IdFormador == idFormador)
            .Include(h => h.IdSalaNavigation)
            .Include(h => h.IdCursoModuloNavigation)
                .ThenInclude(cm => cm.IdCursoNavigation)
            .OrderBy(h => h.Data)
            .ThenBy(h => h.HoraInicio)
            .ToListAsync();

            var horarios = horariosDb.Select(h => new HorarioMarcadoFormador
            {
                Data = h.Data,
                HoraInicio = h.HoraInicio.ToString(@"hh\:mm"),
                HoraFim = h.HoraFim.ToString(@"hh\:mm"),
                NomeTurma = h.IdCursoModuloNavigation.IdCursoNavigation.Nome,
                NomeSala = h.IdSalaNavigation.Descricao
            })
            .ToList();


            return Ok(horarios);
        }

    }
}