import { Component, OnInit, VERSION } from '@angular/core';
import { Canvas } from 'canvas';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import {
  createBackground,
  createCircle,
  createHashLabel,
  hashToBackground,
  hashToCircle,
} from './canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;

  src = new BehaviorSubject<string>('');
  click$ = new ReplaySubject<void>();

  ngOnInit(): void {
    this.onClick();
    let uuidStr: string;
    this.click$
      .pipe(
        tap(() => {
          uuidStr = uuid();
          uuidStr = uuidStr.split('-').join('');
        }),
        map(() => createBackground(hashToBackground(uuidStr))),
        map((canvas: Canvas) => createCircle(hashToCircle(uuidStr), canvas)),
        map((canvas: Canvas) => createHashLabel(uuidStr, canvas)),
        // map((canvas: Canvas) =>
        //   createTriangle(hashToTriangle(uuidStr), canvas)
        // ),
        map((canvas: Canvas) => canvas.toDataURL())
      )
      .subscribe(this.src);
  }

  onClick(): void {
    this.click$.next();
  }
}
