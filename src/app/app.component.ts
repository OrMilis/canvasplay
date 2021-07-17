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
  createFrame,
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

  private stream;
  private recorder;

  private streamChunks = [];

  src = new BehaviorSubject<string>('');
  click$ = new ReplaySubject<void>();
  fps = new BehaviorSubject<string>('');
  // private circle = this.getCircle();

  ngOnInit(): void {
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
        map((canvas: Canvas) => createFrame(canvas)),
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

  // private exportVid(blob) {
  //   const vid = document.createElement('video');
  //   vid.src = URL.createObjectURL(blob);
  //   vid.controls = true;
  //   document.body.appendChild(vid);
  //   const a = document.createElement('a');
  //   a.download = 'myvid.webm';
  //   a.href = vid.src;
  //   a.textContent = 'download the video';
  //   document.body.appendChild(a);
  // }
}
