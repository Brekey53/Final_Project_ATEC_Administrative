using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Horario.Requests;
using ProjetoAdministracaoEscola.ModelsDTO.Horario.Responses;
using ProjetoAdministracaoEscola.Services;
using System.Net.Mime;
using System.Security.Claims;
using System.Text;

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
                .Include(h => h.IdTurmaNavigation)
                .Include(h => h.IdCursoModuloNavigation)
                    .ThenInclude(cm => cm.IdModuloNavigation)
                .Select(h => new ScheduleCalendarDTO
                {
                    IdHorario = h.IdHorario,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio,
                    HoraFim = h.HoraFim,
                    NomeSala = h.IdSalaNavigation.Descricao,
                    NomeTurma = h.IdTurmaNavigation.NomeTurma,
                    NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            return Ok(horarios);
        }

        /// <summary>
        /// Obtém os horários da semana atual associados ao formador autenticado.
        /// </summary>
        /// <returns>
        /// Lista de horários em formato <see cref="ScheduleCalendarDTO"/>.
        /// </returns>
        /// <response code="200">Horários devolvidos com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        [HttpGet("formador/semana")]
        public async Task<ActionResult<IEnumerable<ScheduleCalendarDTO>>> GetHorariosFormadorSemana()
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
                return Ok(new List<ScheduleCalendarDTO>());

            // 🔹 Calcular semana atual (segunda a domingo)
            var today = DateOnly.FromDateTime(DateTime.Today);

            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var inicioSemana = today.AddDays(-diff);
            var fimSemana = inicioSemana.AddDays(6);

            var horarios = await _context.Horarios
                .Where(h =>
                    h.IdFormador == formadorId &&
                    h.Data >= inicioSemana &&
                    h.Data <= fimSemana
                )
                .Select(h => new ScheduleCalendarDTO
                {
                    IdHorario = h.IdHorario,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio,
                    HoraFim = h.HoraFim,
                    NomeSala = h.IdSalaNavigation.Descricao,
                    NomeTurma = h.IdTurmaNavigation.NomeTurma,
                    NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome
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
                    NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            return Ok(horarios);
        }

        /// <summary>
        /// Obtém os horários das turmas em que o formando autenticado da semana atual
        /// </summary>
        /// <returns>
        /// Lista de horários em formato <see cref="ScheduleCalendarDTO"/>.
        /// </returns>
        /// <response code="200">Horários devolvidos com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        [HttpGet("formando/semana")]
        public async Task<IActionResult> GetHorariosFormandoSemana()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var formando = await _context.Formandos
                .FirstOrDefaultAsync(f => f.IdUtilizador == userId);

            if (formando == null)
                return Ok(new List<ScheduleCalendarDTO>());

            var turmasIds = await _context.Inscricoes
                .Where(i => i.IdFormando == formando.IdFormando)
                .Select(i => i.IdTurma)
                .ToListAsync();

            if (!turmasIds.Any())
                return Ok(new List<ScheduleCalendarDTO>());

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var inicioSemana = today.AddDays(-diff);
            var fimSemana = inicioSemana.AddDays(6);

            var horarios = await _context.Horarios
                .Where(h =>
                    turmasIds.Contains(h.IdTurma) &&
                    h.Data >= inicioSemana &&
                    h.Data <= fimSemana
                )
                .Select(h => new ScheduleCalendarDTO
                {
                    IdHorario = h.IdHorario,
                    Data = h.Data,
                    HoraInicio = h.HoraInicio,
                    HoraFim = h.HoraFim,
                    NomeSala = h.IdSalaNavigation.Descricao,
                    NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            return Ok(horarios);
        }


        /// <summary>
        /// Exporta o horário do utilizador autenticado como um ficheiro iCalendar (.ics).
        /// </summary>
        /// <remarks>
        /// O calendário exportado inclui todas as aulas agendadas para o utilizador nas turmas em que está inscrito.
        /// O ficheiro pode ser importado na maioria das aplicações de calendário, como Google Calendar ou Outlook.
        /// Apenas utilizadores autenticados podem aceder ao seu próprio horário.
        /// </remarks>
        /// <returns>
        /// Um ficheiro contendo o horário do utilizador no formato iCalendar. 
        /// Retorna 'Não Autorizado' se o utilizador não estiver autenticado, ou 'Não Encontrado' se o formando não existir.
        /// </returns>
        [HttpGet("exportar/formandoCalendar")]
        public async Task<IActionResult> ExportarHorarioFormando()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var formando = await _context.Formandos.FirstOrDefaultAsync(f => f.IdUtilizador == userId);

            if (formando == null)
            {
                return NotFound(new { message = "Formando não encontrado." });
            }

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
                .Select(h => new
                {
                    h.Data,
                    h.HoraInicio,
                    h.HoraFim,
                    Sala = h.IdSalaNavigation.Descricao,
                    Modulo = h.IdCursoModuloNavigation.IdCursoNavigation.Nome
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            var ics = new StringBuilder();
            ics.AppendLine("BEGIN:VCALENDAR");
            ics.AppendLine("VERSION:2.0");
            ics.AppendLine("PROID:-//HAWKPORTAL//PT");
            ics.AppendLine("CALSCALE:GREGORIAN");
            ics.AppendLine("METHOD:PUBLISH");

            foreach (var h in horarios)
            {
                // Formato padrao ICS: YYYYMMDDTHHMMSS
                string start = h.Data.ToString("yyyyMMdd") + "T" + h.HoraInicio.ToString("HHmm") + "00";
                string end = h.Data.ToString("yyyyMMdd") + "T" + h.HoraFim.ToString("HHmm") + "00";

                ics.AppendLine("BEGIN:VEVENT");
                ics.AppendLine($"UID:{Guid.NewGuid()}@hawkportal.pt"); // ID único para o Google não duplicar
                ics.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
                ics.AppendLine($"DTSTART:{start}");
                ics.AppendLine($"DTEND:{end}");
                ics.AppendLine($"SUMMARY:{h.Modulo}");
                ics.AppendLine($"LOCATION:{h.Sala}");
                ics.AppendLine($"DESCRIPTION:Aula do módulo {h.Modulo}");
                ics.AppendLine("END:VEVENT");
            }

            ics.AppendLine("END:VCALENDAR");

            var bytesDoCalendario = Encoding.UTF8.GetBytes(ics.ToString());

            return File(bytesDoCalendario, "text/calendar", $"horario_formando_{userId}.ics");

        }

        /// <summary>
        /// Exporta o horário do utilizador autenticado como um ficheiro iCalendar (.ics).
        /// </summary>
        /// <remarks>
        /// O calendário exportado inclui todas as aulas agendadas para o utilizador.
        /// O ficheiro pode ser importado na maioria das aplicações de calendário, como Google Calendar ou Outlook.
        /// Apenas utilizadores autenticados podem aceder ao seu próprio horário.
        /// </remarks>
        /// <returns>
        /// Um ficheiro contendo o horário do utilizador no formato iCalendar. 
        /// Retorna 'Não Autorizado' se o utilizador não estiver autenticado, ou 'Não Encontrado' se o formador não existir.
        /// </returns>
        [HttpGet("exportar/formadorCalendar")]
        public async Task<IActionResult> ExportarHorarioFormador()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var formador = await _context.Formadores.FirstOrDefaultAsync(f => f.IdUtilizador == userId);

            if (formador == null)
            {
                return NotFound(new { message = "Formador não encontrado." });
            }

            // Horários
            var horarios = await _context.Horarios
                .Where(h => h.IdFormador == formador.IdFormador)
                .Select(h => new
                {
                    h.Data,
                    h.HoraInicio,
                    h.HoraFim,
                    Sala = h.IdSalaNavigation.Descricao,
                    Modulo = h.IdCursoModuloNavigation.IdCursoNavigation.Nome,
                    Turma = h.IdTurmaNavigation.NomeTurma
                })
                .OrderBy(h => h.Data)
                .ThenBy(h => h.HoraInicio)
                .ToListAsync();

            var ics = new StringBuilder();
            ics.AppendLine("BEGIN:VCALENDAR");
            ics.AppendLine("VERSION:2.0");
            ics.AppendLine("PROID:-//HAWKPORTAL//PT");
            ics.AppendLine("CALSCALE:GREGORIAN");
            ics.AppendLine("METHOD:PUBLISH");

            foreach (var h in horarios)
            {
                // Formato padrao ICS: YYYYMMDDTHHMMSS
                string start = h.Data.ToString("yyyyMMdd") + "T" + h.HoraInicio.ToString("HHmm") + "00";
                string end = h.Data.ToString("yyyyMMdd") + "T" + h.HoraFim.ToString("HHmm") + "00";

                ics.AppendLine("BEGIN:VEVENT");
                ics.AppendLine($"UID:{Guid.NewGuid()}@hawkportal.pt"); // ID único para o Google não duplicar
                ics.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
                ics.AppendLine($"DTSTART:{start}");
                ics.AppendLine($"DTEND:{end}");
                ics.AppendLine($"SUMMARY:{h.Turma}");
                ics.AppendLine($"LOCATION:{h.Sala}");
                ics.AppendLine($"DESCRIPTION:Aula do módulo {h.Modulo}");
                ics.AppendLine("END:VEVENT");
            }

            ics.AppendLine("END:VCALENDAR");

            var bytesDoCalendario = Encoding.UTF8.GetBytes(ics.ToString());

            return File(bytesDoCalendario, "text/calendar", $"horario_formando_{userId}.ics");

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
                   .Include(ta => ta.IdFormadorNavigation)
                       .ThenInclude(f => f.IdUtilizadorNavigation)
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

                // Definir data de corte para "Hoje" (ou inicio da turma se não tiver começado ainda)
                // O gerador vai agendar de "Hoje" para a frente.
                // O que está para trás é considerado "Já dado" e não se mexe.
                DateOnly dataCorte = DateOnly.FromDateTime(DateTime.Now).AddDays(14);
                if (dataCorte < turma.DataInicio) dataCorte = turma.DataInicio;

                // Calcular horas já lecionadas (Schedules ANTES da data de corte)
                var horariosPassados = await _context.Horarios
                    .Include(h => h.IdCursoModuloNavigation)
                    .Where(h => h.IdTurma == idTurma && h.Data < dataCorte)
                    .ToListAsync();

                var horasJaLeccionadas = horariosPassados
                    .GroupBy(h => h.IdCursoModuloNavigation.IdModulo)
                    .ToDictionary(
                        g => g.Key, // key - id do módulo
                        g => (int)g.Sum(h => (h.HoraFim - h.HoraInicio).TotalHours) // value - horas já lecionadas por módulo
                    );

                // para blacklist de horários já ocupados (para evitar gerar sobreposições)
                // buscar apenas horarios que coincidam com o horário da turma para não carregar horarios antigos que não interessam
                // Excluir horarios futuros desta turma, pois esses serão apagados e re-gerados, mas manter os de outras turmas
                var listaHorariosOcupados = await _context.Horarios
                   .Where(h =>
                       h.Data >= dataCorte && // Só interessa conflitos futuros
                       h.IdTurma != idTurma   // Ignora a própria turma (pois vamos apagar estes)
                   )
                   .ToListAsync();

                // Converter os horarios em HashSet para pesquisa mais rápida (e é o que está a ser esperado na função)
                var horariosHashSet = new HashSet<Horario>(listaHorariosOcupados);

                // Executar o serviço de geração automática
                var resultado = await _horarioGeradorService.GerarHorario(
                    turma,
                    cursoModulos,
                    turmaAlocacoes,
                    salas,
                    horariosHashSet,
                    dataInicioMinima: dataCorte,
                    horasJaLeccionadas: horasJaLeccionadas
                    );

                if (resultado.HorariosGerados.Count == 0 && resultado.ResumoModulos.All(r => !r.ConcluidoComSucesso))
                {
                    // Não gerou nada. Retornamos OK com o resumo para o utilizador perceber o que falhou.
                    // Como não houve sucesso, não apagamos os horários antigos (return antes do commit).
                    return Ok(new
                    {
                        Mensagem = "Não foi possível gerar nenhum horário (a partir de " + dataCorte + "). Verifique o resumo de erros.",
                        TotalAulasAgendadas = 0,
                        DataInicio = (DateOnly?)null,
                        DataFim = (DateOnly?)null,
                        Resumo = resultado.ResumoModulos
                    });
                }

                // Apagar APENAS horários futuros desta turma para serem substituídos
                var horariosFuturos = await _context.Horarios
                    .Where(h => h.IdTurma == idTurma && h.Data >= dataCorte)
                    .ToListAsync();

                _context.Horarios.RemoveRange(horariosFuturos);

                // Adicionar os novos
                if (resultado.HorariosGerados.Any())
                {
                    await _context.Horarios.AddRangeAsync(resultado.HorariosGerados);
                    await _context.SaveChangesAsync();
                }

                // Confirmar a transação
                await transaction.CommitAsync();

                return Ok(new
                {
                    Mensagem = "Processo de geração concluído.",
                    TotalAulasAgendadas = resultado.HorariosGerados.Count,
                    DataInicio = resultado.HorariosGerados.Any() ? resultado.HorariosGerados.Min(h => h.Data) : (DateOnly?)null,
                    DataFim = resultado.HorariosGerados.Any() ? resultado.HorariosGerados.Max(h => h.Data) : (DateOnly?)null,
                    Resumo = resultado.ResumoModulos
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
                return NotFound(new {message = "Horário não encontrado."});
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