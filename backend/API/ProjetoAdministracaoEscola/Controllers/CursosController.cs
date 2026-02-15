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
        /// Obtйm a lista de todos os cursos ativos.
        /// </summary>
        /// <remarks>
        /// Devolve os cursos ordenados por nome, incluindo o nome da бrea associada.
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
        /// Obtйm a lista de todas as бreas de cursos.
        /// </summary>
        /// <remarks>
        /// Devolve apenas o id e o nome de cada бrea,
        /// ordenados alfabeticamente.
        /// </remarks>
        /// <returns>
        /// 200 OK com a lista de бreas.
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
        /// Obtйm os detalhes de um curso especнfico.
        /// </summary>
        /// <param name="id">
        /// Id do curso.
        /// </param>
        /// <remarks>
        /// Inclui a lista de mуdulos associados ao curso,
        /// ordenados pelo nome do mуdulo.
        /// </remarks>
        /// <returns>
        /// 200 OK com os dados do curso;
        /// 404 NotFound se o curso nгo existir.
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
        /// incluindo os mуdulos associados.
        /// </summary>
        /// <param name="id">
        /// Id do curso a atualizar.
        /// </param>
        /// <param name="dto">
        /// Dados atualizados do curso, incluindo бrea e mуdulos.
        /// </param>
        /// <remarks>
        /// Valida a existкncia da бrea e dos mуdulos indicados. <br/>
        /// Atualiza prioridades dos mуdulos existentes,
        /// adiciona novos e remove os que deixaram de estar associados.
        /// </remarks>
        /// <returns>
        /// 204 NoContent se a atualizaзгo for bem-sucedida;<br/>
        /// 400 BadRequest se a бrea ou mуdulos forem invбlidos;<br/>
        /// 404 NotFound se o curso nгo existir.
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
                return BadRequest(new { message = "Бrea inválida." });

            curso.Nome = dto.Nome;
            curso.IdArea = dto.IdArea;

            // validar mуdulos
            var idsDto = dto.Modulos.Select(m => m.IdModulo).ToList();

            var modulosValidos = await _context.Modulos
                .Where(m => idsDto.Contains(m.IdModulo))
                .Select(m => m.IdModulo)
                .ToListAsync();

            if (modulosValidos.Count != idsDto.Count)
                return BadRequest(new { message = "Um ou mais módulos são inválidos." });

            // remover mуdulos que jб nгo vкm
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
        /// Dados necessбrios para criaзгo do curso.
        /// </param>
        /// <remarks>
        /// O curso é criado com a бrea associada e descriзгo.
        /// </remarks>
        /// <returns>
        /// 201 Created se o curso for criado com sucesso;
        /// 400 BadRequest se o modelo for invбlido.
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
        /// O curso nгo й removido da base de dados.<br/>
        /// Apenas é marcado como inativo.
        /// 
        /// A operaзгo falha se existirem turmas ativas
        /// associadas ao curso.
        /// </remarks>
        /// <returns>
        /// 204 NoContent se a desativaзгo for bem-sucedida; <br/>
        /// 400 BadRequest se existirem aulas futuras associadas; <br/> 
        /// 404 NotFound se o curso nгo existir; <br/>
        /// 401 Unauthorized se o utilizador nгo tiver permissгo.
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
            if (!curso.Ativo)
            {
                return BadRequest(new { message = "Este curso já se encontra desativado." });
            }



            var cursoEmUso = await _context.Horarios.AnyAsync(h => h.IdCursoModuloNavigation.IdCursoNavigation.IdCurso == id &&
            h.Data > DateOnly.FromDateTime(DateTime.Now));

            if (cursoEmUso)
            {
                return BadRequest(new { message = "Não é possivel eliminar o curso pois existem aulas agendadas para o próprio." });
            }

            var turmaEmAndamento = await _context.Turmas.AnyAsync(t => t.IdCurso == id && t.Ativo == true);

            if (turmaEmAndamento)
            {
                return BadRequest(new { message = "Não é possivel eliminar o curso pois existem turmas alocadas a este curso." });
            }

            
            curso.Ativo = false;
            curso.DataDesativacao = DateTime.Now;

            // não remover (Soft Delete)
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
