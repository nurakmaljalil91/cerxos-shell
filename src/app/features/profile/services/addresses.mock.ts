import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AddressDto,
  BaseResponseOfAddressDto,
  BaseResponseOfPaginatedEnumerableOfAddressDto,
  BaseResponseOfString,
  CreateAddressCommand,
  PaginatedEnumerableOfAddressDto,
  UpdateAddressCommand,
} from '../../../shared/models/model';

@Injectable({
  providedIn: 'root',
})
export class AddressesMock {
  private readonly addresses: AddressDto[] = [
    {
      id: 'addr-1',
      userId: 'user-1',
      label: 'Home',
      type: 'Residential',
      line1: '12 Maple Street',
      line2: 'Apt 3B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'US',
      isDefault: true,
    },
    {
      id: 'addr-2',
      userId: 'user-1',
      label: 'Office',
      type: 'Work',
      line1: '500 Commerce Ave',
      line2: '',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'US',
      isDefault: false,
    },
  ];

  private nextId = 3;

  getAddressesByUserId(
    userId: string,
  ): Observable<BaseResponseOfPaginatedEnumerableOfAddressDto> {
    const items = this.addresses.filter((a) => a.userId === userId);

    const data: PaginatedEnumerableOfAddressDto = {
      items,
      pageNumber: 1,
      totalPages: 1,
      totalCount: items.length,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    const response: BaseResponseOfPaginatedEnumerableOfAddressDto = {
      success: true,
      message: 'Mock addresses loaded.',
      data,
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfAddressDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  createAddress(command: CreateAddressCommand): Observable<BaseResponseOfAddressDto> {
    const newAddress: AddressDto = {
      id: `addr-${this.nextId++}`,
      userId: command.userId,
      label: command.label,
      type: command.type,
      line1: command.line1,
      line2: command.line2,
      city: command.city,
      state: command.state,
      postalCode: command.postalCode,
      country: command.country,
      isDefault: command.isDefault,
    };

    this.addresses.push(newAddress);

    const response: BaseResponseOfAddressDto = {
      success: true,
      message: 'Mock address created.',
      data: newAddress,
    };

    return new Observable<BaseResponseOfAddressDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  updateAddress(
    id: string,
    command: UpdateAddressCommand,
  ): Observable<BaseResponseOfAddressDto> {
    const index = this.addresses.findIndex((a) => a.id === id);
    let response: BaseResponseOfAddressDto;

    if (index === -1) {
      response = { success: false, message: 'Address not found.' };
    } else {
      this.addresses[index] = { ...this.addresses[index], ...command };
      response = {
        success: true,
        message: 'Mock address updated.',
        data: this.addresses[index],
      };
    }

    return new Observable<BaseResponseOfAddressDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  deleteAddress(id: string): Observable<BaseResponseOfString> {
    const index = this.addresses.findIndex((a) => a.id === id);
    let response: BaseResponseOfString;

    if (index === -1) {
      response = { success: false, message: 'Address not found.' };
    } else {
      this.addresses.splice(index, 1);
      response = { success: true, message: 'Mock address deleted.', data: id };
    }

    return new Observable<BaseResponseOfString>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
