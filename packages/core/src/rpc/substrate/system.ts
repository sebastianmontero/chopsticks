import { HexString } from '@polkadot/util/types'
import { Index } from '@polkadot/types/interfaces'
import { hexToU8a } from '@polkadot/util'
import _ from 'lodash'

import { ChainProperties } from '../../api.js'
import { Handler } from '../shared.js'

export const system_localPeerId = async () => '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
export const system_nodeRoles = async () => ['Full']
export const system_localListenAddresses = async () => []
export const system_chain: Handler<void, string> = async (context) => {
  return context.chain.head.runtimeVersion.then((runtime) => _.capitalize(runtime.specName))
}
export const system_properties: Handler<void, ChainProperties> = async (context) => {
  const meta = await context.chain.head.meta
  const properties = meta.registry.getChainProperties()
  if (!properties) {
    throw new Error('No chain properties found')
  }
  return properties.toJSON() as ChainProperties
}
export const system_name: Handler<void, string> = async (context) => {
  return context.chain.head.runtimeVersion.then((runtime) => `${_.capitalize(runtime.implName)} Chopsticks`)
}
export const system_version: Handler<void, string> = async (_context) => {
  return 'chopsticks-v1'
}
export const system_chainType: Handler<void, string> = async (_context) => {
  return 'Development'
}
export const system_health: Handler<void, any> = async (context) => {
  const peers = (await context.chain.lightClient?.getPeers()) ?? []
  return {
    peers: peers.length,
    isSyncing: false,
    shouldHavePeers: !!context.chain.lightClient,
  }
}

export const system_peers: Handler<void, any[]> = async (context) => {
  return context.chain.lightClient?.getPeers() ?? []
}

/**
 * @param context
 * @param params - [`extrinsic`, `at`]
 *
 * @return ApplyExtrinsicResult (see `@polkadot/types/interfaces`) in hash
 */
export const system_dryRun: Handler<[HexString, HexString], string> = async (context, [extrinsic, at]) => {
  const { outcome } = await context.chain.dryRunExtrinsic(extrinsic, at)
  return outcome.toHex()
}

/**
 * @param context
 * @param params - [`address`]
 */
export const system_accountNextIndex: Handler<[HexString], number> = async (context, [address]) => {
  const head = context.chain.head
  const registry = await head.registry
  const account = registry.createType('AccountId', address)
  const result = await head.call('AccountNonceApi_account_nonce', [account.toHex()])
  const nonce = registry.createType<Index>('Index', hexToU8a(result.result)).toNumber()
  return nonce + context.chain.txPool.pendingExtrinsicsBy(address).length
}
