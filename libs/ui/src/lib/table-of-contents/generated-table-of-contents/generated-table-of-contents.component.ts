import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { TableOfContentsService } from '../table-of-contents.service';

@Component({
  selector: 'veera-ng-generated-table-of-contents',
  templateUrl: './generated-table-of-contents.component.html',
})
export class GeneratedTableOfContentsComponent
  implements AfterViewInit, OnDestroy
{
  /** The title of the table of contents passed to veera-ng-table-of-contents */
  @Input() title!: string;

  /** The internal marker is needed because of this Storybook bug https://github.com/storybookjs/storybook/issues/17004 */
  /** @internal */
  tocItems: TocItem[] = [];

  @HostBinding('class') get getHostClasses(): string {
    return `veera-generated-table-of-contents`;
  }
  @ViewChild('content') content!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private tocService: TableOfContentsService
  ) {}

  ngAfterViewInit(): void {
    const headingNodes: NodeList =
      this.content.nativeElement.querySelectorAll('h1, h2, h3');
    if (headingNodes.length > 0) {
      const headingEls = Array.from(headingNodes) as HTMLHeadingElement[];
      headingEls.forEach((headingEl: HTMLHeadingElement, i: number) => {
        if (headingEl.textContent) {
          const anchorId = `toc-${i}`;
          this.renderer.setProperty(headingEl, 'id', anchorId);
          this.tocItems.push({
            label: headingEl.textContent,
            href: `#${anchorId}`,
            observable: this.createItemIntersectionObserver(
              headingEl,
              anchorId
            ),
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.tocItems && this.tocItems.length > 0) {
      this.tocItems.forEach((item: TocItem) => {
        item.observable.disconnect();
      });
    }
  }

  createItemIntersectionObserver(
    headingEl: HTMLHeadingElement,
    anchorId: string
  ): IntersectionObserver {
    const intersectionObservable = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.tocService.setCurrentToCSection(anchorId);
          }
        });
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    intersectionObservable.observe(headingEl);
    return intersectionObservable;
  }
}

type TocItem = {
  label: string;
  href: string;
  observable: IntersectionObserver;
};
