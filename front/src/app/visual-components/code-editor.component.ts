import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'code-editor',
  standalone: true,
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.css'
})

export class CodeEditor {
  highlightText: string = '';

  states = {
    NONE: 0,
    SINGLE_QUOTE: 1, // 'string'
    DOUBLE_QUOTE: 2, // "string"
    ML_QUOTE: 3, // `string`
    REGEX_LITERAL: 4, // /regex/
    SL_COMMENT: 5, // // single line comment
    ML_COMMENT: 6, // /* multiline comment */
    NUMBER_LITERAL: 7, // 123
    KEYWORD: 8, // function, var etc.
    SPECIAL: 9 // null, true etc.
  };

  colors = {
    NONE: '#000',
    SINGLE_QUOTE: '#aaa', // 'string'
    DOUBLE_QUOTE: '#aaa', // "string"
    ML_QUOTE: '#aaa', // `string`
    REGEX_LITERAL: '#707', // /regex/
    SL_COMMENT: '#0a0', // // single line comment
    ML_COMMENT: '#0a0', // /* multiline comment */
    NUMBER_LITERAL: '#a00', // 123
    KEYWORD: '#00a', // function, var etc.
    SPECIAL: '#055' // null, true etc.
  };

  keywords = ('async|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|' +
    'get|if|implements|import|in|instanceof|interface|let|new|of|package|private|protected|public|return|set|static|super|' +
    'switch|throw|try|typeof|var|void|while|with|yield|catch|finally').split('|');

  specials = 'this|null|true|false|undefined|NaN|Infinity'.split('|');

  inputEvent(e: Event) {
    let value = (e.target as HTMLInputElement).value;

    this.highlightText = this.highlight(value);
  }

  isAlphaNumericChar(char: string) {
    return char && /[0-9a-z_\$]/i.test(char);
  }

  highlight(code: string) {
    let output = '';
    let state = this.states.NONE;

    for (let i = 0; i < code.length; i++) {
      let char = code[i], prev = code[i - 1], next = code[i + 1];

      if (state == this.states.NONE && char == '/' && next == '/') {
        state = this.states.SL_COMMENT;
        output += '<span style="color: ' + this.colors.SL_COMMENT + '">' + char;

        continue;
      }

      if (state == this.states.SL_COMMENT && char == '\n') {
        state = this.states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this.states.NONE && char == '/' && next == '*') {
        state = this.states.ML_COMMENT;
        output += '<span style="color: ' + this.colors.ML_COMMENT + '">' + char;

        continue;
      }

      if (state == this.states.ML_COMMENT && char == '/' && prev == '*') {
        state = this.states.NONE;
        output += char + '</span>';

        continue;
      }

      const closingCharNotEscaped = prev != '\\' || prev == '\\' && code[i - 2] == '\\';

      if (state == this.states.NONE && char == '\'') {
        state = this.states.SINGLE_QUOTE;
        output += '<span style="color: ' + this.colors.SINGLE_QUOTE + '">' + char;

        continue;
      }
      if (state == this.states.SINGLE_QUOTE && char == '\'' && closingCharNotEscaped) {
        state = this.states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this.states.NONE && char == '"') {
        state = this.states.DOUBLE_QUOTE;
        output += '<span style="color: ' + this.colors.DOUBLE_QUOTE + '">' + char;

        continue;
      }

      if (state == this.states.DOUBLE_QUOTE && char == '"' && closingCharNotEscaped) {
        state = this.states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this.states.NONE && char == '`') {
        state = this.states.ML_QUOTE;
        output += '<span style="color: ' + this.colors.ML_QUOTE + '">' + char;
        continue;
      }
      if (state == this.states.ML_QUOTE && char == '`' && closingCharNotEscaped) {
        state = this.states.NONE;
        output += char + '</span>';
        continue;
      }

      if (state == this.states.NONE && char == '/') {
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
        if (word.length > 0 && !this.keywords.includes(word)) isRegex = false;
        if (isRegex) {
          state = this.states.REGEX_LITERAL;
          output += '<span style="color: ' + this.colors.REGEX_LITERAL + '">' + char;
          continue;
        }
      }

      if (state == this.states.REGEX_LITERAL && char == '/' && closingCharNotEscaped) {
        state = this.states.NONE;
        output += char + '</span>';

        continue;
      }

      if (state == this.states.NONE && /[0-9]/.test(char) && !this.isAlphaNumericChar(prev)) {
        state = this.states.NUMBER_LITERAL;
        output += '<span style="color: ' + this.colors.NUMBER_LITERAL + '">' + char;

        continue;
      }

      if (state == this.states.NUMBER_LITERAL && !this.isAlphaNumericChar(char)) {
        state = this.states.NONE;
        output += '</span>'
      }

      if (state == this.states.NONE && !this.isAlphaNumericChar(prev)) {
        let word = '', j = 0;
        while (code[i + j] && this.isAlphaNumericChar(code[i + j])) {
          word += code[i + j];
          j++;
        }
        if (this.keywords.includes(word)) {
          state = this.states.KEYWORD;
          output += '<span style="color: ' + this.colors.KEYWORD + '">';
        }
        if (this.specials.includes(word)) {
          state = this.states.SPECIAL;
          output += '<span style="color: ' + this.colors.SPECIAL + '">';
        }
      }
      if ((state == this.states.KEYWORD || state == this.states.SPECIAL) && !this.isAlphaNumericChar(char)) {
        state = this.states.NONE;
        output += '</span>';
      }

      if (state == this.states.NONE && '+-/*=&|%!<>?:'.indexOf(char) != -1) {
        output += '<span style="color: #07f">' + char + '</span>';
        continue;
      }

      output += char.replace('<', '&lt;');
    }
    
    return output.replace(/\n/gm, '<br>').replace(/\t/g, new Array(8).join('&nbsp;'))
      .replace(/^\s+|\s{2,}/g, (a) => new Array(a.length + 1).join('&nbsp;'));
  }
}