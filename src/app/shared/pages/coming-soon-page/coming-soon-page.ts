import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon-page',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './coming-soon-page.html',
  styleUrl: './coming-soon-page.css'
})
export class ComingSoonPage {
  @Input() featureName = 'This page';
  protected readonly location = location;
}
