import { Directive, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appIntersectionObserver]'
})
export class IntersectionObserverDirective implements OnDestroy {
  @Output() intersection = new EventEmitter<boolean>();
  
  private observer: IntersectionObserver;

  constructor(private element: ElementRef) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.intersection.emit(true);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px 50px 0px' // Trigger 50px before the element comes into view
      }
    );
  }

  ngAfterViewInit(): void {
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
