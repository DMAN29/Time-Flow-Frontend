import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Operation, Order } from '../../../model/Order';
import { OrderService } from '../../../service/order.service';
import { MatButton } from '@angular/material/button';

type Block = { section: string; operations: Operation[] };

@Component({
  selector: 'app-table-design',
  standalone: true,
  imports: [CommonModule, MatButton],
  templateUrl: './table-design.component.html',
  styleUrls: ['./table-design.component.css'],
})
export class TableDesignComponent implements OnInit {
  order: Order | null = null;

  sectionColors: { [key: string]: string } = {};
  sectionKeys: string[] = [];

  displayedBlocks: { left: Block | null; right: Block | null }[] = [];

  private colorPalette: string[] = [
    '#A2CFFE',
    '#BDFCC9',
    '#E3E4FA',
    '#FFE5B4',
    '#F08080',
    '#FFFFCC',
    '#B0E0E6',
    '#E0B0FF',
    '#87CEEB',
    '#9FE2BF',
    '#AFEEEE',
    '#F9C0C4',
    '#CCCCFF',
    '#FFDAB9',
    '#E6CCFF',
    '#FBCEB1',
    '#D6F6FF',
    '#FFFACD',
    '#FFE0BD',
  ];

  private colorIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (styleNo) {
      this.orderService.getOrderByStyleNo(styleNo).subscribe({
        next: (order: Order) => {
          this.order = order;
          this.prepareBlocks(order.operations ?? []);
        },
        error: (err) => console.error('❌ Failed to fetch order:', err),
      });
    }
  }

  prepareBlocks(operations: Operation[]): void {
    const visualBlocks: Block[] = [];
    let i = 0;

    while (i < operations.length) {
      const current = operations[i];
      const currentSection = current.section;
      const currentMachine = current.machineType;
      const currentAllocated = current.allocated;

      if (!this.sectionColors[currentSection]) {
        this.sectionColors[currentSection] =
          this.colorPalette[this.colorIndex % this.colorPalette.length];
        this.colorIndex++;
      }

      const fullBlocks = Math.floor(currentAllocated);
      for (let j = 0; j < fullBlocks; j++) {
        visualBlocks.push({
          section: currentSection,
          operations: [current],
        });
      }

      if (currentAllocated % 1 === 0.5) {
        const next = operations[i + 1];
        if (
          next &&
          next.section === currentSection &&
          next.machineType === currentMachine &&
          next.allocated % 1 === 0.5
        ) {
          visualBlocks.push({
            section: currentSection,
            operations: [current, next],
          });

          const nextFullBlocks = Math.floor(next.allocated);
          for (let k = 0; k < nextFullBlocks; k++) {
            visualBlocks.push({
              section: next.section,
              operations: [next],
            });
          }

          i++; // skip next (already paired)
        } else {
          visualBlocks.push({
            section: currentSection,
            operations: [current],
          });
        }
      }

      i++;
    }

    this.sectionKeys = Object.keys(this.sectionColors);

    const reversed = [...visualBlocks].reverse();
    const totalBlocks = reversed.length;

    const workingList: Block[] = [...reversed];

    // If odd, prepend a special empty block at the top-left
    if (totalBlocks % 2 !== 0) {
      workingList.unshift({
        section: 'EMPTY',
        operations: [],
      });
    }

    this.displayedBlocks = [];

    for (let j = 0; j < workingList.length; j += 2) {
      this.displayedBlocks.push({
        right: workingList[j] || null,
        left: workingList[j + 1] || null,
      });
    }
  }

  getColor(section: string): string {
    if (section === 'EMPTY') {
      return 'transparent'; // or a light gray if you want to style the empty slot
    }
    return this.sectionColors[section] || '#666';
  }

  goBack(): void {
    this.location.back();
  }
}
