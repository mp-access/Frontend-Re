import { SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react'
import { round } from 'lodash'
import React from 'react'
import { Bar, BarChart, Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const green = 'var(--chakra-colors-green-400)'
const purple = 'var(--chakra-colors-purple-400)'
const bg = { opacity: 0.5, clipPath: 'inset(0 round 10)' }
type TimeCounterProps = { values: Array<TimerProps> }

const toPercent = (value = 0, max = 1) => `${round((value * 100.0) / max, 2)}%`
const clipPath = (value: number, max: number) => `inset(0 round ${value < (0.9 * max) ? '0 0 10 10' : '10'})`

const RoundBar = ({ x, y, height, width, background, color }: any) =>
    <g clipPath='inset(0 round 6)'>
      <rect x={x} y={y} height={background.height} width={background.width} opacity={0.05} />
      <rect x={x} y={y} height={height} width={width} color={color} fill='currentColor' />
    </g>

const TimeCount = ({ current, max, name }: TimerProps) =>
    <ResponsiveContainer>
      <PieChart height={120} width={100}>
        <Pie data={[{ current }, { current: max - current }]} dataKey='current' innerRadius='80%' outerRadius='100%'
             startAngle={90} endAngle={-270} cy='35%'>
          <Cell key='cell-0' color={green} fill='currentColor' />
          <Cell key='cell-1' opacity={0.15} />
          <Label value={current} color={green} fill='currentColor' fontWeight={600} position='center' />
          <Label value={name} opacity={0.7} fontSize='75%' position='bottom' dy={12} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

export const TimeCountDown = ({ values }: TimeCounterProps) =>
    <SimpleGrid h={16} w={40} columns={3}>
      {values.map((counter, i) =>
          <TimeCount key={i} current={counter.current} max={counter.max} name={counter.name} />)}
    </SimpleGrid>

export const ScorePie = ({ value = 0, max = 1 }) =>
    <ResponsiveContainer>
      <PieChart>
        <Pie dataKey='value' innerRadius='65%' outerRadius='100%' startAngle={90} endAngle={-270}
             data={[{ value }, { value: max - value }]}>
          <Cell key='cell-0' color={green} fill='currentColor' />
          <Cell key='cell-1' opacity={0.15} />
          <Label value={toPercent(value, max)} color={green} fill='currentColor' fontWeight={600} position='center' />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

export const Scores = ({ value = 0, max = 1, avg = 0, name = '' }) =>
    <VStack px={4} flexGrow={1}>
      <ResponsiveContainer width={50}>
        <BarChart data={[{ value, name: 'Me' }, { value: avg, name: 'Avg.' }]} margin={{}} barCategoryGap={5}>
          <XAxis hide type='category' dataKey='name' />
          <YAxis hide type='number' dataKey='value' domain={[0, max || 1]} />
          <Tooltip />
          <Bar dataKey='value' minPointSize={5} fill='currentColor' background={bg}>
            <Cell key='cell-0' color={green} clipPath={clipPath(value, max)} />
            <Cell key='cell-1' color={purple} clipPath={clipPath(avg, max)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Text fontSize='sm' fontWeight={500}>{name}</Text>
    </VStack>

export const Score = ({ value = 0, max = 1, avg = 0 }) =>
    <ResponsiveContainer minHeight={50}>
      <BarChart data={[{ value, name: 'Me' }, { value: avg, name: 'Avg.' }]} barSize={15} layout='vertical'>
        <XAxis hide type='number' dataKey='value' domain={[0, max || 1]} />
        <YAxis axisLine={false} tickLine={false} interval={0} fontSize='small' type='category' dataKey='name' />
        <Bar dataKey='value' minPointSize={5} shape={RoundBar}>
          <Cell key='cell-0' color={green} />
          <Cell key='cell-1' color={purple} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>

export const ScoreBar = ({ value = 0, max = 1 }) =>
    <Stack flexGrow={1} align='end' justify='end' spacing={0}>
      <Text textAlign='end' px={2} fontSize='sm' fontWeight={500}>{value} / {max} Points</Text>
      <ResponsiveContainer height={17}>
        <BarChart data={[{ value, name: 'Score' }]} margin={{}} barSize={15} layout='vertical'>
          <XAxis hide type='number' dataKey='value' domain={[0, max || 1]} />
          <YAxis hide type='category' dataKey='name' />
          <Bar dataKey='value' color={green} shape={RoundBar} />
        </BarChart>
      </ResponsiveContainer>
    </Stack>