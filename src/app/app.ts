import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // remoteComponent?: Type<unknown>;
  // constructor(private cdr: ChangeDetectorRef) { }

  // async ngOnInit(): Promise<void> {
  //   const module = await loadRemoteModule({
  //     type: 'module',
  //     remoteEntry: 'http://localhost:4201/remoteEntry.js',
  //     exposedModule: './RemoteComponent'
  //   });
  //   console.log(Object.keys(module));
  //   this.remoteComponent = (module as any).App;
  //   this.cdr.markForCheck();
  // }
}
