import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfAddressDto,
  BaseResponseOfPaginatedEnumerableOfAddressDto,
  BaseResponseOfString,
  CreateAddressCommand,
  UpdateAddressCommand,
} from '../../../shared/models/model';
import { AddressesMock } from './addresses.mock';

@Injectable({
  providedIn: 'root',
})
export class AddressesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(AddressesMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/addresses`;

  getAddressesByUserId(
    userId: string,
  ): Observable<BaseResponseOfPaginatedEnumerableOfAddressDto> {
    if (environment.testMode) {
      return this.mock.getAddressesByUserId(userId);
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfAddressDto>(
      `${this.endpoint}?userId=${encodeURIComponent(userId)}`,
    );
  }

  createAddress(command: CreateAddressCommand): Observable<BaseResponseOfAddressDto> {
    if (environment.testMode) {
      return this.mock.createAddress(command);
    }

    return this.http.post<BaseResponseOfAddressDto>(this.endpoint, command);
  }

  updateAddress(
    id: string,
    command: UpdateAddressCommand,
  ): Observable<BaseResponseOfAddressDto> {
    if (environment.testMode) {
      return this.mock.updateAddress(id, command);
    }

    return this.http.patch<BaseResponseOfAddressDto>(`${this.endpoint}/${id}`, command);
  }

  deleteAddress(id: string): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.deleteAddress(id);
    }

    return this.http.delete<BaseResponseOfString>(`${this.endpoint}/${id}`);
  }
}
