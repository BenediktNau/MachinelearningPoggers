import { Vector } from "excalibur";

export type State = "running" | "finished" | "crashed" | "timeout";

export interface carCorners {
  lt: Vector;
  lb: Vector;
  rt: Vector;
  rb: Vector;
}
