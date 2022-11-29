import React, { SVGProps, useState } from 'react'
import { compact, findLast, range, round } from 'lodash'
import { Bar, BarChart, Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Flex, SimpleGrid, Text } from '@chakra-ui/react'
import Countdown from 'react-countdown'
import { isAfter, parseISO } from 'date-fns'

type ScoreProps = { data: Array<Partial<{ points: number, name: string }>>, points: number, max: number }
type TimeCounterProps = { values: Array<TimeCountProps>, h?: number }

const Rounded = ({ x, y, height, width, fill }: SVGProps<any>) =>
    <rect x={x} y={y || 1} height={height} width={width} rx='2%' fill={fill} />

const toPercent = (value = 0, max = 1) => `${round(value / max * 100, 1)}%`
const roundedStyle = { shape: <Rounded />, background: <Rounded /> }
const tooltipStyle = {
  contentStyle: { borderRadius: 8, background: '#ffffffa3', border: 'none', fontSize: '80%', fontWeight: 600 },
  wrapperStyle: { outline: 'none' }, itemStyle: { padding: 1 },
  cursor: { fill: 'transparent', cursor: 'pointer' }
}

const TimeCount = ({ current, max, name }: TimeCountProps) =>
    <ResponsiveContainer>
      <PieChart>
        <Pie data={[{ current }, { current: max - current }]} dataKey='current' innerRadius='50%' outerRadius='65%'
             startAngle={90} endAngle={-270} fill='#00000014' cy='40%'>
          <Cell key='cell-0' fill='#3dcb99' />
          <Label value={current} fill='#3dcb99' fontWeight={600} position='center' />
          <Label value={name} fill='#0000007a' fontSize='75%' position='bottom' dy={12} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

export const CountTo = ({ values, h = 20 }: TimeCounterProps) =>
    <SimpleGrid h={h} w={h * 3} columns={3}>
      {values.map((counter, i) =>
          <TimeCount key={i} current={counter.current} max={counter.max} name={counter.name} />)}
    </SimpleGrid>

export const CountDown = ({ values }: { values: Array<string> }) => {
  const [end] = useState(findLast(compact(values), d => isAfter(parseISO(d), new Date())))
  if (!end)
    return <></>
  return (
      <Flex pos='absolute' fontSize='xs' bottom={-3} right={3}>
        <Countdown date={end} daysInHours renderer={props => !props.completed &&
          <Text whiteSpace='nowrap'>
            New attempt in {props.hours ? props.hours + ' hours' : (props.minutes + 1) + ' minutes'}
          </Text>} />
      </Flex>
  )
}

export const ProgressScore = ({ data, points = 0, max = 1 }: ScoreProps) =>
    <ResponsiveContainer>
      <PieChart>
        <Tooltip {...tooltipStyle} formatter={(value) => `${value} Points`} />
        <Pie dataKey='points' innerRadius='65%' outerRadius='100%' startAngle={90} endAngle={-270} nameKey='name'
             data={[...data, { points: max - points, name: 'Remaining' }]} fill='#00000014'>
          {range(data.length).map(i => <Cell key={`cell-${i}`} fill='#3dcb99' />)}
          <Label value={toPercent(points, max)} fill='#3dcb99' fontWeight={600} position='center' />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

export const TasksOverview = ({ data }: { data: Array<TaskOverview> }) =>
    <ResponsiveContainer>
      <BarChart data={data} barSize={15}>
        <XAxis axisLine={false} tickLine={false} tick={{ fontSize: '80%', fontWeight: 600 }} dataKey='name' />
        <Tooltip formatter={(value, _, { payload }) => `${value} / ${payload.maxPoints}`} {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '80%', lineHeight: 1.2 }} iconType='circle' iconSize={8}
                layout='vertical' align='left' verticalAlign='middle' />
        <Bar dataKey='points' name='My Score' minPointSize={5} fill='#3dcb99' {...roundedStyle} />
        <Bar dataKey='avgPoints' name='Average' minPointSize={5} fill='#9576ff' {...roundedStyle} />
      </BarChart>
    </ResponsiveContainer>

export const ProgressBar = ({ value = 0, max = 1 }) =>
    <ResponsiveContainer height={10}>
      <BarChart data={[{ value }]} barSize={10} layout='vertical'>
        <XAxis hide type='number' domain={[0, max]} />
        <Bar dataKey='value' fill='#3dcb99' {...roundedStyle} />
      </BarChart>
    </ResponsiveContainer>