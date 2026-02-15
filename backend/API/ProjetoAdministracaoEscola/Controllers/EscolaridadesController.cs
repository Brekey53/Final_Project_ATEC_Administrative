using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Escolaridades;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EscolaridadesController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public EscolaridadesController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todas as escolaridades.
        /// </summary>
        /// <returns>
        /// 200 OK com a lista de escolaridades.
        /// </returns>
        // GET: api/Escolaridades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EscolaridadesDTO>>> GetEscolaridades()
        {
            var escolaridades = await _context.Escolaridades
                .Select( e => new EscolaridadesDTO {
                    IdEscolaridade = e.IdEscolaridade,
                    Nivel = e.Nivel
                })
                .ToListAsync();

            return Ok(escolaridades);
        }

        /// <summary>
        /// Obtém uma escolaridade específica pelo seu identificador.
        /// </summary>
        /// <param name="id">
        /// Id da escolaridade.
        /// </param>
        /// <returns>
        /// 200 OK com a escolaridade encontrada;
        /// 404 NotFound se a escolaridade não existir.
        /// </returns>
        // GET: api/Escolaridades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EscolaridadesDTO>> GetEscolaridade(int id)
        {
            var escolaridade = await _context.Escolaridades
                .Select(e => new EscolaridadesDTO
                {
                    IdEscolaridade = e.IdEscolaridade,
                    Nivel = e.Nivel
                }).FirstOrDefaultAsync();

            if (escolaridade == null)
            {
                return NotFound();
            }

            return Ok(escolaridade);
        }

        /// <summary>
        /// Atualiza os dados de uma escolaridade existente.
        /// </summary>
        /// <param name="id">
        /// Id da escolaridade a atualizar.
        /// </param>
        /// <param name="escolaridade">
        /// Objeto contendo os dados atualizados da escolaridade.
        /// </param>
        /// <returns>
        /// 204 NoContent se a atualização for bem-sucedida;
        /// 400 BadRequest se o id não corresponder;
        /// 404 NotFound se a escolaridade não existir.
        /// </returns>
        // PUT: api/Escolaridades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEscolaridade(int id, Escolaridade escolaridade)
        {
            if (id != escolaridade.IdEscolaridade)
            {
                return BadRequest();
            }

            _context.Entry(escolaridade).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EscolaridadeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Cria uma nova escolaridade.
        /// </summary>
        /// <param name="escolaridade">
        /// Objeto contendo os dados da nova escolaridade.
        /// </param>
        /// <returns>
        /// 201 Created com a escolaridade criada;
        /// </returns>
        // POST: api/Escolaridades
        [HttpPost]
        public async Task<ActionResult<Escolaridade>> PostEscolaridade(Escolaridade escolaridade)
        {
            _context.Escolaridades.Add(escolaridade);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEscolaridade", new { id = escolaridade.IdEscolaridade }, escolaridade);
        }

        /// <summary>
        /// Remove uma escolaridade existente.
        /// </summary>
        /// <param name="id">
        /// Identificador da escolaridade a remover.
        /// </param>
        /// <returns>
        /// 204 NoContent se a remoção for bem-sucedida;
        /// 404 NotFound se a escolaridade não existir.
        /// </returns>
        // DELETE: api/Escolaridades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEscolaridade(int id)
        {
            var escolaridade = await _context.Escolaridades.FindAsync(id);
            if (escolaridade == null)
            {
                return NotFound();
            }

            _context.Escolaridades.Remove(escolaridade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Verifica se uma escolaridade existe na base de dados.
        /// </summary>
        /// <param name="id">
        /// Identificador da escolaridade.
        /// </param>
        /// <returns>
        /// True se existir; caso contrário, False.
        /// </returns>
        private bool EscolaridadeExists(int id)
        {
            return _context.Escolaridades.Any(e => e.IdEscolaridade == id);
        }
    }
}
