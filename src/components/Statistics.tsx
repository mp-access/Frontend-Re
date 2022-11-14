import React, { SVGProps } from 'react'
import { round } from 'lodash'
import { Bar, BarChart, Cell, Label, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Box, Text } from '@chakra-ui/react'
import { TooltipProps } from 'recharts/types/component/Tooltip'


const tickStyle: SVGProps<any> = { fill: 'white', fontSize: '80%', alignmentBaseline: 'before-edge' }

const RoundBar = ({ fill, x, y, height, width }: SVGProps<any>) =>
    <rect x={x} y={y} height={height} width={width} rx={10} fill={fill === '#eee' ? '#ffffff61' : fill} />

const TaskTooltip = ({ active, payload, label }: TooltipProps<number, string>) =>
    active && payload?.length && !!payload[0]?.payload?.id &&
  <Box bg='blackAlpha.700' p={2} rounded='lg' fontSize='sm'>
    <Text fontWeight={600}>{label}</Text>
    <Text>My Score: {payload[0].payload.points} / {payload[0].payload.maxPoints}</Text>
    {!!payload[1]?.payload?.avgPoints
        && <Text>Avg. Score: {payload[1].payload.avgPoints} / {payload[1].payload.maxPoints}</Text>}
  </Box>


export const AssignmentScore = ({ data }: { data: AssignmentProps }) =>
    <ResponsiveContainer>
      <PieChart>
        <Tooltip cursor={false} wrapperStyle={{ outline: 'none' }} content={TaskTooltip} />
        <Pie dataKey='value' innerRadius={50} outerRadius={80} startAngle={90} endAngle={-270}
             data={[{ value: data.points, ...data }, { value: data.maxPoints - data.points }]}>
          <Cell key='cell-0' fill='#3dcb99' />
          <Cell key='cell-1' fill='#ffffff61' />
          <Label value={`${round(data.points / data.maxPoints * 100, 1)}%`} fill='#fff' fontSize='120%'
                 fontWeight={600} position='center' />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

export const TasksOverview = ({ data }: { data: Array<TaskOverview> }) =>
    <ResponsiveContainer>
      <BarChart data={data.map(task => ({ name: `Task ${task.ordinalNum}`, ...task }))}
                barSize={20} barGap={15} margin={{ top: 10, bottom: 20 }}>
        <XAxis axisLine={false} tick={tickStyle} fontWeight={600} dataKey='name' tickMargin={25} />
        <Tooltip cursor={false} wrapperStyle={{ outline: 'none' }} content={TaskTooltip} />
        <Bar shape={<RoundBar />} dataKey='points' fill='#3dcb99' minPointSize={10} background={<RoundBar />}>
          <LabelList formatter={() => 'Me'} offset={10} position='bottom' fontSize='80%' fill='#fff' />
        </Bar>
        <Bar shape={<RoundBar />} dataKey='avgPoints' fill='#d7d9e2' minPointSize={10} background={<RoundBar />}>
          <LabelList formatter={() => 'Avg'} offset={10} position='bottom' fontSize='80%' fill='#fff' />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
