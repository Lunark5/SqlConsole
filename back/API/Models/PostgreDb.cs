using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Npgsql;

namespace API.Models;

internal class PostgreDb(IOptions<ConnectionStrings> options) : IDataBase
{
    private const string GetTablesCommand = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'";
    private const string GetColumnsCommand = "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '{0}'";

    public string Execute(string code)
    {
        var resultList = new List<List<string>>();
        using var connection = new NpgsqlConnection(options.Value.DefaultConnection);

        connection.Open();

        var command = new NpgsqlCommand(code, connection);
        var dr = command.ExecuteReader();

        while (dr.Read())
        {
            var row = new List<string>();

            for (var i = 0; i < dr.FieldCount; i++)
            {
                var stringValue = dr.GetValue(i).ToString();

                if (string.IsNullOrEmpty(stringValue))
                    stringValue = string.Empty;

                row.Add(stringValue);
            }

            resultList.Add(row);
        }

        return JsonSerializer.Serialize(resultList);
    }

    public string GetColumns(string tableName)
        => Execute(string.Format(GetColumnsCommand, tableName));

    public string GetTables()
        => Execute(GetTablesCommand);
}