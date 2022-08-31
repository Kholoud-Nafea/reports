// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//

export type tableField = {
  value: string | number;
  name: string;
  type?: string;
  readOnly?: boolean;
  edited?: boolean;
  options?: [];
}[]

