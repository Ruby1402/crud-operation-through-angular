import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- ADD THIS
import { AppComponent } from './app.component'; // Only if not using standalone bootstrap

@NgModule({
  imports: [BrowserModule, HttpClientModule], // <-- ADD HttpClientModule here
})
export class AppModule {}
