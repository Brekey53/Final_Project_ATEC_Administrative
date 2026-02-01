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
                return NotFound(new { message = "Hor?rio n?o encontrado." });
            }

            return Ok(horarioDto);
        }

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

            if (formandoId == 0)
                return Forbid("Utilizador n?o ? formando");

            // obter as turmas onde o formando est? inscrito
            if (formando == null)
                return Ok(new List<ScheduleCalendarDTO>());

            // Turmas onde está inscrito
            var turmasIds = await _context.Inscricoes
                .Where(i => i.IdFormando == formando.IdFormando)
                .Select(i => i.IdTurma)
                .ToListAsync();

            if (!turmasIds.Any())
                return Ok(new List<ScheduleCalendarDTO>());

            // 3️⃣ Horários
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

        // PUT: api/Horarios/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHorario(int id, [FromForm] HorarioSaveDTO dto)
        {
            if (id != dto.IdHorario) return BadRequest(new { message = "Os IDs n?o coincidem." });

            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null) return NotFound(new { message = "Hor?rio n?o encontrado." });

            try
            {
                horario.Data = dto.Data;
                horario.HoraInicio = TimeOnly.Parse(dto.HoraInicio);
                horario.HoraFim = TimeOnly.Parse(dto.HoraFim);
                horario.IdFormador = dto.IdFormador;
                horario.IdSala = dto.IdSala;
                horario.IdCursoModulo = dto.IdCursoModulo;

                await _context.SaveChangesAsync();
                return NoContent(); // 204 Success
            }
            catch (FormatException)
            {
                return BadRequest(new { message = "Formato de hora inv?lido. Use HH:mm." });
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

            // Converter strings para TimeOnly para fazer compara��es
            TimeOnly horaInicio, horaFim;
            try
            {
                horaInicio = TimeOnly.Parse(dto.HoraInicio);
                horaFim = TimeOnly.Parse(dto.HoraFim);
            }
            catch
            {
                return BadRequest(new { message = "Formato de hora inv?lido." });
            }

            // Validar se a hora de in�cio � anterior � hora de fim
            if (horaInicio >= horaFim)
                return BadRequest(new { message = "A hora de inicio deve ser anterior ao fim." });

            // Valida��o de conflitos de hor�rio antes de criar o novo hor�rio:

            // Formador ocupado
            var formadorOcupado = await _context.Horarios.AnyAsync(h =>
                h.IdFormador == dto.IdFormador &&
                h.Data == dto.Data &&
                h.HoraInicio < horaFim && h.HoraFim > horaInicio
            );

            if (formadorOcupado)
            {
                return Conflict(new { message = "Esse Formador j? tem uma aula nesse hor?rio!" });
            }

            // Turma ocupada
            var turmaOcupada = await _context.Horarios.AnyAsync(h =>
                h.IdTurma == dto.IdTurma &&
                h.Data == dto.Data &&
                h.HoraInicio < horaFim && h.HoraFim > horaInicio
            );

            if (turmaOcupada)
            {
                return Conflict(new { message = "Essa Turma j? tem aula marcada nesse hor?rio!" });
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
                // Verifica se � erro de chave duplicada (Sobreposi��o de hor�rio na BD)
                // O c�digo do erro varia conforme o banco (MySQL: 1062, SQLServer: 2601/2627)
                if (ex.InnerException != null && ex.InnerException.Message.Contains("Duplicate entry")) // Para MySQL
                {
                    return Conflict(new { message = "Conflito de hor?rio! A sala ou o formador j? est?o ocupados nesta hora." });
                }
                else if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE")) // Gen�rico
                {
                    return Conflict(new { message = "Sobreposi??o detetada. Verifique se a sala ou formador est?o livres." });
                }

                // Se for outro erro de base de dados, lan�a o erro real para o log
                throw;
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao criar hor?rio: " + ex.Message });
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
