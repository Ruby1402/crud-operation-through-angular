import { bootstrapApplication } from '@angular/platform-browser';
//This imports the bootstrapApplication function from Angular
import { AppComponent } from './app/app.component';
//This imports your main component — AppComponent — from the file you wrote earlier.
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
//

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(HttpClientModule)],
});
// tells Angular to start the app using AppComponent as the root component.
//If something goes wrong while bootstrapping (like a syntax or runtime error), this catch block will log the error to the browser console.
// Helps with debugging during development.