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
                        .OrderBy(cm => cm.Prioridade)
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
            //Buscar curso e modulos
            var curso = await _context.Cursos
                .Include(c => c.CursosModulos)
                .FirstOrDefaultAsync(c => c.IdCurso == id);

            if (curso == null)
                return NotFound(new { message = "Curso não encontrado." });

            bool areaExiste = await _context.Areas.AnyAsync(a => a.IdArea == dto.IdArea);
            if (!areaExiste)
                return BadRequest(new { message = "Área inválida." });

            // Atualizar Campos nome e área
            curso.Nome = dto.Nome;
            curso.IdArea = dto.IdArea;

            // Validar modulos 
            var modulosValidos = await _context.Modulos
                .Where(m => dto.ModuloIds.Contains(m.IdModulo))
                .Select(m => m.IdModulo)
                .ToListAsync();

            if (modulosValidos.Count != dto.ModuloIds.Count)
                return BadRequest(new { message = "Um ou mais módulos são inválidos." });

            // Remover Modulos 
            var aRemover = curso.CursosModulos
                .Where(cm => !dto.ModuloIds.Contains(cm.IdModulo))
                .ToList();

            _context.CursosModulos.RemoveRange(aRemover);

            // Adicionar Modulos
            var existentes = curso.CursosModulos
                .Select(cm => cm.IdModulo)
                .ToHashSet();

            foreach (var idModulo in dto.ModuloIds)
            {
                if (!existentes.Contains(idModulo))
                {
                    curso.CursosModulos.Add(new CursosModulo
                    {
                        IdCurso = curso.IdCurso,
                        IdModulo = idModulo,
                        Prioridade = 0
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCurso(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null)
            {
                return NotFound();
            }

            _context.Cursos.Remove(curso);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CursoExists(int id)
        {
            return _context.Cursos.Any(e => e.IdCurso == id);
        }
    }
}
