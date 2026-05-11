import type { PersonTotal, SplitSession } from "@/lib/types";

export function calculateTotals(session: SplitSession): PersonTotal[] {
  const subtotal = session.items.reduce((sum, item) => sum + item.price, 0);
  const people = session.people.length ? session.people : [{ id: "unassigned", name: "Unassigned" }];

  return people.map((person) => {
    const personSubtotal = session.items
      .filter((item) => item.assignedTo === person.id)
      .reduce((sum, item) => sum + item.price, 0);
    const ratio = subtotal > 0 ? personSubtotal / subtotal : 0;
    const tax = session.tax * ratio;
    const tip = session.tip * ratio;
    return {
      ...person,
      subtotal: personSubtotal,
      tax,
      tip,
      total: personSubtotal + tax + tip
    };
  });
}
