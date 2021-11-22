import { ChainId } from '@sushiswap/sdk'
import useSWR, { SWRConfiguration } from 'swr'
import { useDayData, useSushiPrice } from '.'
import { getBar, getBarHistory } from '../fetchers/bar'
import { useBlock } from './blocks'

interface useBarProps {
  timestamp?: numBber
  block?: number
  shouldFetch?: boolean
}

export function useBar(
  { timestamp, block, shouldFetch = true }: useBarProps = {},
  swrConfig: SWRConfiguration = undefined
) {
  const blockFetched = useBlock({ timestamp, chainId: ChainId.MAINNET, shouldFetch: shouldFetch && !!timestamp })
  block = block ?? (timestamp ? blockFetched : undefined)

  const { data } = useSWR(shouldFetch ? ['bar', block] : null, () => getBar(block), swrConfig)
  return data
}

interface useBarHistoryProps {
  shouldFetch?: boolean
}

export function useBarHistory(
  { shouldFetch = true }: useBarHistoryProps = {},
  swrConfig: SWRConfiguration = undefined
) {
  const { data } = useSWR(shouldFetch ? ['barHistory'] : null, () => getBarHistory(), swrConfig)
  return data
}

export function useYesterdayBarApr() {
  const block1d = useBlock({ daysAgo: 1, chainId: ChainId.MAINNET })
  const bar1d = useBar({ block: block1d, shouldFetch: !!block1d })
  const exchange1d = useDayData({ block: block1d, chainId: ChainId.MAINNET, shouldFetch: !!block1d })
  const sushiPrice = useSushiPrice()

  if (exchange1d && bar1d && block1d && sushiPrice) {
    const volumeUSD = exchange1d[1].volumeUSD
    const totalSushiStakedUSD = bar1d.totalSupply * bar1d.ratio * sushiPrice
    return ((volumeUSD * 0.0005 * 365) / totalSushiStakedUSD) * 100
  }
}
