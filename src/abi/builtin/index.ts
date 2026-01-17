import type { AbiMethodSpecEntry } from '../loader.js';
import { addAccountMethods } from './native/account.js';
import { addBlockMethods } from './native/block.js';
import { addConsensusMethods } from './native/consensus.js';
import { addExchangeMethods } from './native/exchange.js';
import { addFriendsMethods } from './native/friends.js';
import { addGasMethods } from './native/gas.js';
import { addGovernanceMethods } from './native/governance.js';
import { addInteropMethods } from './native/interop.js';
import { addMailMethods } from './native/mail.js';
import { addMarketMethods } from './native/market.js';
import { addPrivacyMethods } from './native/privacy.js';
import { addRankingMethods } from './native/ranking.js';
import { addRelayMethods } from './native/relay.js';
import { addSaleMethods } from './native/sale.js';
import { addStakeMethods } from './native/stake.js';
import { addStorageMethods } from './native/storage.js';
import { addSwapMethods } from './native/swap.js';
import { addValidatorMethods } from './native/validator.js';
import { addAccountInteropMethods } from './interop/account.js';
import { addConstructorsInteropMethods } from './interop/constructors.js';
import { addDataInteropMethods } from './interop/data.js';
import { addListInteropMethods } from './interop/list.js';
import { addMapInteropMethods } from './interop/map.js';
import { addNexusInteropMethods } from './interop/nexus.js';
import { addOracleInteropMethods } from './interop/oracle.js';
import { addOrganizationInteropMethods } from './interop/organization.js';
import { addRuntimeInteropMethods } from './interop/runtime.js';

// Built-in ABI table derived from Phantasma-NG sources for standard contracts/interop.
export function buildBuiltinMethodTable(): Map<string, AbiMethodSpecEntry> {
  const table = new Map<string, AbiMethodSpecEntry>();

  addRuntimeInteropMethods(table);
  addNexusInteropMethods(table);
  addOrganizationInteropMethods(table);
  addDataInteropMethods(table);
  addMapInteropMethods(table);
  addListInteropMethods(table);
  addAccountInteropMethods(table);
  addOracleInteropMethods(table);
  addConstructorsInteropMethods(table);

  addGasMethods(table);
  addBlockMethods(table);
  addStakeMethods(table);
  addSwapMethods(table);
  addAccountMethods(table);
  addConsensusMethods(table);
  addGovernanceMethods(table);
  addStorageMethods(table);
  addValidatorMethods(table);
  addInteropMethods(table);
  addExchangeMethods(table);
  addPrivacyMethods(table);
  addRelayMethods(table);
  addRankingMethods(table);
  addMarketMethods(table);
  addFriendsMethods(table);
  addMailMethods(table);
  addSaleMethods(table);

  return table;
}
