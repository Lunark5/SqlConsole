import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'code-editor',
  standalone: true,
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.css',
  providers: [HttpService]
})

export class CodeEditor {
  normalText: string = '';
  highlightText: SafeHtml = '';

  private _states = {
    NONE: 0,
    SINGLE_QUOTE: 1,
    DOUBLE_QUOTE: 2,
    ML_QUOTE: 3,
    REGEX_LITERAL: 4,
    SL_COMMENT: 5,
    ML_COMMENT: 6,
    NUMBER_LITERAL: 7,
    KEYWORD: 8,
    SPECIAL: 9
  };

  private _colors = {
    NONE: '#000',
    SINGLE_QUOTE: '#ff2a2a',
    DOUBLE_QUOTE: '#7b7b7b',
    ML_QUOTE: '#aaa',
    REGEX_LITERAL: '#707',
    SL_COMMENT: '#0a0',
    ML_COMMENT: '#0a0',
    NUMBER_LITERAL: '#a00',
    KEYWORD: '#0e83ff',
    SPECIAL: '#055'
  };

  private _keywords = ('select|SELECT|from|FROM|update|UPDATE|delete|DELETE|insert|INSERT|into|INTO|where|WHERE|group|GROUP|by|BY|join|JOIN|in|IN').split('|');

  private _specials = 'null|NULL|true|TRUE|false|FALSE'.split('|');

  constructor(private _sanitizer: DomSanitizer, private _httpService: HttpService) {}

  inputEvent(e: Event) {
    let value = (e.target as HTMLInputElement).value;

    this.normalText = value;
    this.highlightText = this.highlight(value);
  }

  execute() {
    this._httpService.execute(this.normalText)
      .subscribe({
        //next: (data: any) => { this.receivedUser = data; this.done = true; },
        error: error => console.log(error)
      });
  }

  clear() {

  }

  private isAlphaNumericChar(char: string) {
    return char && /[0-9a-z_\$]/i.test(char);
  }

  private highlight(code: string) {
    let output = '';
    let state = this._states.NONE;

    for (let i = 0; i < code.length; i++) {
      let char = code[i], prev = code[i - 1], next = code[i + 1];

      if (state == this._states.NONE && char == '/' && next == '/') {
        state = this._states.SL_COMMENT;
        output += '<span style="color: ' + this._colors.SL_COMMENT + '">' + char;

        continue;
      }

      if (state == this._states.SL_COMMENT && char == '\n') {
        state = this._states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this._states.NONE && char == '/' && next == '*') {
        state = this._states.ML_COMMENT;
        output += '<span style="color: ' + this._colors.ML_COMMENT + '">' + char;

        continue;
      }

      if (state == this._states.ML_COMMENT && char == '/' && prev == '*') {
        state = this._states.NONE;
        output += char + '</span>';

        continue;
      }

      const closingCharNotEscaped = prev != '\\' || prev == '\\' && code[i - 2] == '\\';

      if (state == this._states.NONE && char == '\'') {
        state = this._states.SINGLE_QUOTE;
        output += '<span style="color: ' + this._colors.SINGLE_QUOTE + '">' + char;

        continue;
      }
      if (state == this._states.SINGLE_QUOTE && char == '\'' && closingCharNotEscaped) {
        state = this._states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this._states.NONE && char == '"') {
        state = this._states.DOUBLE_QUOTE;
        output += '<span style="color: ' + this._colors.DOUBLE_QUOTE + '">' + char;

        continue;
      }

      if (state == this._states.DOUBLE_QUOTE && char == '"' && closingCharNotEscaped) {
        state = this._states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this._states.NONE && char == '`') {
        state = this._states.ML_QUOTE;
        output += '<span style="color: ' + this._colors.ML_QUOTE + '">' + char;
        continue;
      }
      if (state == this._states.ML_QUOTE && char == '`' && closingCharNotEscaped) {
        state = this._states.NONE;
        output += char + '</span>';
        continue;
      }

      if (state == this._states.NONE && char == '/') {
        let word = '', j = 0, isRegex = true;
        while (i + j >= 0) {
          j--;
          if ('+/-*=|&<>%,({[?:;'.indexOf(code[i + j]) != -1) break;
          if (!this.isAlphaNumericChar(code[i + j]) && word.length > 0) break;
          if (this.isAlphaNumericChar(code[i + j])) word = code[i + j] + word;
          if (')]}'.indexOf(code[i + j]) != -1) {
            isRegex = false;
            break;
          }
        }
        if (word.length > 0 && !this._keywords.includes(word)) isRegex = false;
        if (isRegex) {
          state = this._states.REGEX_LITERAL;
          output += '<span style="color: ' + this._colors.REGEX_LITERAL + '">' + char;
          continue;
        }
      }

      if (state == this._states.REGEX_LITERAL && char == '/' && closingCharNotEscaped) {
        state = this._states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this._states.NONE && /[0-9]/.test(char) && !this.isAlphaNumericChar(prev)) {
        state = this._states.NUMBER_LITERAL;
        output += '<span style="color: ' + this._colors.NUMBER_LITERAL + '">' + char;

        continue;
      }

      if (state == this._states.NUMBER_LITERAL && !this.isAlphaNumericChar(char)) {
        state = this._states.NONE;
        output += '</span>'
      }

      if (state == this._states.NONE && !this.isAlphaNumericChar(prev)) {
        let word = '', j = 0;
        while (code[i + j] && this.isAlphaNumericChar(code[i + j])) {
          word += code[i + j];
          j++;
        }
        if (this._keywords.includes(word)) {
          state = this._states.KEYWORD;
          output += '<span style="color: ' + this._colors.KEYWORD + '">';
        }
        if (this._specials.includes(word)) {
          state = this._states.SPECIAL;
          output += '<span style="color: ' + this._colors.SPECIAL + '">';
        }
      }
      if ((state == this._states.KEYWORD || state == this._states.SPECIAL) && !this.isAlphaNumericChar(char)) {
        state = this._states.NONE;
        output += '</span>';
      }

      if (state == this._states.NONE && '+-/*=&|%!<>?:'.indexOf(char) != -1) {
        output += '<span style="color: #7b7b7b">' + char + '</span>';
        continue;
      }

      output += char.replace('<', '&lt;');
    }

    return this._sanitizer.bypassSecurityTrustHtml(output.replace(/\n/gm, '<br>').replace(/\t/g, new Array(8).join('&nbsp;'))
      .replace(/^\s+|\s{2,}/g, (a) => new Array(a.length + 1).join('&nbsp;')));
  }
}