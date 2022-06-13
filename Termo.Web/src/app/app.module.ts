import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NotifierModule } from 'angular-notifier';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NotifierModule.withConfig({
      position: {
        horizontal: { position: 'middle' },
        vertical: { position: 'top', distance: 60 }
      },
      behaviour: {
        showDismissButton: false,
        stacking: 1
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
