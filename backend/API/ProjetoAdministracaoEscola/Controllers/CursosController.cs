using iText.StyledXmlParser.Jsoup.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Curso;
using ProjetoAdministracaoEscola.ModelsDTO.Modulo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CursosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public CursosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Cursos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CursoDTO>>> GetCursos()
        {
            var cursos = await _context.Cursos.Include(c => c.IdAreaNavigation)
                .Select(c => new CursoDTO
                {
                    IdCurso = c.IdCurso,
                    IdArea = c.IdArea,
                    Nome = c.Nome,
                    NomeArea = c.IdAreaNavigation.Nome
                })
                .OrderBy(c => c.Nome)
                .ToListAsync();

            return Ok(cursos);
        }

        // GET: api/Cursos/areaCursos
        [HttpGet("areacursos")]
        public async Task<ActionResult<IEnumerable<AreaCursoDto>>> GetAreaCursos()
        {
            var areas = await _context.Areas
                .Select(c => new AreaCursoDto
                {
                    IdArea = c.IdArea,
                    Nome = c.Nome
                })
                .OrderBy(c => c.Nome)
                .ToListAsync();

            return Ok(areas);
        }



        // GET: api/Cursos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CursoDTO>> GetCurso(int id)
        {
            var curso = await _context.Cursos
                .Where(c => c.IdCurso == id)
                .Select(c => new CursoDTO
                {
                    IdCurso = c.IdCurso,
                    IdArea = c.IdArea,
                    Nome = c.Nome,
                    NomeArea = c.IdAreaNavigation.Nome,
                    Modulos = c.CursosModulos
                        .OrderBy(cm => cm.IdModuloNavigation.Nome)
                        .Select(cm => new ModuloDTO
                        {
                            IdModulo = cm.IdModuloNavigation.IdModulo,
                            Nome = cm.IdModuloNavigation.Nome,
                            HorasTotais = cm.IdModuloNavigation.HorasTotais,
                            Creditos = cm.IdModuloNavigation.Creditos,
                            Prioridade = cm.Prioridade
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (curso == null)
                return NotFound();

            return Ok(curso);
        }

        // PUT: api/Cursos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCurso(int id, UpdateCursoDTO dto)
        {
            var curso = await _context.Cursos
                .Include(c => c.CursosModulos)
                .FirstOrDefaultAsync(c => c.IdCurso == id);

            if (curso == null)
                return NotFound(new { message = "Curso não encontrado." });

            if (!await _context.Areas.AnyAsync(a => a.IdArea == dto.IdArea))
                return BadRequest(new { message = "Área inválida." });

            curso.Nome = dto.Nome;
            curso.IdArea = dto.IdArea;

            // validar módulos
            var idsDto = dto.Modulos.Select(m => m.IdModulo).ToList();

            var modulosValidos = await _context.Modulos
                .Where(m => idsDto.Contains(m.IdModulo))
                .Select(m => m.IdModulo)
                .ToListAsync();

            if (modulosValidos.Count != idsDto.Count)
                return BadRequest(new { message = "Um ou mais módulos são inválidos." });

            // remover módulos que já não vêm
            var aRemover = curso.CursosModulos
                .Where(cm => !idsDto.Contains(cm.IdModulo))
                .ToList();

            _context.CursosModulos.RemoveRange(aRemover);

            // atualizar / adicionar
            foreach (var moduloDto in dto.Modulos)
            {
                var existente = curso.CursosModulos
                    .FirstOrDefault(cm => cm.IdModulo == moduloDto.IdModulo);

                if (existente != null)
                {
                    // atualizar prioridade
                    existente.Prioridade = moduloDto.Prioridade;
                }
                else
                {
                    // adicionar novo
                    curso.CursosModulos.Add(new CursosModulo
                    {
                        IdCurso = curso.IdCurso,
                        IdModulo = moduloDto.IdModulo,
                        Prioridade = moduloDto.Prioridade
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }




        // POST: api/Cursos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Curso>> PostCurso(CreateCursoDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var curso = new Curso
            {
                Nome = dto.Nome,
                IdArea = dto.IdArea,
                Descricao = dto.Descricao
            };

            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCurso),
                new { id = curso.IdCurso },
                curso
            );
        }


        // DELETE: api/Cursos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCurso(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null)
            {
                return NotFound(new {message = "Curso não encontrado."});
            }


            var cursoEmUso = await _context.Horarios.AnyAsync(h => h.IdCursoModuloNavigation.IdCursoNavigation.IdCurso == id &&
            h.Data > DateOnly.FromDateTime(DateTime.Now));

            if (cursoEmUso)
            {
                return BadRequest(new { message = "Não é possivel eliminar o curso pois existem aulas agendadas para o próprio." });
            }

            curso.Ativo = false;
            curso.DataDesativacao = DateTime.Now;

            // não remover (Soft Delete)
            //_context.Cursos.Remove(curso); 
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CursoExists(int id)
        {
            return _context.Cursos.Any(e => e.IdCurso == id);
        }
    }
}
