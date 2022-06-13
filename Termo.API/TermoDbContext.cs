using Microsoft.EntityFrameworkCore;

namespace Termo.API
{
    public class TermoDbContext : DbContext
    {
        public TermoDbContext(DbContextOptions<TermoDbContext> options) : base(options)
        {

        }

        public DbSet<DayWord> DayWords { get; set; }
    }
}