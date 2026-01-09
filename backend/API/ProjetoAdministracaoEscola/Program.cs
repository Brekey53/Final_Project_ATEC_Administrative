using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.Facebook;
using dotenv.net;

DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddEnvironmentVariables();

var connectionString = builder.Configuration["DB_CONNECTION"];


// Conect to database
builder.Services.AddDbContext<SistemaGestaoContext>(options => 
options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Authentication services
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
}).AddCookie(options =>
{
    options.LoginPath = "/api/auth/login";
})
.AddCookie("ExternalCookieScheme") // Esquema temporário para controller
.AddGoogle(GoogleOptions =>
{
    GoogleOptions.ClientId = builder.Configuration["GOOGLE_API_ID"];
    GoogleOptions.ClientSecret = builder.Configuration["GOOGLE_API_KEY"];
    GoogleOptions.SignInScheme = "ExternalCookieScheme"; // Deve de coincidir com controller
})
.AddFacebook(FacebookOptions =>
{
    FacebookOptions.AppId = builder.Configuration["FACEBOOK_API_ID"];
    FacebookOptions.AppSecret = builder.Configuration["FACEBOOK_API_KEY"];
    FacebookOptions.SignInScheme = "ExternalCookieScheme"; // Deve de coincidir com controller
});

// Add Authorization services
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("PermitirTudo");

// Habilitar autenticação e autorização (sempre por esta ordem)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
