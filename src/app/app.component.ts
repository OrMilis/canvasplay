import { Component, OnInit, VERSION, ViewChild } from '@angular/core';
import { Canvas } from 'canvas';
import {
  animationFrameScheduler,
  BehaviorSubject,
  interval,
  of,
  ReplaySubject,
  scheduled,
} from 'rxjs';
import { map, repeat, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import {
  Circle,
  clearCanvasFrame,
  createBackground,
  createCircle,
  createHashLabel,
  hashToBackground,
  hashToCircle,
  schedulerCreateCanvas,
} from './canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;

  private previousFrameTime = Date.now();

  src = new BehaviorSubject<string>('');
  click$ = new ReplaySubject<void>();
  fps = new BehaviorSubject<string>('');
  // private circle = this.getCircle();

  ngOnInit(): void {
    // scheduled(of(null), animationFrameScheduler)
    //   .pipe(
    //     repeat(),
    //     // map(() => createCircle([this.circle])),
    //     map((canvas: Canvas) => canvas.toDataURL())
    //   )
    //   .subscribe(this.src);
    this.onClick();
    let uuidStr: string;
    let circles: Circle[];
    this.click$
      .pipe(
        tap(() => {
          uuidStr = uuid();
          uuidStr = uuidStr.split('-').join('');
          circles = hashToCircle(uuidStr);
        }),
        map(() => schedulerCreateCanvas()),
        switchMap((canvas: Canvas) =>
          scheduled(of(canvas), animationFrameScheduler).pipe(repeat())
        ),
        tap((canvas: Canvas) => clearCanvasFrame(canvas)),
        map((canvas: Canvas) =>
          createBackground(hashToBackground(uuidStr), canvas)
        ),
        map((canvas: Canvas) => createCircle(circles, canvas)),
        map((canvas: Canvas) => createHashLabel(uuidStr, canvas))
      )
      .pipe(
        map((canvas: Canvas) => canvas.toDataURL()),
        tap(() => {
          const currentTime = Date.now();
          this.fps.next(
            `${1 / ((currentTime - this.previousFrameTime) / 1000)}`
          );
          this.previousFrameTime = currentTime;
        })
      )
      .subscribe(this.src);
  }

  onClick(): void {
    this.click$.next();
  }

  //   private getCircle(): Circle {
  //     return {
  //       center: {
  //         x: 500,
  //         y: 500,
  //       },
  //       radius: 100,
  //       style: {
  //         color: 'black',
  //         fill: true,
  //       },
  //     };
  //   }
}
