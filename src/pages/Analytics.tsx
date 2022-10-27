import { Heading, HStack, Stack } from '@chakra-ui/react'
import { ScriptableContext } from 'chart.js'
import { Chart } from 'primereact/chart'
import React from 'react'

const gradientBorder = (context: ScriptableContext<any>) => {
  if (context?.chart?.chartArea) {
    const gradient = context.chart.ctx.createLinearGradient(0,
        context.chart.chartArea.bottom, 0, context.chart.chartArea.top)
    gradient.addColorStop(0, '#344FDB')
    gradient.addColorStop(1, '#CF6BFF')
    return gradient
  }
}

export default function Analytics() {
  const tickStyle = { color: '#999999', font: { family: '"DM Sans", sans-serif', size: 14 } }
  const dataset = {
    data: [48, 76, 66, 81], borderColor: gradientBorder, pointRadius: 0, fill: 'start',
    tension: .1
  }
  const xAxis = { ticks: tickStyle, grid: { display: false } }
  const yAxis = { min: 0, max: 100, ticks: tickStyle, grid: { color: '#ebedef', borderDash: [8, 4] } }
  const options = { scales: { x: xAxis, y: yAxis }, plugins: { legend: { display: false } } }

  return (
      <Stack flexGrow={1} w='70%' p={6}>
        <HStack spacing={5}>
          <Heading m={2} fontSize='3xl'>Analytics</Heading>
        </HStack>
        <Chart type='line' data={{ labels: ['Task 1', 'Task 2', 'Task 3', 'Task 4'], datasets: [dataset] }}
               options={options} />
      </Stack>
  )
}