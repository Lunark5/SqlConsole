import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodeEditor } from './visual-components/code-editor.component';
import { HttpService } from './services/http.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CodeEditor, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [HttpService],
})

export class AppComponent implements OnInit {
  title = 'SQL Learn';
  tables: Array<string> = [];

  constructor(private _httpService: HttpService) { }

  ngOnInit() {
    this._httpService.getTables().subscribe((data: any) => this.updateTables(data));
  }

  updateTables(tables: Array<string>) {
    this.tables = tables;
  }
}
