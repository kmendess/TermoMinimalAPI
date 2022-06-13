import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { catchError, throwError } from 'rxjs';
import { WordValidations } from './models/WordValidations';
import { WordService } from './word.service';

export enum Key {
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Backspace = 'Backspace',
  Enter = 'Enter'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [WordService]
})
export class AppComponent {
  title = 'Termo.Web';
  currentRow = 0;
  success = false;

  constructor(private service: WordService, private notifierService: NotifierService) { }

  onClick(event: Event) {
    if (!this.success) {
      var div = event.target as HTMLElement;

      if (div.parentElement?.getAttribute('row') == this.currentRow.toString()) {
        div.parentElement?.querySelector('.edit')?.classList.remove('edit');
        div?.classList.add('edit');
      }
    }
  }

  onKeyClick(event: Event) {
    if (!this.success) {
      var div = event.target as HTMLElement;
      var letter = div.getAttribute('keyboard-key') ?? '';

      if (/[a-zA-Z]/.test(letter) && letter.length == 1) {
        this.setCurrentPositionValue(letter);
        this.moveRight();
      } else {
        switch (letter) {
          case Key.ArrowRight:
            this.moveRight();
            break;

          case Key.ArrowLeft:
            this.moveLeft();
            break;

          case Key.Backspace:
            if (document.querySelector('.edit')?.innerHTML == '')
              this.moveLeft();

            this.setCurrentPositionValue();
            break;

          case Key.Enter:
            //this.sendWord();
            break;

          default:
            break;
        }
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (!this.success) {
      var key = event.key;

      if (/[a-zA-Z]/.test(key) && key.length == 1) {
        this.setCurrentPositionValue(key);
        this.moveRight();
      } else {
        switch (key) {
          case Key.ArrowRight:
            this.moveRight();
            break;

          case Key.ArrowLeft:
            this.moveLeft();
            break;

          case Key.Backspace:
            if (document.querySelector('.edit')?.innerHTML == '')
              this.moveLeft();

            this.setCurrentPositionValue();
            break;

          case Key.Enter:
            this.sendWord();
            break;

          default:
            break;
        }
      }
    }
  }

  setCurrentPositionValue(value: string = '') {
    document.querySelector('.edit')?.replaceChildren(value);
  }

  moveRight() {
    var index = Number(document.querySelector('.edit')?.getAttribute('position'));

    if (index < 4) {
      document.querySelector('.edit')?.parentElement?.children.item(index + 1)?.classList.add('edit');
      document.querySelector('.edit')?.classList.remove('edit');
    }
  }

  moveLeft() {
    var index = Number(document.querySelector('.edit')?.getAttribute('position'));

    if (index > 0) {
      document.querySelector('.edit')?.parentElement?.children.item(index - 1)?.classList.add('edit');
      document.querySelectorAll('.edit')[1].classList.remove('edit');
    }
  }

  sendWord() {
    var word = this.getWord();

    if (word.length < 5) {
      this.notifierService.notify('info', 'só palavras com 5 letras');
    } else {
      this.getValidations(word.toLowerCase());
    }
  }

  getWord() {
    var word = '';

    const row = document.querySelector(`[row="${this.currentRow}"]`);
    if (row != undefined) {
      for (let index = 0; index < row?.children.length; index++) {
        const letter = row?.children[index]?.innerHTML;

        if (letter != undefined)
          word += letter;
      }
    }

    return word;
  }

  getValidations(word: string) {
    this.service.getValidations(word)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status == 400)
          this.notifierService.notify('info', 'palavra não aceita');

        return throwError(() => null);
      }))
      .subscribe(x => {
        var validations = x;

        for (let index = 0; index < validations.letters.length; index++) {
          var validationLetter = validations.letters[index];
          const row = document.querySelector(`[row="${this.currentRow}"]`);

          if (validationLetter.exists) {
            if (validationLetter.rightPlace) {
              row?.querySelector(`[position="${index}"]`)?.classList.add('right');
            } else {
              row?.querySelector(`[position="${index}"]`)?.classList.add('place');
            }
          } else {
            row?.querySelector(`[position="${index}"]`)?.classList.add('wrong');
          }

          setTimeout(() => {
            row?.querySelector(`[position="${index}"]`)?.classList.remove('edit');
            row?.querySelector(`[position="${index}"]`)?.classList.remove('active');
          }, 2000);
        }

        setTimeout(() => {
          if (validations.success) {
            this.success = true;
            this.notifierService.notify('info', 'Sucesso');
          } else {
            this.enableNextRow();
          }

          this.setKeyboardColors(validations);
        }, 1800);
      })
  }

  setKeyboardColors(validations: WordValidations) {
    for (let index = 0; index < validations.letters.length; index++) {
      const validationLetter = validations.letters[index];

      var element = document.querySelector(`[keyboard-key="${validationLetter.value.toUpperCase()}"]`);

      if (validationLetter.exists) {
        if (validationLetter.rightPlace) {
          element?.classList.remove('place');
          element?.classList.add('right');
        } else {
          element?.classList.add('place');
        }
      } else {
        element?.classList.add('keyboard-wrong');
      }
    }
  }

  enableNextRow() {
    this.currentRow++;

    const row = document.querySelector(`[row="${this.currentRow}"]`);

    if (row != undefined) {
      for (let index = 0; index < row?.children.length; index++) {
        const letter = row?.children.item(index);

        letter?.classList.add('active');

        if (index == 0) {
          letter?.classList.add('edit');
        }
      }
    }
  }
}
