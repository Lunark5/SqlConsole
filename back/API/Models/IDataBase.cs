namespace API.Models;

public interface IDataBase
{
    string Execute(string code, bool flat);

    string GetTables();

    string GetColumns(string tableName);
}