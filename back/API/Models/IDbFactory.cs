namespace API.Models;

public interface IDbFactory
{
    IDataBase Get();
}