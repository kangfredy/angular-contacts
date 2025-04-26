import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { ApiService } from '../../services/api.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.css',
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  displayedColumns: string[] = [
    'name',
    'title',
    'email',
    'phone',
    'city',
    'actions',
  ];
  dataSource = new MatTableDataSource<Contact>([]);
  loading = false;
  totalContacts = 0;

  // Pagination options
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;
  pageIndex = 0;

  // Search and filter form
  searchForm: FormGroup;

  // Cities list for filter dropdown
  cities: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly apiService: ApiService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      email: [''],
      city: [''],
      sortBy: ['name'],
      sortOrder: ['asc'],
      createdAfter: [null],
    });
  }

  ngOnInit(): void {
    this.loadContacts();

    // React to form changes
    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.pageIndex = 0;
      this.loadContacts();
    });

    // Load unique cities for filter dropdown
    this.loadCities();
  }

  loadContacts(): void {
    this.loading = true;
    const { name, email, city, sortBy, sortOrder, createdAfter } =
      this.searchForm.value;

    this.apiService
      .searchContacts({
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        name,
        email,
        city,
        sortBy,
        sortOrder,
        createdAfter,
      })
      .subscribe({
        next: (response) => {
          console.log('Search response:', response);

          if (response?.contacts) {
            this.contacts = response.contacts;
            this.totalContacts = response.total ?? 0;
            this.dataSource.data = this.contacts;
          } else {
            this.contacts = [];
            this.totalContacts = 0;
            this.dataSource.data = [];
            console.error('Unexpected response format:', response);
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.loading = false;
          this.contacts = [];
          this.dataSource.data = [];

          let errorMessage = 'Error loading contacts';

          if (error.error) {
            if (error.error.message) {
              errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
          });
        },
      });
  }

  loadCities(): void {
    this.apiService.getContacts().subscribe({
      next: (contacts) => {
        if (Array.isArray(contacts)) {
          // Extract unique cities from contacts
          const uniqueCities = Array.from(
            new Set(
              contacts
                .map((contact) => contact.city)
                .filter((city) => city) as string[]
            )
          );

          this.cities = uniqueCities;
        } else {
          this.cities = [];
          console.error('Unexpected contacts format:', contacts);
        }
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.cities = [];
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadContacts();
  }

  onSortChange(event: Sort): void {
    this.searchForm.patchValue({
      sortBy: event.active,
      sortOrder: event.direction || 'asc',
    });
    // The subscription to form changes will trigger loadContacts
  }

  resetFilters(): void {
    this.searchForm.reset({
      name: '',
      email: '',
      city: '',
      sortBy: 'name',
      sortOrder: 'asc',
      createdAfter: null,
    });
    this.pageIndex = 0;
    // The subscription to form changes will trigger loadContacts
  }

  editContact(contact: Contact): void {
    this.router.navigate(['/contacts/edit', contact._id]);
  }

  deleteContact(contact: Contact): void {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.apiService.deleteContact(contact._id as string).subscribe({
        next: () => {
          this.loadContacts();
          this.snackBar.open('Contact deleted successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
          let errorMessage = 'Error deleting contact';

          if (error.error) {
            if (error.error.message) {
              errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
}
