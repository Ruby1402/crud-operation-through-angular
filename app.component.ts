// Importing core Angular modules and services
import { Component, OnInit, NgZone } from '@angular/core'; // Core component stuff and NgZone for change detection
//Component: Lets you define an angular's core library, 
// OnInit: A special Function called when your component is ready
//NgZone: Used to tell Angular when to update the UI manually if changes happen outside its default scope
import { CommonModule } from '@angular/common'; // Common directives like ngIf, ngFor
import { FormsModule } from '@angular/forms'; // Two-way data binding (ngModel)
import { HttpClient } from '@angular/common/http'; // For making HTTP requests to a backend like GET,POST,DELETE,PUT
import { Observable } from 'rxjs'; // For handling asynchronous data streams
// Observable is a way to deal with asynchronous data like HTTP responses or real-time updates.
import { tap } from 'rxjs/operators'; // For side-effects like logging in observables
//tap() is used to do something like logging inside an observable stream without changing the data


// Define a TypeScript interface that describes the structure of a single entry
interface Entry {
  srno: number | null; // Serial number (can be null initially)
  name: string; // Student name
  branch: string; // Student branch
  rollno: string; // Student roll number (as string, even if numeric)
}

// Decorator that marks this class as an Angular component
//Component metadata – describing the component
@Component({
  selector: 'app-root', // The custom HTML tag to use this component
  templateUrl: './app.component.html', // External HTML template for the UI
  styleUrls: ['./app.component.css'], // External CSS styles
  standalone: true, // Enables standalone component (without being in NgModule)
  imports: [CommonModule, FormsModule] // Modules needed for this component
})

// The main component class
export class AppComponent implements OnInit {
  // implements OnInit means it will run some code when the component loads.
  // A single entry to add/edit
  entry: Entry = {
    srno: null,
    name: '',
    branch: '',
    rollno: '',
  };
  // entry represents the student being added or edited.
// Starts empty so the form is blank.

  // Array to hold all entries
  entries: Entry[] = [];

  // Keeps track of the index being edited; null if not editing
  editingIndex: number | null = null;

  // Base URL of the backend API
  //in our case it is server.js file and the server we started before starting this web app
  private apiUrl = 'http://localhost:3000/entries';

  // Constructor that injects dependencies
  constructor(
    private http: HttpClient, // For HTTP calls
    private zone: NgZone // For forcing Angular change detection
  ) {}

  // Lifecycle hook: called once the component is initialized
  ngOnInit() {
    this.loadEntriesFromBackend(); // Load existing entries
  }
//When the component is first shown, this runs.
// It loads the list of entries from the server.

  // Load all entries from the backend server
  private loadEntriesFromBackend() {
    this.http.get<Entry[]>(this.apiUrl) // Send a GET request to fetch entries
      .pipe(
        tap(data => console.log('Fetched entries:', data)) // Log fetched data
      )
      .subscribe({
        next: (data) => {
          // Run inside Angular's zone to make UI update correctly
          this.zone.run(() => {
            this.entries = [...data]; // Spread operator to create new array reference
            console.log('Entries updated:', this.entries);
          });
        },
        error: (error) => {
          console.error('Error fetching entries from backend:', error.error || error);
        }
      });
  }

//   //this.http.get<Entry[]>(...) → sends a GET request to the API.
// pipe(tap(...)) → logs the data before doing anything with it.
// subscribe(...) → handles the response.
// next: → on success, it updates this.entries.
// zone.run() is used so the UI updates properly.
// error: → logs any issue with the request.

  // Add a new entry or update an existing one
  addEntry() {
    // Validate that all fields are filled
    if (
      this.entry.srno !== null &&
      this.entry.name.trim() !== '' &&
      this.entry.branch.trim() !== '' &&
      this.entry.rollno.trim() !== ''
    ) {
      // Validate serial number
      if (!this.isValidSrno(this.entry.srno)) {
        alert('Sr no must be a number and not a duplicate.');
        return;
      }

      // Validate name (should not be a number)
      if (this.isNumeric(this.entry.name)) {
        alert('Name cannot be a number.');
        return;
      }

      // Validate branch (should not be a number)
      if (this.isNumeric(this.entry.branch)) {
        alert('Branch cannot be a number.');
        return;
      }

      // Validate roll number (must be a number ≤ 99)
      if (!this.isValidRollno(this.entry.rollno)) {
        alert('Roll no must be a number less than or equal to 99.');
        return;
      }

      // If editing an existing entry
      if (this.editingIndex !== null) {
        const updatedEntry = { ...this.entry }; // Copy to maintain immutability

        // Optimistically update the local list before hitting backend
        this.zone.run(() => {
          this.entries = this.entries.map((e, i) => 
            i === this.editingIndex ? { ...updatedEntry } : e
          );
        });

        this.updateEntryOnBackend(updatedEntry); // Update on server
      } else {
        // Adding a new entry
        this.addEntryToBackend(this.entry); // Send to backend
      }

      this.resetForm(); // Reset form after add/update
    }
  }

  // Clear the form fields and reset editing state
  private resetForm() {
    this.entry = { srno: null, name: '', branch: '', rollno: '' };
    this.editingIndex = null;
  }

  // Send new entry to backend via POST request
  private addEntryToBackend(entry: Entry) {
    this.http.post(this.apiUrl, entry).subscribe({
      next: (response) => {
        console.log('Entry added to backend:', response);
        this.loadEntriesFromBackend(); // Refresh list
      },
      error: (error) => {
        console.error('Error adding entry to backend:', error.error || error);
      }
    });
  }

  // Update an existing entry on the backend
  private updateEntryOnBackend(updatedEntry: Entry) {
    if (updatedEntry.srno == null) {
      console.error('Cannot update entry without srno');
      return;
    }

    this.http.put(`${this.apiUrl}/${updatedEntry.srno}`, updatedEntry).subscribe({
      next: (response) => {
        console.log('Entry updated on backend:', response);
        this.loadEntriesFromBackend(); // Refresh to sync UI with backend
      },
      error: (error) => {
        console.error('Error updating entry on backend:', error.error || error);
        this.loadEntriesFromBackend(); // Reload in case of error to correct any mismatch
      }
    });
  }

  // Delete an entry by index
  deleteEntry(index: number) {
    const entryToDelete = this.entries[index]; // Get the entry to delete

    if (entryToDelete.srno === null) {
      console.error('Cannot delete entry without srno');
      return;
    }

    // Optimistically remove from UI
    this.zone.run(() => {
      this.entries = this.entries.filter((_, i) => i !== index);
    });

    // Send DELETE request to backend
    this.http.delete(`${this.apiUrl}/${entryToDelete.srno}`).subscribe({
      next: (response) => {
        console.log('Entry deleted from backend:', response);
        this.loadEntriesFromBackend(); // Reload for consistency
      },
      error: (error) => {
        console.error('Error deleting entry from backend:', error.error || error);
        this.loadEntriesFromBackend(); // Restore state on error
      }
    });
  }

  // Prepare an entry for editing
  editEntry(index: number) {
    this.entry = { ...this.entries[index] }; // Copy entry into form fields
    this.editingIndex = index; // Set editing mode
  }

  // Check if the serial number is already used (excluding current editing)
  private isDuplicateSrno(srno: number): boolean {
    if (this.editingIndex !== null) {
      return this.entries.some((e, i) => i !== this.editingIndex && e.srno === srno);
    }
    return this.entries.some(e => e.srno === srno);
  }

  // Valid srno = must be number and not a duplicate
  private isValidSrno(srno: number): boolean {
    return typeof srno === 'number' && !this.isDuplicateSrno(srno);
  }

  // Check if a string is only numbers
  private isNumeric(str: string): boolean {
    return /^[0-9]+$/.test(str); // Regex to check digits only
  }

  // Check if roll number is a valid number ≤ 99
  private isValidRollno(rollno: string): boolean {
    const num = parseInt(rollno, 10);
    return !isNaN(num) && num <= 99;
  }
}
