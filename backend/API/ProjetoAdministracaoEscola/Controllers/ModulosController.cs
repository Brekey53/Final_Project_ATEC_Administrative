using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Modulo.Requests;
using ProjetoAdministracaoEscola.ModelsDTO.Modulo.Responses;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ModulosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public ModulosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todos os módulos registados no sistema.
        /// </summary>
        /// <returns>
        /// Lista de módulos em formato <see cref="ModulosGetAll"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="403">Utilizador sem permissões suficientes.</response>
        // GET: api/Modulos
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModulosGetAll>>> GetModulos()
        {
            var modulos = await _context.Modulos
                .Select(m => new ModulosGetAll
                {
                    IdModulo = m.IdModulo,
                    CodigoIdentificacao = m.CodigoIdentificacao,
                    Nome = m.Nome,
                    HorasTotais = m.HorasTotais,
                    Creditos = m.Creditos
                })
                .OrderBy(m => m.Nome)
                .ToListAsync();

            return Ok(modulos);
        }

        /// <summary>
        /// Obtém o nome dos modulos
        /// </summary>
        // GET: api/Modulos/nome
        [HttpGet("nome")]
        public async Task<ActionResult<IEnumerable<Modulo>>> GetModulosNome()
        {
            var modulos = await _context.Modulos
                .Select( m => m.Nome)
                .ToListAsync();

            return Ok(modulos);
        }

        /// <summary>
        /// Obtém os detalhes de um módulo específico.
        /// </summary>
        /// <param name="id">Identificador único do módulo.</param>
        /// <returns>
        /// Objeto <see cref="ModuloGetByIdDTO"/> correspondente.
        /// </returns>
        /// <response code="200">Módulo encontrado com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="403">Utilizador sem permissões suficientes.</response>
        /// <response code="404">Módulo não encontrado.</response>
        // GET: api/Modulos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}")]
        public async Task<ActionResult<ModuloGetByIdDTO>> GetModulo(int id)
        {
            var modulo = await _context.Modulos
                .Where(m => m.IdModulo == id)
                .Select(m => new ModuloGetByIdDTO
                {
                    IdModulo = m.IdModulo,
                    CodigoIdentificacao = m.CodigoIdentificacao,
                    Nome = m.Nome,
                    HorasTotais = m.HorasTotais,
                    Creditos = m.Creditos,
                    NomeTipoMateria = m.IdTipoMateriaNavigation.Tipo
                })
                .FirstOrDefaultAsync();


            if (modulo == null)
            {
                return NotFound();
            }

            return Ok(modulo);
        }

        /// <summary>
        /// Atualiza os dados de um módulo existente.
        /// </summary>
        /// <param name="id">Identificador do módulo a atualizar.</param>
        /// <param name="moduloDto">Dados atualizados do módulo.</param>
        /// <returns>
        /// Resultado da operação de atualização.
        /// </returns>
        /// <response code="204">Módulo atualizado com sucesso.</response>
        /// <response code="400">Dados inválidos ou IDs inconsistentes.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="404">Módulo não encontrado.</response>
        /// <response code="403">Utilizador sem permissões suficientes.</response>
        /// <response code="409">Código de identificação já está em uso.</response>
        /// <response code="500">Erro interno do servidor.</response>
        // PUT: api/Modulos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutModulo(int id, ModuloUpdateDTO moduloDto)
        {
            // Verificar se o ID do URL coincide com o do corpo do pedido
            if (id != moduloDto.IdModulo)
            {
                return BadRequest(new { message = "O ID do módulo não coincide." });
            }

            // Procurar o módulo original na Base de Dados
            var moduloOriginal = await _context.Modulos.FindAsync(id);

            if (moduloOriginal == null)
            {
                return NotFound(new { message = "Módulo não encontrado." });
            }

            // Verificar se o novo Código de Identificação já está a ser usado por OUTRO módulo
            // (Ignoramos o próprio módulo que estamos a editar)
            var codigoEmUso = await _context.Modulos
                .AnyAsync(m => m.CodigoIdentificacao == moduloDto.CodigoIdentificacao && m.IdModulo != id);

            if (codigoEmUso)
            {
                return Conflict(new { message = $"O código '{moduloDto.CodigoIdentificacao}' já está atribuído a outro módulo." });
            }

            // Mapear as alterações
            moduloOriginal.Nome = moduloDto.Nome;
            moduloOriginal.CodigoIdentificacao = moduloDto.CodigoIdentificacao;
            moduloOriginal.HorasTotais = moduloDto.HorasTotais;
            moduloOriginal.Creditos = moduloDto.Creditos;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ModuloExists(id))
                {
                    return NotFound(new { message = "O módulo foi eliminado por outro utilizador durante a edição." });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Erro interno ao atualizar o módulo." });
            }

            return NoContent(); // Sucesso (204)
        }

        /// <summary>
        /// Cria um novo módulo no sistema.
        /// </summary>
        /// <param name="moduloDto">Dados necessários para criação do módulo.</param>
        /// <returns>
        /// Módulo criado com sucesso.
        /// </returns>
        /// <response code="201">Módulo criado com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="403">Utilizador sem permissões suficientes.</response>
        /// <response code="409">Código de identificação já existente.</response>
        /// <response code="500">Erro interno do servidor.</response>
        // POST: api/Modulos
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<ActionResult<Modulo>> PostModulo([FromBody] NewModuloDTO moduloDto)
        {

            if (string.IsNullOrWhiteSpace(moduloDto.Nome) || string.IsNullOrWhiteSpace(moduloDto.CodigoIdentificacao))
            {
                return BadRequest(new { message = "O nome e o código de identificação são obrigatórios." });
            }

            if (moduloDto.HorasTotais <= 0)
            {
                return BadRequest(new { message = "A carga horária deve ser superior a 0 horas." });
            }

            if (moduloDto.Creditos < 0)
            {
                return BadRequest(new { message = "Os créditos não podem ser valores negativos." });
            }

            var exist = await _context.Modulos.AnyAsync(m => m.CodigoIdentificacao == moduloDto.CodigoIdentificacao);

            if (exist)
            {
                return Conflict(new { message = $"O código '{moduloDto.CodigoIdentificacao}' já está em uso." });
            }

            var novoModulo = new Modulo
            {
                Nome = moduloDto.Nome,
                CodigoIdentificacao = moduloDto.CodigoIdentificacao,
                HorasTotais = moduloDto.HorasTotais,
                Creditos = moduloDto.Creditos,
                IdTipoMateria = moduloDto.IdTipoMateria
            };
            try
            {
                _context.Modulos.Add(novoModulo);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetModulo", new { id = novoModulo.IdModulo }, novoModulo);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, new { message = "Erro ao guardar no servidor." });
            }
        }

        /// <summary>
        /// Obtém todos os tipos de matéria disponíveis no sistema.
        /// </summary>
        /// <returns>
        /// 200 OK com a lista de tipos de matéria.
        /// </returns>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("tiposmateria")]
        public async Task<IActionResult> GetTiposMateria()
        {
            var tiposMateria = await _context.TipoMaterias.ToListAsync();

            return Ok(tiposMateria);
        }

        /// <summary>
        /// Inativa (soft delete) um módulo existente.
        /// A eliminação falha caso existam aulas futuras associadas.
        /// </summary>
        /// <param name="id">Identificador do módulo a eliminar.</param>
        /// <returns>
        /// Resultado da operação de inativação.
        /// </returns>
        /// <response code="204">Módulo inativado com sucesso.</response>
        /// <response code="400">Não é possível eliminar devido a aulas futuras associadas.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="403">Utilizador sem permissões suficientes.</response>
        /// <response code="404">Módulo não encontrado.</response>
        // DELETE: api/Modulos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModulo(int id)
        {

            var modulo = await _context.Modulos.FindAsync(id);
            if (modulo == null)
            {
                return NotFound(new { message = "Modulo não encontrado" });
            }

            // Verificar se o módulo ainda está em uso
            bool moduloEmUso = await _context.Horarios
                .Include(h => h.IdCursoModuloNavigation)
                .AnyAsync(h => h.IdCursoModuloNavigation.IdModulo == id &&
                h.Data > DateOnly.FromDateTime(DateTime.Now));

            if (moduloEmUso)
            {
                return BadRequest(new { message = "Não é possivel eliminar o módulo pois existem aulas agendadas para o próprio." });
            }

            modulo.Ativo = false;
            modulo.DataDesativacao = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Verifica se um módulo existe na base de dados.
        /// </summary>
        /// <param name="id">Identificador do módulo.</param>
        /// <returns>
        /// <c>true</c> se existir; caso contrário, <c>false</c>.
        /// </returns>
        private bool ModuloExists(int id)
        {
            return _context.Modulos.Any(e => e.IdModulo == id);
        }
    }
}