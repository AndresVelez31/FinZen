// Exports
// One cell of the date picker grid: a day of the shown month or of its neighbours.
export interface CalendarDayInterface {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}
