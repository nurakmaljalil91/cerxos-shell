import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './error-page.html',
  styleUrl: './error-page.css'
})
export class ErrorPage {
  @Input() statusCode = 404;
  @Input() message = 'The page you are looking for does not exist.';
  protected readonly location = location;
}
