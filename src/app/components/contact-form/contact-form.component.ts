import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.css',
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  contactId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      title: [''],
      phone: [''],
      address: [''],
      city: [''],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.contactId = params.get('id');
      if (this.contactId) {
        this.isEditMode = true;
        this.loadContactDetails(this.contactId);
      }
    });
  }

  loadContactDetails(id: string): void {
    this.isLoading = true;
    this.apiService.getContact(id).subscribe({
      next: (contact) => {
        console.log('Loaded contact:', contact);
        if (contact) {
          this.contactForm.patchValue({
            name: contact.name,
            email: contact.email,
            title: contact.title,
            phone: contact.phone,
            address: contact.address,
            city: contact.city,
          });
        } else {
          this.snackBar.open('Contact not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/contacts']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.isLoading = false;
        let errorMessage = 'Error loading contact';

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
        this.router.navigate(['/contacts']);
      },
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;
      const contact: Contact = this.contactForm.value;

      if (this.isEditMode && this.contactId) {
        this.apiService.updateContact(this.contactId, contact).subscribe({
          next: (updatedContact) => {
            console.log('Updated contact:', updatedContact);
            this.isLoading = false;
            this.snackBar.open('Contact updated successfully', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/contacts']);
          },
          error: (error) => {
            console.error('Error updating contact:', error);
            this.isLoading = false;
            let errorMessage = 'Error updating contact';

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
      } else {
        this.apiService.createContact(contact).subscribe({
          next: (newContact) => {
            console.log('Created contact:', newContact);
            this.isLoading = false;
            this.snackBar.open('Contact created successfully', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/contacts']);
          },
          error: (error) => {
            console.error('Error creating contact:', error);
            this.isLoading = false;
            let errorMessage = 'Error creating contact';

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

  cancel(): void {
    this.router.navigate(['/contacts']);
  }
}
