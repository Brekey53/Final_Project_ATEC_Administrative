using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Sala;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalasController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public SalasController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Salas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalaDTO>>> GetSalas()
        {

            var salas = await _context.Salas.Include(s => s.IdTipoSalaNavigation)
                .Select(s => new SalaDTO
                {
                       IdSala = s.IdSala,
                    Descricao = s.Descricao,
                    NumMaxAlunos = s.NumMaxAlunos,
                    IdTipoSala =  s.IdTipoSalaNavigation.IdTipoSala,
                    TipoSala = s.IdTipoSalaNavigation.Nome
                }
                )
                .OrderBy(s => s.IdSala)
                .ToListAsync();

            return Ok(salas);
        }

        // GET: api/salas/disponiveis?data=2024-01-30&inicio=09:00&fim=13:00
        [HttpGet("disponiveis")]
        public async Task<ActionResult<IEnumerable<SalaGetDTO>>> GetSalasDisponiveis(
            [FromQuery] string data,
            [FromQuery] string inicio,
            [FromQuery] string fim,
            [FromQuery] int? idCursoModulo)
        {
            //Validação e Conversão de Inputs
            if (!DateOnly.TryParse(data, out var dataDate))
                return BadRequest(new { message = "Data inválida." });

            if (!TimeOnly.TryParse(inicio, out var horaInicio))
                return BadRequest(new { message = "Hora de início inválida." });

            if (!TimeOnly.TryParse(fim, out var horaFim))
                return BadRequest(new { message = "Hora de fim inválida." });

            if (horaInicio >= horaFim)
                return BadRequest(new { message = "A hora de início deve ser anterior à hora de fim." });

            // Identificar Salas Ocupadas
            var salasOcupadasIds = await _context.Horarios
                    .Where(h => h.Data == dataDate && h.HoraInicio < horaFim && h.HoraFim > horaInicio)
                    .Select(h => h.IdSala)
                    .Distinct()
                    .ToListAsync();

            // DEFINIR FILTROS DE TIPO DE SALA
            List<string> tiposPermitidos = new List<string>();
            bool aplicarFiltroArea = false;

            if (idCursoModulo.HasValue && idCursoModulo > 0)
            {
                // Vamos buscar o Nome da Área associada a este módulo
                var infoCurso = await _context.CursosModulos
                    .Include(cm => cm.IdCursoNavigation)
                        .ThenInclude(c => c.IdAreaNavigation)
                    .Where(cm => cm.IdCursoModulo == idCursoModulo)
                    .Select(cm => cm.IdCursoNavigation.IdAreaNavigation.Nome)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(infoCurso))
                {
                    aplicarFiltroArea = true;

                    // Aqui é definido quem pode ir para onde
                    switch (infoCurso)
                    {
                        case "Informática":
                            tiposPermitidos.AddRange(new[] { "Laboratório Informática", "Sala Teórica", "Auditório", "Online" });
                            break;

                        case "Mecânica":
                        case "Automação":
                            tiposPermitidos.AddRange(new[] { "Oficina", "Laboratório Técnico", "Sala Teórica", "Online" });
                            break;

                        case "Eletrónica":
                            tiposPermitidos.AddRange(new[] { "Laboratório Técnico", "Sala Teórica", "Online" });
                            break;

                        case "Gestão":
                            tiposPermitidos.AddRange(new[] { "Sala Teórica", "Sala Polivalente", "Sala Reuniões", "Online" });
                            break;

                        default:
                            // Se a área não tiver regra, permitimos apenas salas teóricas
                            tiposPermitidos.AddRange(new[] { "Sala Teórica", "Online" });
                            break;
                    }
                }
            }

            var query = _context.Salas
                .Include(s => s.IdTipoSalaNavigation)
                .Where(s => !salasOcupadasIds.Contains(s.IdSala));

            // Aplica o filtro se tivermos regras definidas
            if (aplicarFiltroArea && tiposPermitidos.Any())
            {
                query = query.Where(s => tiposPermitidos.Contains(s.IdTipoSalaNavigation.Nome));
            }

            var salasFinais = await query
                .Select(s => new SalaGetDTO
                {
                    IdSala = s.IdSala,
                    NomeSala = s.Descricao,
                    Tipo = s.IdTipoSalaNavigation.Nome,
                    Capacidade = s.NumMaxAlunos
                })
                .ToListAsync();

            return Ok(salasFinais);
        }

        // GET: api/Salas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalaDTO>> GetSala(int id)
        {
            var sala = await _context.Salas
                .Include(s => s.IdTipoSalaNavigation)
                .Where(s => s.IdSala == id)
                .Select(s => new SalaDTO
                {
                    IdSala = s.IdSala,
                    Descricao = s.Descricao,
                    NumMaxAlunos = s.NumMaxAlunos,
                    IdTipoSala = s.IdTipoSala,
                    TipoSala = s.IdTipoSalaNavigation.Nome
                })
                .FirstOrDefaultAsync();

            if (sala == null)
                return NotFound();

            return Ok(sala);
        }


        // PUT: api/Salas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSala(int id, SalaDTO salaDto)
        {
            if (id != salaDto.IdSala)
                return BadRequest(new { message = "ID inválido." });

            var sala = await _context.Salas.FindAsync(id);
            if (sala == null)
                return NotFound(new { message = "Sala não encontrada." });

            // validar tipo de sala
            var tipoExiste = await _context.TipoSala
                .AnyAsync(t => t.IdTipoSala == salaDto.IdTipoSala);

            if (!tipoExiste)
                return BadRequest(new { message = "Tipo de sala inválido." });

            // validar descrição duplicada
            var nomeEmUso = await _context.Salas
                .AnyAsync(s => s.Descricao == salaDto.Descricao && s.IdSala != id);

            if (nomeEmUso)
                return Conflict(new { message = "Já existe outra sala com esta descrição." });

            // atualizar
            sala.Descricao = salaDto.Descricao;
            sala.NumMaxAlunos = salaDto.NumMaxAlunos;
            sala.IdTipoSala = salaDto.IdTipoSala;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // POST: api/Salas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sala>> PostSala(SalaDTO salaDto)
        {
            var existe = await _context.Salas
                .AnyAsync(s => s.Descricao == salaDto.Descricao);

            if (existe)
                return Conflict(new { message = "Já existe uma sala com esta descrição." });

            var tipoExiste = await _context.TipoSala
                .AnyAsync(t => t.IdTipoSala == salaDto.IdTipoSala);

            if (!tipoExiste)
                return BadRequest(new { message = "Tipo de sala inválido." });

            var novaSala = new Sala
            {
                Descricao = salaDto.Descricao,
                NumMaxAlunos = salaDto.NumMaxAlunos,
                IdTipoSala = salaDto.IdTipoSala
            };

            _context.Salas.Add(novaSala);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSala), new { id = novaSala.IdSala }, novaSala);
        }


        // DELETE: api/Salas/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSala(int id)
        {
            var sala = await _context.Salas.FindAsync(id);
            if (sala == null)
            {
                return NotFound(new {message = "Sala não encontrada" });
            }

            var salaEmUso = await _context.Horarios.AnyAsync(h => h.IdSala == id);

            if (salaEmUso)
            {
                return BadRequest(new { message = "Não é possivel eliminar a sala pois existem aulas agendadas para a própria." });
            }

            _context.Salas.Remove(sala);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SalaExists(int id)
        {
            return _context.Salas.Any(e => e.IdSala == id);
        }
    }
}
