using Humanizer;
using iText.Commons.Actions.Contexts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador;
using ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador.Request;
using ProjetoAdministracaoEscola.ModelsDTO.Horario;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DisponibilidadeFormadorController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public DisponibilidadeFormadorController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/disponibilidadeformador
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DisponibilidadeFormadorDTO>>> GetDisponibilidadeFormador()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // ir buscar o formador associado ao utilizador
            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            var disponibilidadeFormador = await _context.DisponibilidadeFormadores
                .Where(df => df.IdFormador == formadorId)
                .Select(df => new DisponibilidadeFormadorDTO
                {
                    Id = df.IdDispFormador,
                    IdFormador = df.IdFormador,
                    Data = df.DataDisponivel,
                    HoraInicio = df.HoraInicio,
                    HoraFim = df.HoraFim,
                }
                )
                .ToListAsync();

            if(disponibilidadeFormador == null)
            {
                return BadRequest(new {message = "Ainda não marcou nenhuma disponibilidade"});
            }

            return Ok(disponibilidadeFormador);
        }

        [HttpPost]
        public async Task<ActionResult<DisponibilidadeFormador>> AtualizarDisponibilidadeFormador([FromBody] AdicionarDisponibilidadeFormadorDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // ir buscar o formador associado ao utilizador
            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            DateOnly data = DateOnly.Parse(dto.Data);

            TimeOnly inicio, fim;

            inicio = TimeOnly.Parse(dto.HoraInicio);
            fim = TimeOnly.Parse(dto.HoraFim);

            var duracao = fim - inicio;

            if (duracao.TotalHours < 1)
            {
                return BadRequest(new { message = "A disponibilidade mínima tem ser de 1 hora." });
            }

            var existeMarcacao = await _context.DisponibilidadeFormadores.AnyAsync(df => df.IdFormador == formadorId
                  && df.DataDisponivel == data && inicio < df.HoraFim && fim > df.HoraInicio );

            if (existeMarcacao) {
                return BadRequest(new { message = "Já alocou disponibilidade para esse horário." });
            }

            var novaDisponibilidade = new DisponibilidadeFormador
            {
                IdFormador = formadorId,
                DataDisponivel = data,
                HoraInicio = inicio,
                HoraFim = fim
            };

            try
            {
                _context.DisponibilidadeFormadores.Add(novaDisponibilidade);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao gravar na BD: " + ex.Message });
            }
            return Ok(novaDisponibilidade);
        }

        [HttpPost("inputs")]
        public async Task<IActionResult> AdicionarDisponibilidadeFormador([FromBody] AdicionarDisponibilidadeFormadorInputsDTO dto)
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
            {
                return BadRequest(new { message = "Formador não encontrado." });
            }

            DateOnly dataInicio, dataFim;
            TimeOnly horaInicio, horaFim;

            try
            {
                dataInicio = DateOnly.Parse(dto.DataInicio);
                dataFim = DateOnly.Parse(dto.DataFim);
                horaInicio = TimeOnly.Parse(dto.HoraInicio);
                horaFim = TimeOnly.Parse(dto.HoraFim);
            }
            catch
            {
                return BadRequest(new { message = "Formato de data ou hora inválido." });
            }

            if (dataFim < dataInicio)
            {
                return BadRequest(new { message = "A data de fim tem de ser posterior à data de início." });
            }

            if (horaFim <= horaInicio)
            {
                return BadRequest(new { message = "A hora de fim tem de ser depois da hora de início." });
            }

            if ((horaFim - horaInicio).TotalHours < 1)
            {
                return BadRequest(new { message = "A disponibilidade mínima tem de ser de 1 hora." });
            }

            if (horaInicio < new TimeOnly(8, 0) || horaFim > new TimeOnly(23, 0))
            {
                return BadRequest(new { message = "Não é permitido adicionar disponibilidade entre as 23h e as 08h." });
            }

            var disponibilidades = new List<DisponibilidadeFormador>();

            for (var data = dataInicio; data <= dataFim; data = data.AddDays(1))
            {
                // Ignorar fins de semana
                if (data.DayOfWeek == DayOfWeek.Saturday ||
                    data.DayOfWeek == DayOfWeek.Sunday)
                {
                    continue;
                }

                bool existeConflito = await _context.DisponibilidadeFormadores
                    .AnyAsync(df =>
                        df.IdFormador == formadorId &&
                        df.DataDisponivel == data &&
                        horaInicio < df.HoraFim &&
                        horaFim > df.HoraInicio
                    );

                if (existeConflito)
                {
                    return BadRequest(new
                    {
                        message = $"Já existe disponibilidade marcada para este dia hora."
                    });
                }

                disponibilidades.Add(new DisponibilidadeFormador
                {
                    IdFormador = formadorId,
                    DataDisponivel = data,
                    HoraInicio = horaInicio,
                    HoraFim = horaFim
                });
            }


            if (!disponibilidades.Any())
            {
                return BadRequest(new
                {
                    message = "O intervalo selecionado não contém dias úteis."
                });
            }

            _context.DisponibilidadeFormadores.AddRange(disponibilidades);
            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Disponibilidade adicionada com sucesso.",
                total = disponibilidades.Count
            });

        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> ApagarDisponibilidadeFormador(int id)
        {
            var disponibilidade = await _context.DisponibilidadeFormadores.FindAsync(id);

            if (disponibilidade == null)
            {
                return NotFound(new { message = "Disponibilidade não encontrada." });
            }

            DateOnly hoje = DateOnly.FromDateTime(DateTime.Now);
            hoje = hoje.AddMonths(1);
            if ( disponibilidade.DataDisponivel < hoje)
            {
                return BadRequest(new { message = "Não pode eliminar uma disponibilidade que esteja no espaço de um mês."});
            }

            // Verifica se existe algum horário que colide com a disponibilidade que queremos eliminar
            var existeHorario = await _context.Horarios
                .AnyAsync(h => h.IdFormador == disponibilidade.IdFormador
                             && h.Data == disponibilidade.DataDisponivel
                             && h.HoraInicio < disponibilidade.HoraFim
                             && h.HoraFim > disponibilidade.HoraInicio); 

            if (existeHorario)
            {
                return BadRequest(new { message = "Já existe um horário marcado com base na disponibilidade dada." });
            }

            _context.DisponibilidadeFormadores.Remove(disponibilidade);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
