using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador.Request;
using ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador.Responses;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DisponibilidadeFormadorController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public DisponibilidadeFormadorController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de disponibilidades do formador.
        /// </summary>
        /// <remarks>
        /// O utilizador autenticado é identificado através do claim NameIdentifier.
        /// Apenas são devolvidas as disponibilidades associadas ao formador correspondente.
        /// </remarks>
        /// <returns>
        /// 200 OK com a lista de disponibilidades;
        /// 401 Unauthorized se o utilizador não estiver autenticado;
        /// 400 BadRequest se o formador ainda não tiver disponibilidades registadas.
        /// </returns>
        // GET: api/disponibilidadeformador
        [Authorize(Policy = "FormadorOuAdminOuAdministrativo")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DisponibilidadeFormadorDTO>>> GetDisponibilidadeFormador()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized(new { message = "Utilizador não autorizado" });

            int userId = int.Parse(userIdClaim);

            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            if (formadorId == 0)
                return BadRequest(new { message = "Utilizador não é formador" });

            var disponibilidades = await _context.DisponibilidadeFormadores
                .Where(df => df.IdFormador == formadorId)
                .ToListAsync();

            var horarios = await _context.Horarios
                .Where(h => h.IdFormador == formadorId)
                .ToListAsync();

            var eventos = new List<DisponibilidadeFormadorDTO>();

            foreach (var disp in disponibilidades)
            {
                var horariosDoDia = horarios
                    .Where(h => h.Data == disp.DataDisponivel &&
                                h.HoraInicio < disp.HoraFim &&
                                h.HoraFim > disp.HoraInicio)
                    .OrderBy(h => h.HoraInicio)
                    .ToList();

                var cursor = disp.HoraInicio;

                foreach (var h in horariosDoDia)
                {
                    //Bloco disponível antes do horário
                    if (cursor < h.HoraInicio)
                    {
                        eventos.Add(new DisponibilidadeFormadorDTO
                        {
                            Id = disp.IdDispFormador,
                            Data = disp.DataDisponivel,
                            HoraInicio = cursor,
                            HoraFim = h.HoraInicio,
                            Tipo = "Disponivel"
                        });
                    }

                    // Bloco ocupado
                    eventos.Add(new DisponibilidadeFormadorDTO
                    {
                        Id = 0, // não é disponibilidade, é horário
                        Data = h.Data,
                        HoraInicio = h.HoraInicio,
                        HoraFim = h.HoraFim,
                        Tipo = "Ocupado"
                    });

                    cursor = h.HoraFim;
                }

                // Bloco final disponível
                if (cursor < disp.HoraFim)
                {
                    eventos.Add(new DisponibilidadeFormadorDTO
                    {
                        Id = disp.IdDispFormador,
                        Data = disp.DataDisponivel,
                        HoraInicio = cursor,
                        HoraFim = disp.HoraFim,
                        Tipo = "Disponivel"
                    });
                }
            }
            return Ok(eventos);
        }


        /// <summary>
        /// Adiciona uma nova disponibilidade para o formador autenticado.
        /// </summary>
        /// <param name="dto">
        /// Dados da disponibilidade incluindo data, hora de início e hora de fim.
        /// </param>
        /// <remarks>
        /// Valida:
        /// - Duração mínima de 1 hora;
        /// - Conflitos com disponibilidades já existentes.
        /// </remarks>
        /// <returns>
        /// 200 OK com a disponibilidade criada;
        /// 400 BadRequest se existir conflito de horários ou dados inválidos;
        /// 401 Unauthorized se o utilizador não estiver autenticado
        /// ou não estiver associado a um formador.
        /// </returns>
        [Authorize(Policy = "Formador")]
        [HttpPost]
        public async Task<ActionResult<DisponibilidadeFormador>> AtualizarDisponibilidadeFormador(
            [FromBody] AdicionarDisponibilidadeFormadorDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) 
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // ir buscar o formador associado ao utilizador
            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            if(formadorId == 0)
            {
                return Unauthorized( new { message = "Utilizador não é formador"});
            }

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
                return BadRequest(new { message = "Erro ao gravar na BD" });
            }
            return Ok(novaDisponibilidade);
        }

        /// <summary>
        /// Adiciona disponibilidades para o formador autenticado
        /// num intervalo de datas e horário definido.
        /// </summary>
        /// <param name="dto">
        /// Objeto com a data de início, data de fim,
        /// hora de início e hora de fim da disponibilidade.
        /// </param>
        /// <remarks>
        /// Este endpoint:
        /// - Identifica o formador através do utilizador autenticado;
        /// - Valida se o utilizador está associado a um formador;
        /// - Valida o formato das datas e horas;
        /// - Garante que a data de fim é posterior à data de início;
        /// - Garante que a hora de fim é posterior à hora de início;
        /// - Impõe duração mínima de 1 hora;
        /// - Restringe o horário entre as 08h e as 23h;
        /// - Não marca fins de semana;
        /// - Impede conflitos com disponibilidades já existentes;
        /// - Cria múltiplos registos, um por cada dia útil no intervalo.
        /// </remarks>
        /// <returns>
        /// 200 OK com mensagem de sucesso e total de disponibilidades criadas;
        /// 400 BadRequest se existirem dados inválidos, conflitos ou ausência de dias úteis;
        /// 401 Unauthorized se o utilizador não estiver autenticado;
        /// </returns>
        [Authorize(Policy = "Formador")]
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
                return BadRequest(new { message = "Utilizador não é formador" });
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

        /// <summary>
        /// Remove uma disponibilidade específica do formador.
        /// </summary>
        /// <param name="id">
        /// Identificador da disponibilidade a eliminar.
        /// </param>
        /// <remarks>
        /// Este endpoint:
        /// - Verifica se a disponibilidade existe;
        /// - Impede a eliminação caso a data da disponibilidade esteja
        ///   dentro de um período inferior a um mês a partir da data atual;
        /// - Impede a eliminação caso já exista um horário associado
        ///   que colida com a disponibilidade definida;
        /// - Remove o registo da base de dados caso todas as validações sejam cumpridas.
        /// </remarks>
        /// <returns>
        /// 204 NoContent se a eliminação for bem-sucedida;
        /// 400 BadRequest se não for permitido eliminar a disponibilidade;
        /// 404 NotFound se a disponibilidade não existir.
        /// </returns>
        [Authorize(Policy = "Formador")]
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

        [Authorize(Policy = "Formador")]
        [HttpDelete("intervalo")]
        public async Task<IActionResult> ApagarDisponibilidadeFormadorInputs([FromBody] AdicionarDisponibilidadeFormadorInputsDTO dto)
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
                return BadRequest(new { message = "Utilizador não é formador" });

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
                return BadRequest(new { message = "A data de fim tem de ser posterior à data de início." });

            if (horaFim <= horaInicio)
                return BadRequest(new { message = "A hora de fim tem de ser depois da hora de início." });

            var disponibilidades = await _context.DisponibilidadeFormadores
                .Where(df =>
                    df.IdFormador == formadorId &&
                    df.DataDisponivel >= dataInicio &&
                    df.DataDisponivel <= dataFim &&
                    df.HoraInicio == horaInicio &&
                    df.HoraFim == horaFim)
                .ToListAsync();

            if (!disponibilidades.Any())
                return NotFound(new { message = "Nenhuma disponibilidade encontrada para remover." });

            // Verifica se existe horário marcado com base nesta disponibilidade
            var datas = disponibilidades.Select(d => d.DataDisponivel).ToList();

            var existeHorario = await _context.Horarios
                .AnyAsync(h =>
                    h.IdFormador == formadorId &&
                    datas.Contains(h.Data) &&
                    h.HoraInicio < horaFim &&
                    h.HoraFim > horaInicio);

            if (existeHorario)
                return BadRequest(new
                {
                    message = "Existe pelo menos um horário marcado neste intervalo."
                });

            _context.DisponibilidadeFormadores.RemoveRange(disponibilidades);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Disponibilidades removidas com sucesso.",
                total = disponibilidades.Count
            });
        }
    }
}
