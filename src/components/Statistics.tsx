import React, { SVGProps } from 'react'
import { range, round } from 'lodash'
import { Bar, BarChart, Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { SimpleGrid } from '@chakra-ui/react'

type ScoreProps = { data: Array<Partial<{ points: number, name: string }>>, points: number, max: number }

const Rounded = ({ x, y, height, width, fill }: SVGProps<any>) =>
    <rect x={x} y={y || 1} height={height} width={width} rx='2%' fill={fill} />
const NameLabel = ({ x, y, cx, cy, fill, textAnchor, name }: SVGProps<any>) =>
    <text x={x} y={y} cx={cx} cy={cy} fill={fill} textAnchor={textAnchor} children={name}
          dx={5 * (textAnchor === 'start' ? 1 : -1)} alignmentBaseline='middle' fontSize='80%' />

const toPercent = (value = 0, max = 1) => `${round(value / max * 100, 1)}%`
const roundedStyle = { shape: <Rounded />, background: <Rounded /> }
const tooltipStyle = {
  contentStyle: { borderRadius: 8, background: '#ffffffa3', border: 'none', fontSize: '80%', fontWeight: 600 },
  wrapperStyle: { outline: 'none' }, itemStyle: { padding: 1 },
  cursor: { fill: 'transparent', cursor: 'pointer' }
}

const Counter = ({ value = 0, max = 1, name = '' }) =>
    <ResponsiveContainer>
      <PieChart>
        <Pie data={[{ value }, { value: max - value }]} dataKey='value' innerRadius='50%' outerRadius='65%'
             startAngle={90} endAngle={-270} fill='#00000014' cy='40%'>
          <Cell key='cell-0' fill='#3dcb99' />
          <Label value={value} fill='#3dcb99' fontWeight={600} position='center' />
          <Label value={name} fill='#0000007a' fontSize='75%' position='bottom' dy={12} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

export const CountDown = ({ maxDays = 1, days = 0, hours = 0, minutes = 0, h = 20 }) =>
    <SimpleGrid h={h} w={h * 3} columns={3}>
      <Counter value={days} max={maxDays} name='DAYS' />
      <Counter value={hours} max={24} name='HOURS' />
      <Counter value={minutes} max={60} name='MINUTES' />
    </SimpleGrid>

export const ProgressScore = ({ data, points = 0, max = 1 }: ScoreProps) =>
    <ResponsiveContainer>
      <PieChart>
        <Tooltip {...tooltipStyle} formatter={(value) => `${value} Points`} />
        <Pie dataKey='points' innerRadius='65%' outerRadius='100%' startAngle={90} endAngle={-270} nameKey='name'
             data={[...data, { points: max - points, name: 'Remaining' }]} label={NameLabel} fill='#00000014'>
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
    <ResponsiveContainer height={20}>
      <BarChart data={[{ value }]} barSize={10} layout='vertical'>
        <XAxis hide type='number' domain={[0, max]} />
        <Bar dataKey='value' fill='#3dcb99' {...roundedStyle} />
      </BarChart>
    </ResponsiveContainer>