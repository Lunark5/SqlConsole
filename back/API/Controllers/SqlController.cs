using API.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class SqlController : ControllerBase
{
    private ILogger<SqlController> _logger;
    private IDataBase _db;

    public SqlController(ILogger<SqlController> logger, IDbFactory dbFactory)
    {
        _logger = logger;
        _db = dbFactory.Get();
    }

    [HttpPost("ExecuteCommand")]
    public string Execute(string command)
    {
        try 
        {
            return _db.Execute(command);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);

            throw;
        }
    }

    [HttpPost("GetTables")]
    public string GetTables()
    {
        try 
        {
            return _db.GetTables();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);

            throw;
        }
    }

    [HttpPost("GetColumns")]
    public string GetColumns(string tableName)
    {
        try 
        {
            return _db.GetColumns(tableName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);

            throw;
        }
    }
}
