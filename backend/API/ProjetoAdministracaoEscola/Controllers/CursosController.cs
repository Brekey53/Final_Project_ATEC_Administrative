using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Curso;
using ProjetoAdministracaoEscola.ModelsDTO.Modulo;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CursosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public CursosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todos os cursos ativos.
        /// </summary>
        /// <remarks>
        /// Devolve os cursos ordenados por nome, incluindo o nome da área associada.
        /// </remarks>
        /// <returns>
        /// 200 OK com a lista de cursos.
        /// </returns>
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

        /// <summary>
        /// Obtém a lista de todas as áreas de cursos.
        /// </summary>
        /// <remarks>
        /// Devolve apenas o id e o nome de cada área,
        /// ordenados alfabeticamente.
        /// </remarks>
        /// <returns>
        /// 200 OK com a lista de áreas.
        /// </returns>
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

        /// <summary>
        /// Obtém os detalhes de um curso específico.
        /// </summary>
        /// <param name="id">
        /// Id do curso.
        /// </param>
        /// <remarks>
        /// Inclui a lista de módulos associados ao curso,
        /// ordenados pelo nome do módulo.
        /// </remarks>
        /// <returns>
        /// 200 OK com os dados do curso;
        /// 404 NotFound se o curso não existir.
        /// </returns>
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

        /// <summary>
        /// Atualiza os dados de um curso existente,
        /// incluindo os módulos associados.
        /// </summary>
        /// <param name="id">
        /// Id do curso a atualizar.
        /// </param>
        /// <param name="dto">
        /// Dados atualizados do curso, incluindo área e módulos.
        /// </param>
        /// <remarks>
        /// Valida a existência da área e dos módulos indicados.
        /// Atualiza prioridades dos módulos existentes,
        /// adiciona novos e remove os que deixaram de estar associados.
        /// </remarks>
        /// <returns>
        /// 204 NoContent se a atualização for bem-sucedida;
        /// 400 BadRequest se a área ou módulos forem inválidos;
        /// 404 NotFound se o curso não existir.
        /// </returns>
        // PUT: api/Cursos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
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


        /// <summary>
        /// Cria um novo curso.
        /// </summary>
        /// <param name="dto">
        /// Dados necessários para criação do curso.
        /// </param>
        /// <remarks>
        /// O curso é criado com a área associada e descrição.
        /// </remarks>
        /// <returns>
        /// 201 Created se o curso for criado com sucesso;
        /// 400 BadRequest se o modelo for inválido.
        /// </returns>
        // POST: api/Cursos
        [Authorize(Policy = "AdminOrAdministrativo")]
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

        /// <summary>
        /// Desativa um curso existente (soft delete).
        /// </summary>
        /// <param name="id">
        /// Identificador do curso a desativar.
        /// </param>
        /// <remarks>
        /// O curso não é removido da base de dados.
        /// Apenas é marcado como inativo.
        /// 
        /// A operação falha se existirem aulas futuras
        /// associadas ao curso.
        /// </remarks>
        /// <returns>
        /// 204 NoContent se a desativação for bem-sucedida;
        /// 400 BadRequest se existirem aulas futuras associadas;
        /// 404 NotFound se o curso não existir;
        /// 401 Unauthorized se o utilizador não tiver permissão.
        /// </returns>
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
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
