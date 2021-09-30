import ChartCard from '../ChartCard'
import { ChainId } from '@sushiswap/sdk'
import { calculatePercentChange, getNumFromChartTimespan } from '../utils'
import { useBlock, useDayData, useFactory } from '../../../services/graph'
import { useMemo, useState } from 'react'

type DashboardChartType = 'liquidity' | 'volume'

interface DashboardChartCardProps {
  type: DashboardChartType
  chainId: ChainId
}

interface ChartData {
  figure: number
  change: number
  chart: { x: number; y: number }[]
}

interface Data {
  header: string
  getData: (exchange, exchange1d, exchange2d, dayData) => ChartData
}

const types: Record<DashboardChartType, Data> = {
  liquidity: {
    header: 'TVL',
    getData: (exchange, exchange1d, exchange2d, dayData) => ({
      figure: exchange?.liquidityUSD ?? 0,
      change: calculatePercentChange(exchange1d?.liquidityUSD ?? 0, exchange2d?.liquidityUSD ?? 0),
      chart: dayData?.sort((a, b) => a.date - b.date).map((day, i) => ({ x: i, y: Number(day.liquidityUSD) })) ?? [],
    }),
  },
  volume: {
    header: 'Volume',
    getData: (exchange, exchange1d, exchange2d, dayData) => ({
      figure: exchange && exchange1d ? exchange.volumeUSD - exchange1d.volumeUSD : 0,
      change:
        exchange && exchange1d && exchange2d
          ? ((exchange.volumeUSD - exchange1d.volumeUSD) / (exchange1d.volumeUSD - exchange2d.volumeUSD)) * 100 - 100
          : 0,
      chart: dayData?.sort((a, b) => a.date - b.date).map((day, i) => ({ x: i, y: Number(day.volumeUSD) })) ?? [],
    }),
  },
}

const chartTimespans = ['1W', '1M', '1Y', 'ALL']
export default function DashboardChartCard({ type: t, chainId }: DashboardChartCardProps): JSX.Element {
  const [chartTimespan, setChartTimespan] = useState('1M')

  const type = types[t]

  const block1d = useBlock({ daysAgo: 1, chainId })
  const block2d = useBlock({ daysAgo: 2, chainId })

  const exchange = useFactory({ chainId })
  const exchange1d = useFactory({ block: block1d, chainId })
  const exchange2d = useFactory({ block: block2d, chainId })

  const dayData = useDayData({
    first: getNumFromChartTimespan(chartTimespan),
    chainId,
  })

  const data = useMemo(
    () => type.getData(exchange, exchange1d, exchange2d, dayData),
    [exchange, exchange1d, exchange2d, dayData]
  )

  return (
    <ChartCard
      header={type.header}
      subheader="SUSHI AMM"
      figure={data.figure}
      change={data.change}
      data={data.chart}
      currentTimespan={chartTimespan}
      timespans={chartTimespans}
      setTimespan={setChartTimespan}
    />
  )
}
