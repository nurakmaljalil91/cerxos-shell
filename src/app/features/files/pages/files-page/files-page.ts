import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CxsButtonComponent,
  CxsCardComponent,
  CxsDataTableCellDirective,
  CxsDataTableComponent,
  CxsDataTableSort,
  CxsDataTableSortDirection,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import { environment } from '../../../../../environments/environment';
import { FileRecordDto, FileRecordsQueryRequest } from '../../../../shared/models/model';
import { FilesService } from '../../services/files.service';
import { FILE_COLUMNS, toFileTableRow } from './files-page.table';

@Component({
  selector: 'app-files-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CxsButtonComponent,
    CxsCardComponent,
    CxsDataTableComponent,
    CxsDataTableCellDirective,
    CxsToastComponent,
  ],
  templateUrl: './files-page.html',
  styleUrl: './files-page.css',
})
export class FilesPage implements OnInit {
  private readonly filesService = inject(FilesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly sortKey = signal<string | undefined>('uploadedAt');
  readonly sortDirection = signal<CxsDataTableSortDirection>('desc');
  readonly filter = signal<string | undefined>(undefined);
  readonly categoryFilter = signal<string | undefined>(undefined);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  private readonly files = signal<FileRecordDto[]>([]);

  readonly columns = FILE_COLUMNS;
  readonly rows = computed(() => this.files().map(toFileTableRow));

  ngOnInit(): void {
    this.loadFiles();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadFiles();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadFiles();
  }

  onSortChange(sort: CxsDataTableSort): void {
    this.sortKey.set(sort.key);
    this.sortDirection.set(sort.direction);
    this.pageIndex.set(1);
    this.loadFiles();
  }

  onFilterChange(filters: { global: string; columns: Record<string, string> }): void {
    const globalSearch = filters.global || undefined;
    const category = filters.columns['category'] || undefined;
    this.filter.set(globalSearch);
    this.categoryFilter.set(category);
    this.pageIndex.set(1);
    this.loadFiles();
  }

  onDownload(id: number): void {
    window.open(`${environment.fileServiceBaseUrl}/api/files/${id}/download`, '_blank');
  }

  onToastOpenChange(open: boolean): void {
    this.toastOpen.set(open);
  }

  private loadFiles(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: FileRecordsQueryRequest = {
      page: this.pageIndex(),
      total: this.pageSize(),
      sortBy: this.sortKey(),
      descending: this.sortDirection() === 'desc',
      filter: this.filter(),
      category: this.categoryFilter(),
    };

    this.filesService
      .getFiles(query)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.files.set([]);
            this.totalCount.set(0);
            this.error.set(response?.message ?? 'Failed to load files.');
            return;
          }

          this.files.set(response.data.items);
          this.totalCount.set(response.data.totalCount ?? 0);
        },
        error: (err: { error?: { message?: string } }) => {
          this.files.set([]);
          this.totalCount.set(0);
          this.error.set(err?.error?.message ?? 'Failed to load files.');
        },
      });
  }

  private showToast(title: string, message: string, variant: CxsToastVariant): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    this.toastOpen.set(true);
  }
}
