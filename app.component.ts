import { Component } from '@angular/core';
//imports the component decorator, which is used to define an angular component.
import { CommonModule } from '@angular/common';
//CommonModule gives access to common Angular directives like *ngIf and *ngFor
import { FormsModule } from '@angular/forms';
//needed for template-driven forms, which let you bind form data to your component easily with [(ngModel)]
import { HttpClient } from '@angular/common/http';
//Used to make http requests like (GET, POST, PUT, DELETE) to a backend server
import { ChangeDetectorRef } from '@angular/core'; 
//helps you manually trigger Angular's change detection when the view doesn't automatically update

//defines the shape of a single entry object. may be null at the start. 
// srno represents number while all other parameters repreent strings
interface Entry {
  srno: number | null;
  name: string;
  branch: string;
  rollno: string;
}

//Component metadata that gives the details and info regarding this component. 
//selector: HTML tag for the component that will be used whenever this component is refrenced 
//templateURL: path to the components html file 
//styleUrls: path to css file 
//standalone:true--> indicates this is a standalone component and does not need a module.
//imports: required modules for this component (like forms and common directives)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})

//this is the main class for your component
export class AppComponent {
  //this entry object holds the data for the current form input (new or being edited)
  entry: Entry = {
    srno: null,
    name: '',
    branch: '',
    rollno: '',
  };

  //entries hold the list of all student records fetched from the backend
  entries: Entry[] = [];
  //keeps tracks of which entry (by index) you're currently editing.
  editingIndex: number | null = null;

  //the constructor runs when the component is created.
  //it injects HttpClient and ChangeDetectorRef services.
  //Calls the method to fetch entries from the backend right away.
  constructor(private http: HttpClient, private cdr: 
    ChangeDetectorRef) {
    this.loadEntriesFromBackend();
  }

  //this code below loads entries from the backend
  private loadEntriesFromBackend() {
    this.http.get<Entry[]>('http://localhost:3000/entries').subscribe(
      //the above code sends a GET request to fetch the list of entries from the backend server.

      (data) => {
        this.entries = data;
      },
      //on success it assigns the fetched data to entries

      (error) => {
        console.error('Error fetching entries from backend:', error.error || error);
      }
    );
  }
//on failure, it logs the error to the console. 

//called when the user submits the form.
  addEntry() {

    //ensures all the fields are filled in
    if (
      this.entry.srno !== null &&
      this.entry.name.trim() !== '' &&
      this.entry.branch.trim() !== '' &&
      this.entry.rollno.trim() !== ''
    ) {
      
      //<-------- validation start for every field ---------->
      if (!this.isValidSrno(this.entry.srno)) {
        alert('Sr no must be a number and not a duplicate.');
        return;
      }

      if (this.isNumeric(this.entry.name)) {
        alert('Name cannot be a number.');
        return;
      }

      if (this.isNumeric(this.entry.branch)) {
        alert('Branch cannot be a number.');
        return;
      }

      if (!this.isValidRollno(this.entry.rollno)) {
        alert('Roll no must be a number less than or equal to 99.');
        return;
      }

       //<-------- validation end for every field ---------->

       //if editing an existing entry, update it and call the update method.
      if (this.editingIndex !== null) {
        this.entries[this.editingIndex] = { ...this.entry };
        this.updateEntryOnBackend();
        this.editingIndex = null;
      } 
      
      //if adding a new entry, send a POST request to the backend and reload the list.
      else {
        this.http.post('http://localhost:3000/entries', this.entry).subscribe(
          (response) => {
            console.log('Entry added to backend:', response);
            this.loadEntriesFromBackend();
          },
          (error) => {
            console.error('Error adding entry to backend:', error.error || error);
          }
        );
      }

      //clears the form after adding or updating.
      this.entry = { srno: null, name: '', branch: '', rollno: '' };
    }
  }

  //Gets the entry to update
  private updateEntryOnBackend() {
    const updatedEntry = this.entries[this.editingIndex!];

    //ensures the serial number is present.
    if (updatedEntry.srno == null) {
      console.error('Cannot update entry without srno');
      return;
    }

    //sends a PUT request to update the entry on the backend.
    this.http.put(`http://localhost:3000/entries/${updatedEntry.srno}`, updatedEntry).subscribe(
      (response) => {
        console.log('Entry updated on backend:', response);
        this.loadEntriesFromBackend();
      },
      (error) => {
        console.error('Error updating entry on backend:', error.error || error);
      }
    );
  }

  //gets the serial number of the entry to delete
  deleteEntry(index: number) {
    const srno = this.entries[index].srno;

    //Sends the DELETE request, removes the entry locally, and forces the ui update with detectChanges
    this.http.delete(`http://localhost:3000/entries/${srno}`).subscribe(
      (response) => {
        console.log('Entry deleted from backend:', response);
        this.entries.splice(index, 1); // Remove entry from local array
      },
      (error) => {
        console.error('Error deleting entry from backend:', error.error || error);
      }
    );
  }

  //Copies selected entry's data into the form and sets editIndex.
  editEntry(index: number) {
    this.entry = { ...this.entries[index] };
    this.editingIndex = index;
  }

  //Validation helpers to check for the specified validations of the fields
  private isDuplicateSrno(srno: number): boolean {
    if (this.editingIndex !== null) {
      return this.entries.some((e, i) => i !== this.editingIndex && e.srno === srno);
    }
    return this.entries.some(e => e.srno === srno);
  }

  private isValidSrno(srno: number): boolean {
    return typeof srno === 'number' && !this.isDuplicateSrno(srno);
  }

  private isNumeric(str: string): boolean {
    return /^[0-9]+$/.test(str);
  }

  private isValidRollno(rollno: string): boolean {
    const num = parseInt(rollno, 10);
    return !isNaN(num) && num <= 99;
  }
}