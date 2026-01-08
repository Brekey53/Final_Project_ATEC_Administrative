using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilizadoresController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public UtilizadoresController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Utilizadores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Utilizador>>> GetUtilizadores()
        {
            return await _context.Utilizadores.ToListAsync();
        }

        // GET: api/Utilizadores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Utilizador>> GetUtilizador(int id)
        {
            var utilizador = await _context.Utilizadores.FindAsync(id);

            if (utilizador == null)
            {
                return NotFound();
            }

            return utilizador;
        }

        // PUT: api/Utilizadores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUtilizador(int id, Utilizador utilizador)
        {
            if (id != utilizador.IdUtilizador)
            {
                return BadRequest();
            }

            _context.Entry(utilizador).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UtilizadorExists(id))
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

        // POST: api/Utilizadores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Utilizador>> PostUtilizador(Utilizador utilizador)
        {

            utilizador.PasswordHash = EncryptString(utilizador.PasswordHash);

            _context.Utilizadores.Add(utilizador);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUtilizadore", new { id = utilizador.IdUtilizador }, utilizador);
        }

        // DELETE: api/Utilizadores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUtilizador(int id)
        {
            var utilizador = await _context.Utilizadores.FindAsync(id);
            if (utilizador == null)
            {
                return NotFound();
            }

            _context.Utilizadores.Remove(utilizador);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UtilizadorExists(int id)
        {
            return _context.Utilizadores.Any(e => e.IdUtilizador == id);
        }

        public static string EncryptString(string Message)

        {

            string Passphrase = "oMeuChaPeuTemTrezEntosE?SesSentAeNoveBi?cosEquaTroCa!nt#os";

            byte[] Results;

            System.Text.UTF8Encoding UTF8 = new System.Text.UTF8Encoding();

            // Step 1. We hash the passphrase using MD5

            // We use the MD5 hash generator as the result is a 128 bit byte array

            // which is a valid length for the TripleDES encoder we use below

            MD5CryptoServiceProvider HashProvider = new MD5CryptoServiceProvider();

            byte[] TDESKey = HashProvider.ComputeHash(UTF8.GetBytes(Passphrase));

            // Step 2. Create a new TripleDESCryptoServiceProvider object

            TripleDESCryptoServiceProvider TDESAlgorithm = new TripleDESCryptoServiceProvider();

            // Step 3. Setup the encoder

            TDESAlgorithm.Key = TDESKey;

            TDESAlgorithm.Mode = CipherMode.ECB;

            TDESAlgorithm.Padding = PaddingMode.PKCS7;

            // Step 4. Convert the input string to a byte[]

            byte[] DataToEncrypt = UTF8.GetBytes(Message);

            // Step 5. Attempt to encrypt the string

            try

            {

                ICryptoTransform Encryptor = TDESAlgorithm.CreateEncryptor();

                Results = Encryptor.TransformFinalBlock(DataToEncrypt, 0, DataToEncrypt.Length);

            }

            finally

            {

                // Clear the TripleDes and Hashprovider services of any sensitive information

                TDESAlgorithm.Clear();

                HashProvider.Clear();

            }

            // Step 6. Return the encrypted string as a base64 encoded string

            string enc = Convert.ToBase64String(Results);

            enc = enc.Replace("+", "KKK");

            enc = enc.Replace("/", "JJJ");

            enc = enc.Replace("\\", "III");

            return enc;

        }

        public static string DecryptString(string Message)

        {

            string Passphrase = "oMeuChaPeuTemTrezEntosE?SesSentAeNoveBi?cosEquaTroCa!nt#os";

            byte[] Results;

            System.Text.UTF8Encoding UTF8 = new System.Text.UTF8Encoding();

            // Step 1. We hash the passphrase using MD5

            // We use the MD5 hash generator as the result is a 128 bit byte array

            // which is a valid length for the TripleDES encoder we use below

            MD5CryptoServiceProvider HashProvider = new MD5CryptoServiceProvider();

            byte[] TDESKey = HashProvider.ComputeHash(UTF8.GetBytes(Passphrase));

            // Step 2. Create a new TripleDESCryptoServiceProvider object

            TripleDESCryptoServiceProvider TDESAlgorithm = new TripleDESCryptoServiceProvider();

            // Step 3. Setup the decoder

            TDESAlgorithm.Key = TDESKey;

            TDESAlgorithm.Mode = CipherMode.ECB;

            TDESAlgorithm.Padding = PaddingMode.PKCS7;

            // Step 4. Convert the input string to a byte[]

            Message = Message.Replace("KKK", "+");

            Message = Message.Replace("JJJ", "/");

            Message = Message.Replace("III", "\\");


            byte[] DataToDecrypt = Convert.FromBase64String(Message);

            // Step 5. Attempt to decrypt the string

            try

            {

                ICryptoTransform Decryptor = TDESAlgorithm.CreateDecryptor();

                Results = Decryptor.TransformFinalBlock(DataToDecrypt, 0, DataToDecrypt.Length);

            }

            finally

            {

                // Clear the TripleDes and Hashprovider services of any sensitive information

                TDESAlgorithm.Clear();

                HashProvider.Clear();

            }

            // Step 6. Return the decrypted string in UTF8 format

            return UTF8.GetString(Results);

        }

    }
}
