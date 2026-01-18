import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { GroupsPage } from './groups-page';
import { GroupsService } from '../../services/groups.service';
import { BaseResponseOfPaginatedEnumerableOfGroupDto } from '../../../../shared/models/model';

describe('GroupsPage', () => {
  let component: GroupsPage;
  let fixture: ComponentFixture<GroupsPage>;
  let groupsServiceSpy: jasmine.SpyObj<Pick<GroupsService, 'getGroups'>>;

  beforeEach(async () => {
    groupsServiceSpy = jasmine.createSpyObj('GroupsService', ['getGroups']);

    await TestBed.configureTestingModule({
      imports: [GroupsPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GroupsService, useValue: groupsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(response));

    fixture.detectChanges();

    expect(groupsServiceSpy.getGroups).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false,
    });
    expect(component).toBeTruthy();
  });
});
