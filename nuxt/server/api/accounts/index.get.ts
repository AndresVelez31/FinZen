// External imports
import { defineEventHandler } from 'h3';

// Internal imports
import { AccountsService } from '../../accounts/accounts.service';

// Exports
// Route handler acting as the controller: GET /api/accounts
export default defineEventHandler(async () => await AccountsService.findAll());
