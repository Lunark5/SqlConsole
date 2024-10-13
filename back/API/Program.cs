using API.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<PostgreDb>();
builder.Services.AddTransient<IDbFactory, DbFactory>();
builder.Services.AddOptions();
builder.Services.Configure<ConnectionStrings>(
    builder.Configuration.GetSection("ConnectionStrings"));

var allowedCors = builder.Configuration.GetSection("AllowedCors").Value ?? "";

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsApi",
        policy =>
        {
            policy.WithOrigins(allowedCors)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("CorsApi");

app.UseAuthorization();

app.MapControllers();

app.Run();