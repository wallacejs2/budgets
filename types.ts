
export enum User {
  Me = 'Me',
  Roommate = 'Roommate',
}

export enum SplitMethod {
  Equally = 'Split 50/50',
  MeOwesFull = 'You owe 100%',
  RoommateOwesFull = 'Roommate owes 100%',
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  paidBy: User;
  splitMethod: SplitMethod;
}
