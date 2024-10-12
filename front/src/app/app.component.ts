import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodeEditor } from './visual-components/code-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CodeEditor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'SQL Learn';
}
