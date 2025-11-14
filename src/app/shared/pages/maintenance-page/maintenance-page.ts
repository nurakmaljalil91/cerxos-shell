import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-maintenance-page',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './maintenance-page.html',
  styleUrl: './maintenance-page.css'
})
export class MaintenancePage {
  protected readonly location = location;
}
