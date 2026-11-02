// External imports
import { defineEventHandler, getRouterParam } from 'h3';

// Internal imports
import { AccountsService } from '../../accounts/accounts.service';
import { AccountsValidator } from '../../accounts/accounts.validate';

// Exports
// Route handler acting as the controller: GET /api/accounts/:id
export default defineEventHandler(async (event) => {
  const id = AccountsValidator.parseId(getRouterParam(event, 'id'));
  return await AccountsService.findOne(id);
});
