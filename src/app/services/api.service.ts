import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Contact } from '../models/contact.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface ContactsData {
  items: Contact[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // Contacts CRUD operations
  getContacts(): Observable<Contact[]> {
    // Use search endpoint with default parameters
    return this.searchContacts({ page: 1, pageSize: 100 }).pipe(
      map((response) => response.contacts || [])
    );
  }

  getContact(id: string): Observable<Contact> {
    return this.http
      .get<ApiResponse<Contact>>(`${this.apiUrl}/contacts/${id}`)
      .pipe(map((response) => response.data));
  }

  createContact(contact: Contact): Observable<Contact> {
    return this.http
      .post<ApiResponse<Contact>>(`${this.apiUrl}/contacts`, contact)
      .pipe(map((response) => response.data));
  }

  updateContact(id: string, contact: Contact): Observable<Contact> {
    return this.http
      .put<ApiResponse<Contact>>(`${this.apiUrl}/contacts/${id}`, contact)
      .pipe(map((response) => response.data));
  }

  deleteContact(id: string): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/contacts/${id}`)
      .pipe(map((response) => response.data));
  }

  // Advanced search with query parameters
  searchContacts(
    parameters: {
      page?: number;
      pageSize?: number;
      name?: string;
      email?: string;
      city?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      createdAfter?: Date;
    } = {}
  ): Observable<{ contacts: Contact[]; total: number }> {
    let params = new HttpParams()
      .set('page', parameters.page?.toString() ?? '1')
      .set('pageSize', parameters.pageSize?.toString() ?? '10');

    params = Object.entries({
      ...(parameters.name && { name: parameters.name }),
      ...(parameters.email && { email: parameters.email }),
      ...(parameters.city && { city: parameters.city }),
      ...(parameters.sortBy && { sortBy: parameters.sortBy }),
      ...(parameters.sortOrder && { sortOrder: parameters.sortOrder }),
      ...(parameters.createdAfter && {
        createdAfter: parameters.createdAfter.toISOString(),
      }),
    }).reduce(
      (acc, [key, value]: [string, string]) => acc.set(key, value),
      params
    );

    return this.http
      .get<ApiResponse<ContactsData>>(`${this.apiUrl}/contacts/search`, {
        params,
      })
      .pipe(
        map((response) => {
          if (response?.data?.items) {
            return {
              contacts: response.data.items,
              total: response.data.total,
            };
          }
          return { contacts: [], total: 0 };
        })
      );
  }
}
