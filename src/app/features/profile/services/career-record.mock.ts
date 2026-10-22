import { Observable } from 'rxjs';

type CareerRecord = { id?: string; userId?: string };

type MockResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const MOCK_USER_ID = 'user-1';
const MOCK_DELAY_MS = 300;

/**
 * In-memory store shared by the profile career mocks (work experience, education, skills, projects).
 * Mirrors the API's partial-update rules: omitted fields stay unchanged and an empty string clears a value.
 */
export class CareerRecordMock<TDto extends CareerRecord, TCreate extends object, TUpdate extends object> {
  private nextId: number;

  constructor(
    private readonly idPrefix: string,
    private readonly label: string,
    private readonly records: TDto[],
  ) {
    this.nextId = records.length + 1;
  }

  listMine(): Observable<MockResponse<TDto[]>> {
    const data = this.records.filter((r) => r.userId === MOCK_USER_ID);
    return this.delay({ success: true, message: `Mock ${this.label} loaded.`, data });
  }

  create(command: TCreate): Observable<MockResponse<TDto>> {
    const record = {
      ...this.withoutEmpty(command),
      id: `${this.idPrefix}-${this.nextId++}`,
      userId: MOCK_USER_ID,
    } as unknown as TDto;
    this.records.push(record);
    return this.delay({ success: true, message: `Mock ${this.label} created.`, data: record });
  }

  update(id: string, command: TUpdate): Observable<MockResponse<TDto>> {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) {
      return this.delay({ success: false, message: `${this.label} not found.` });
    }

    const merged: Record<string, unknown> = { ...this.records[index] };
    for (const [key, value] of Object.entries(command)) {
      if (value === undefined || key === 'id') {
        continue;
      }
      merged[key] = value === '' ? undefined : value;
    }
    this.records[index] = merged as TDto;
    return this.delay({ success: true, message: `Mock ${this.label} updated.`, data: this.records[index] });
  }

  delete(id: string): Observable<MockResponse<string>> {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) {
      return this.delay({ success: false, message: `${this.label} not found.` });
    }

    this.records.splice(index, 1);
    return this.delay({ success: true, message: `Mock ${this.label} deleted.`, data: id });
  }

  private withoutEmpty(command: object): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(command).filter(([, value]) => value !== undefined && value !== ''),
    );
  }

  private delay<T>(response: T): Observable<T> {
    return new Observable<T>((observer) => {
      const timer = setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, MOCK_DELAY_MS);
      return () => clearTimeout(timer);
    });
  }
}
