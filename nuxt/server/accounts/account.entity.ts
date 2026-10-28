// Exports
// There is no database in this mini project, so the fields are plain properties that are
// declared with `!` instead of being mapped by an ORM.
export class Account {
  id!: number;
  name!: string;
  type!: string;
  balance!: number;
  createdAt!: string;
  updatedAt!: string;
  userId!: number;
}
