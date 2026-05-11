export type Person = {
  id: string;
  name: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  assignedTo: string | null;
};

export type SplitSession = {
  id: string;
  title: string;
  tax: number;
  tip: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  people: Person[];
  items: ReceiptItem[];
};

export type PersonTotal = Person & {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};
