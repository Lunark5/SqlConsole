namespace API.Models;

public interface IDataBase
{
    string Execute(string code);

    string GetTables();

    string GetColumns(string tableName);
}