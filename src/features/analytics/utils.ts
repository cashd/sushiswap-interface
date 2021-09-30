import { match } from 'ts-pattern'

export const calculatePercentChange = (x: number, y: number) => (x / y) * 100 - 100

export const getNumFromChartTimespan = (chartTimespan: string) =>
  match(chartTimespan)
    .with('1W', () => 7)
    .with('1M', () => 30)
    .with('1Y', () => 365)
    .otherwise(() => undefined)
