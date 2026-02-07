using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Horario;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HorariosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public HorariosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Horarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Horario>>> GetHorarios()
        {
            return await _context.Horarios.ToListAsync();
        }

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
        /// Obtém o horário associado ao formador autenticado,
        /// incluindo o Data, Hora de fim e inicio de aula,
        /// com o nome da sala e nome do curso que dará a aula
        /// </summary>
        /// <returns>
        /// Horário do formador autenticado.
        /// </returns>
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
        /// Obtém o horário da turma associada ao formando autenticado,
        /// incluindo o Data, Hora de fim e inicio de aula,
        /// com o nome da sala e nome do curso que dará a aula
        /// </summary>
        /// <returns>
        /// Horário do formando autenticado.
        /// </returns>
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
        /// Obtém o horário geral para apresentar aos admin ou administrativos,
        /// incluindo Nome da turma, curso, modulo, formador, sala e data do horario
        /// </summary>
        /// <returns>
        /// Horário geral de tudo.
        /// </returns>
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
        /// Atualiza os dados do horário selecionado
        /// incluindo hora de inicio e fim de aula, idFormador, idSala, idCursoModulo
        /// </summary>
        /// <returns>
        /// Atualiza horário selecionado
        /// </returns>
        // PUT: api/Horarios/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHorario(int id, [FromForm] HorarioSaveDTO dto)
        {
            if (id != dto.IdHorario) return BadRequest(new { message = "Os IDs não coincidem." });

            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null) return NotFound(new { message = "Horário não encontrado." });

            TimeOnly inicio, fim;
            try
            {
                inicio = TimeOnly.Parse(dto.HoraInicio);
                fim = TimeOnly.Parse(dto.HoraFim);
            }
            catch { return BadRequest(new { message = "Formato de hora inválido." }); }

            if (inicio >= fim) return BadRequest(new { message = "Hora de início deve ser anterior ao fim." });

            // Validar Limite de Horas
            string? erroHoras = await ValidarLimiteHoras(dto.IdCursoModulo, dto.IdTurma, inicio, fim, id);
            if (erroHoras != null) return Conflict(new { message = erroHoras });

            // Validar Conflitos
            string? erroConflito = await ValidarConflitos(dto, inicio, fim, id);
            if (erroConflito != null) return Conflict(new { message = erroConflito });

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
                return BadRequest(new { message = "Erro ao atualizar: " + ex.Message });
            }
        }

        /// <summary>
        /// Cria um horário novo validando inputs e disponibilidade de turma,
        /// formador e sala, caso algum esteja sobreposto irá dar erro ao criar e enviar mensagem personalizada
        /// Valida se a hora de início é anterior à hora de fim
        /// Valida tamebm se a marcação ultrapassa o limite de horas do módulo
        /// </summary>
        /// <returns>
        /// Cria horário
        /// </returns>
        // POST: api/Horarios
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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
            catch { return BadRequest(new { message = "Formato de hora inválido." }); }

            if (inicio >= fim) return BadRequest(new { message = "Hora de início deve ser anterior ao fim." });


            // Validar Limite de Horas
            string? erroHoras = await ValidarLimiteHoras(dto.IdCursoModulo, dto.IdTurma, inicio, fim, null);
            if (erroHoras != null) return Conflict(new { message = erroHoras });

            // Validar Conflitos
            string? erroConflito = await ValidarConflitos(dto, inicio, fim, null);
            if (erroConflito != null) return Conflict(new { message = erroConflito });

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
                return BadRequest(new { message = "Erro ao gravar n BD: " + ex.Message });
            }

            return CreatedAtAction("GetHorario", new { id = novoHorario.IdHorario }, novoHorario);
        }

        // DELETE: api/Horarios/5
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

        private bool HorarioExists(int id)
        {
            return _context.Horarios.Any(e => e.IdHorario == id);
        }

        /* 
         * METODOS AUXILIARES DE VALIDAÇÃO:
         */

        /// <summary>
        /// Verifica conflitos de Turma, Formador e Sala.
        /// Aceita 'idIgnorar' para permitir atualizações (PUT) sem colidir com o próprio registo.
        /// </summary>
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

            // Verificar Sala
            var salaOcupada = await _context.Horarios.AnyAsync(h =>
                (idIgnorar == null || h.IdHorario != idIgnorar) &&
                h.IdSala == dto.IdSala &&
                h.Data == dto.Data &&
                h.HoraInicio < fim && h.HoraFim > inicio
            );

            if (salaOcupada)
                return "Conflito: A Sala selecionada já está ocupada neste intervalo.";

            return null; // Nenhum conflito encontrado
        }

        /// <summary>
        /// Verifica se a nova duração ultrapassa o limite de horas do módulo.
        /// </summary>
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
                Data = h.Data.ToString("dd-MM-yyyy"),
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