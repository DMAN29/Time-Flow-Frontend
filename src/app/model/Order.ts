export interface Order {
  id: string;
  styleNo: string;
  itemNo: string;
  description: string;
  fabric: string;
  division: string;
  buyer: string;
  orderQuantity: number;
  target: number;
  lineDesign: number;
  efficiency: number;
  designOutput: number;
  totalSam: number;
  totalAllocation: number;
  totalRequired: number;
  operations: Operation[];
  createdAt: string;
  allowance: number;
  lane: number;
  createdBy: string;
}

export interface LaneRequest {
  styleNo: string;
  lane: number;
}
export interface AllowanceRequest {
  styleNo: string;
  allowance: number;
}

export interface Operation {
  id: string;
  operationName: string;
  section: string;
  machineType: string;
  sam: number;
  required: number;
  allocated: number;
  target: number;
}
