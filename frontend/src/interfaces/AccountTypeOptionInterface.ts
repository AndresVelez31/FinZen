// External imports
import type { Component } from 'vue';

// Internal imports
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';

// Exports
// An option of the account type selector: a filter option plus the icon it shows.
export interface AccountTypeOptionInterface extends FilterOptionInterface {
  icon: Component;
}
