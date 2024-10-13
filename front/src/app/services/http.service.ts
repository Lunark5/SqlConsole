import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { api } from "../../config.json";

@Injectable()
export class HttpService {
    constructor(private http: HttpClient) { }

    execute(command: string) {
        let body = { command: command };

        return this.http.post(`${api.domain}/api/ExecuteCommand`, body);
    }

    getColumns(tableName: string) {
        let body = { tableName: tableName };
        
        return this.http.post(`${api.domain}/api/GetColumns`, body);
    }

    getTables() {        
        return this.http.get(`${api.domain}/api/GetTables`);
    }
}