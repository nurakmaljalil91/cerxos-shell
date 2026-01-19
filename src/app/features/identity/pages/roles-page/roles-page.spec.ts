import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { RolesPage } from './roles-page';
import { RolesService } from '../../services/roles.service';
import { BaseResponseOfPaginatedEnumerableOfRoleDto } from '../../../../shared/models/model';

describe('RolesPage', () => {
  let component: RolesPage;
  let fixture: ComponentFixture<RolesPage>;
  let rolesServiceSpy: jasmine.SpyObj<Pick<RolesService, 'getRoles'>>;

  beforeEach(async () => {
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getRoles']);

    await TestBed.configureTestingModule({
      imports: [RolesPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RolesService, useValue: rolesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(response));

    fixture.detectChanges();

    expect(rolesServiceSpy.getRoles).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false,
    });
    expect(component).toBeTruthy();
  });
});
