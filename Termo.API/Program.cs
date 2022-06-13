using Microsoft.EntityFrameworkCore;
using Termo.API;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddDbContext<TermoDbContext>(options => options.UseInMemoryDatabase("TermoDb"));

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(c =>
    c.AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod());

var externalHttpService = new ExternalHttpService();

app.MapGet("/words", async (TermoDbContext dbContext) =>
{
    var day = DateTime.Now.Date;
    var word = await dbContext.DayWords.Where(d => d.Day == day).FirstOrDefaultAsync();

    if (word == null)
        return Results.NotFound();

    return Results.Ok(word.Value);
});
//.WithName("GetWeatherForecast");

app.MapPost("/words", async (TermoDbContext dbContext, string word) =>
{
    var day = DateTime.Now.Date;
    var dayWord = new DayWord()
    {
        Day = day,
        Value = word
    };

    await dbContext.DayWords.AddRangeAsync(dayWord);
    await dbContext.SaveChangesAsync();

    return Results.Ok(dayWord);
});

app.MapGet("/words/validations", async (TermoDbContext dbContext, string word) =>
{
    // Quantidade de letras permitidas por palavra
    if (word.Length != 5)
        return Results.BadRequest("Só palavras com 5 letras");

    // Palavra existe no repositório
    var words = await externalHttpService.GetWords();
    if (!words.Contains(word.ToLower()))
        return Results.BadRequest("Essa palavra não aceita");

    // Palavra existe no banco de dados
    var day = DateTime.Now.Date;
    var dayWord = await dbContext.DayWords.Where(d => d.Day == day).FirstOrDefaultAsync();
    if (dayWord == null)
        return Results.BadRequest("Palavra não encontrada");

    return Results.Ok(ValidateWord(dayWord.Value, word));
});

app.Run();

static WordResult ValidateWord(string dayWord, string wordAttempt)
{
    Letter[] lettersResult = new Letter[dayWord.Length];

    for (int i = 0; i < wordAttempt.Length; i++)
    {
        var letterAttempt = wordAttempt[i];
        bool exists, rightPlace;

        exists = dayWord.Contains(letterAttempt);
        rightPlace = dayWord[i] == letterAttempt;

        lettersResult[i] = new Letter(letterAttempt, exists, rightPlace);
    }

    return new WordResult(lettersResult, dayWord == wordAttempt);
}

internal record WordResult(Letter[] Letters, bool Success);

internal record Letter(char Value, bool Exists, bool RightPlace);

record WeatherForecast(DateTime Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}