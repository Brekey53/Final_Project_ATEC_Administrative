using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Modulo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // GET: api/Modulos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Modulo>>> GetModulos()
        {
            var modulos = await _context.Modulos
                .OrderBy(m => m.Nome)
                .ToListAsync();

            return Ok(modulos);
        }

        // GET: api/Modulos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Modulo>> GetModulo(int id)
        {
            var modulo = await _context.Modulos.FindAsync(id);

            if (modulo == null)
            {
                return NotFound();
            }

            return modulo;
        }

        // PUT: api/Modulos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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

        // POST: api/Modulos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<ActionResult<Modulo>> PostModulo(NewModuloDTO moduloDto)
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
                Creditos = moduloDto.Creditos
            };


            try
            {
                _context.Modulos.Add(novoModulo);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetModulo", new { id = novoModulo.IdModulo }, novoModulo);
            }
            catch (DbUpdateException)
            {
                // Erro genérico de base de dados
                return StatusCode(500, new { message = "Erro ao guardar no servidor. Tente novamente mais tarde." });
            }
        }

        // DELETE: api/Modulos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModulo(int id)
        {

            var modulo = await _context.Modulos.FindAsync(id);
            if (modulo == null)
            {
                return NotFound(new {message = "Modulo não encontrado"});
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

            // não remover (Soft Delete)
            //_context.modulo.Remove(modulo); 
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ModuloExists(int id)
        {
            return _context.Modulos.Any(e => e.IdModulo == id);
        }
    }
}
