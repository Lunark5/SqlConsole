using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;

namespace API.Controllers;

[EnableCors("CorsApi")]
[Route("api")]
[ApiController]
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
    public string Execute([FromBody]ExecuteDTO dto)
    {
        try
        {
            return _db.Execute(dto.Command, false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);

            throw;
        }
    }

    [HttpGet("GetTables")]
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
    public string GetColumns([FromBody]GetColumnsDTO dto)
    {
        try
        {
            return _db.GetColumns(dto.TableName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);

            throw;
        }
    }
}
