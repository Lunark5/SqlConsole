namespace API.Models;

internal class DbFactory(IServiceProvider services) : IDbFactory
{
    public IDataBase Get() 
        => services.GetRequiredService<PostgreDb>();
}