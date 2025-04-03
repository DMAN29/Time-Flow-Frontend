export interface TimeStudy {
  id: string;
  styleNo: string;
  operatorName: string;
  operatorId: string;
  operationName: string;
  section: string;
  machineType: string;
  laps: string[];
  lapsMS: number[];
  avgTime: string;
  allowanceTime: string;
  remarks: string;
  capacityPH: number;
  capacityPD: number;
}

export interface RemarkRequest {
  operatorId: string;
  styleNo: string;
  remark: string;
}

export interface LapsRequest {
  operatorId: string;
  styleNo: string;
  laps: number[];
}
