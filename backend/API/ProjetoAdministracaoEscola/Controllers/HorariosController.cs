using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;
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

            try
            {
                horario.Data = dto.Data;
                horario.HoraInicio = TimeOnly.Parse(dto.HoraInicio);
                horario.HoraFim = TimeOnly.Parse(dto.HoraFim);
                horario.IdFormador = dto.IdFormador; // TODO: Dados que não se alteram tem de estar aqui??
                horario.IdSala = dto.IdSala;
                horario.IdCursoModulo = dto.IdCursoModulo;

                await _context.SaveChangesAsync();
                return NoContent(); // 204 Success
            }
            catch (FormatException)
            {
                return BadRequest(new { message = "Formato de hora inválido. Use HH:mm." });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HorarioExists(id)) return NotFound();
                else throw;
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
            // Validar se os IDs vieram preenchidos (evita gravar 0)
            if (dto.IdTurma == 0 || dto.IdFormador == 0 || dto.IdSala == 0 || dto.IdCursoModulo == 0)
            {
                return BadRequest(new { message = "Dados incompletos. Verifique Turma, Formador e Sala." });
            }

            // Converter strings para TimeOnly para fazer comparações
            TimeOnly horaInicio, horaFim;
            try
            {
                horaInicio = TimeOnly.Parse(dto.HoraInicio);
                horaFim = TimeOnly.Parse(dto.HoraFim);
            }
            catch
            {
                return BadRequest(new { message = "Formato de hora inválido." });
            }

            // Validar se a hora de início é anterior à hora de fim
            if (horaInicio >= horaFim)
                return BadRequest(new { message = "A hora de início deve ser anterior ao fim." });

            // Validação de conflitos de horário antes de criar o novo horário:

            // Verificar se a marcação ultrapassa o limite de horas do módulo
            var dadosModulo = await _context.CursosModulos
                .Include(cm => cm.IdModuloNavigation)
                .Where(cm => cm.IdCursoModulo == dto.IdCursoModulo)
                .Select(cm => new { LimitHours = cm.IdModuloNavigation.HorasTotais, NomeModulo = cm.IdModuloNavigation.Nome })
                .FirstOrDefaultAsync();

            if (dadosModulo == null) return BadRequest(new { message = "Módulo não encontrado." });

            double duracaoNovaAula = (horaFim - horaInicio).TotalHours;

            var aulasExistentes = await _context.Horarios
                .Where(h => h.IdTurma == dto.IdTurma && h.IdCursoModulo == dto.IdCursoModulo)
                .Select(h => new { h.HoraInicio, h.HoraFim })
                .ToListAsync();

            double horasJaAgendadas = aulasExistentes.Sum(h => (h.HoraFim - h.HoraInicio).TotalHours);

            // Verificar se ultrapassa
            if (horasJaAgendadas + duracaoNovaAula > dadosModulo.LimitHours)
            {
                return Conflict(new
                {
                    message = $"Impossível agendar! O módulo '{dadosModulo.NomeModulo}' tem {dadosModulo.LimitHours}h totais. " +
                              $"Já estão marcadas {horasJaAgendadas}h. Com esta aula passaria para {horasJaAgendadas + duracaoNovaAula}h."
                });
            }

            // Formador ocupado
            var formadorOcupado = await _context.Horarios.AnyAsync(h =>
                h.IdFormador == dto.IdFormador &&
                h.Data == dto.Data &&
                h.HoraInicio < horaFim && h.HoraFim > horaInicio
            );

            if (formadorOcupado)
            {
                return Conflict(new { message = "Esse Formador já tem uma aula nesse horário!" });
            }

            // Turma ocupada
            var turmaOcupada = await _context.Horarios.AnyAsync(h =>
                h.IdTurma == dto.IdTurma &&
                h.Data == dto.Data &&
                h.HoraInicio < horaFim && h.HoraFim > horaInicio
            );

            if (turmaOcupada)
            {
                return Conflict(new { message = "Essa Turma já tem aula marcada nesse horário!" });
            }

            // Sala ocupada
            var salaOcupada = await _context.Horarios.AnyAsync(h =>
                h.IdSala == dto.IdSala &&
                h.Data == dto.Data &&
                h.HoraInicio < horaFim && h.HoraFim > horaInicio
            );

            if (salaOcupada)
            {
                return Conflict(new { message = "A Sala selecionada acabou de ser ocupada por outro utilizador." });
            }

            var novoHorario = new Horario
            {
                IdTurma = dto.IdTurma,
                IdFormador = dto.IdFormador,
                IdSala = dto.IdSala,
                IdCursoModulo = dto.IdCursoModulo,
                Data = dto.Data,
                HoraInicio = horaInicio,
                HoraFim = horaFim
            };

            try
            {
                // Tentar Gravar na BD
                _context.Horarios.Add(novoHorario);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Verifica se é erro de chave duplicada (Sobreposição de horário na BD)
                // O código do erro varia conforme o banco (MySQL: 1062, SQLServer: 2601/2627)
                if (ex.InnerException != null && ex.InnerException.Message.Contains("Duplicate entry")) // Para MySQL
                {
                    return Conflict(new { message = "Conflito de horário! A sala ou o formador já estão ocupados nesta hora." });
                }
                else if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE")) // Genérico
                {
                    return Conflict(new { message = "Sobreposição detetada. Verifique se a sala ou formador estão livres." });
                }

                // Se for outro erro de base de dados, lança o erro real para o log
                throw;
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao criar horário: " + ex.Message });
            }

            // 5. Retornar sucesso 201 Created
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
    }
}