import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Operation, Order } from '../../../model/Order';
import { OrderService } from '../../../service/order.service';

@Component({
  selector: 'app-table-design',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-design.component.html',
  styleUrls: ['./table-design.component.css'],
})
export class TableDesignComponent implements OnInit {
  order: Order | null = null;

  sectionColors: { [key: string]: string } = {};
  sectionKeys: string[] = [];

  displayedBlocks: { left: any | null; right: any | null }[] = [];

  private colorPalette: string[] = [
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#facc15',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#22d3ee',
    '#84cc16',
  ];
  private colorIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
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
    const visualBlocks: { section: string; operations: Operation[] }[] = [];

    let i = 0;
    while (i < operations.length) {
      const current = operations[i];
      const currentSection = current.section;

      if (!this.sectionColors[currentSection]) {
        this.sectionColors[currentSection] =
          this.colorPalette[this.colorIndex % this.colorPalette.length];
        this.colorIndex++;
      }

      const block = {
        section: currentSection,
        operations: [current],
      };

      const next = operations[i + 1];

      if (
        next &&
        next.section === currentSection &&
        current.allocated === 0.5 &&
        next.allocated === 0.5
      ) {
        block.operations.push(next);
        visualBlocks.push(block);
        i += 2;
      } else if (
        next &&
        next.section === currentSection &&
        current.allocated === 1.5 &&
        next.allocated === 0.5
      ) {
        block.operations.push(next);
        visualBlocks.push(block);
        visualBlocks.push({
          section: currentSection,
          operations: [next],
        });
        i += 2;
      } else {
        visualBlocks.push(block);
        i += 1;
      }
    }

    this.sectionKeys = Object.keys(this.sectionColors);

    // ⬇️ Bottom-up + Right-to-left: Reverse and push right-first
    const reversed = [...visualBlocks].reverse();
    for (let j = 0; j < reversed.length; j += 2) {
      this.displayedBlocks.push({
        right: reversed[j] || null,
        left: reversed[j + 1] || null,
      });
    }
  }

  getColor(section: string): string {
    return this.sectionColors[section] || '#666';
  }
}
