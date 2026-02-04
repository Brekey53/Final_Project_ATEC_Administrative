using Humanizer;
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

            if (duracao.TotalHours < 2)
            {
                return BadRequest(new { message = "A disponibilidade mínima tem ser de 2 horas." });
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
