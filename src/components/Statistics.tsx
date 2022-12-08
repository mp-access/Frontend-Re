import React, { SVGProps } from 'react'
import { range, round } from 'lodash'
import { Bar, BarChart, Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Flex, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react'
import { BsFillCircleFill } from 'react-icons/bs'

type ScoreProps = { data: Array<Partial<{ points: number, name: string }>>, points: number, max: number }
type TimeCounterProps = { values: Array<TimeCountProps>, h?: number }

const VBar = ({ x, y, height, width, fill }: SVGProps<any>) =>
    <rect x={x} y={y} height={height} width={width || 1} rx={10} fill={fill} />
const HBar = ({ x, height, width, fill }: SVGProps<any>) =>
    <rect x={x} height={height} width={width} rx={5} fill={fill} />

const toPercent = (value = 0, max = 1) => `${round((value * 100.0) / max, 2)}%`
const roundedStyle = { shape: <VBar />, background: <VBar /> }
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

export const TimeCountDown = ({ values, h = 20 }: TimeCounterProps) =>
    <SimpleGrid h={h} w={h * 3} columns={3}>
      {values.map((counter, i) =>
          <TimeCount key={i} current={counter.current} max={counter.max} name={counter.name} />)}
    </SimpleGrid>

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

export const TaskOverview = ({ points, maxPoints, avgPoints, name }: TaskOverview) =>
    <ResponsiveContainer>
      <BarChart data={[{ points, avgPoints, name }]} barSize={15}>
        <YAxis hide type='number' domain={[0, maxPoints]} />
        <XAxis axisLine={false} tickLine={false} tick={{ fontSize: '80%', fontWeight: 600 }} dataKey='name' />
        <Tooltip formatter={(value) => `${value} / ${maxPoints}`} {...tooltipStyle} />
        <Bar dataKey='points' name='My Score' minPointSize={5} fill='#3dcb99' {...roundedStyle} />
        <Bar dataKey='avgPoints' name='Average' minPointSize={5} fill='#9576ff' {...roundedStyle} />
      </BarChart>
    </ResponsiveContainer>

export const TasksOverview = ({ data }: { data: Array<TaskOverview> }) =>
    <SimpleGrid boxSize='full' templateColumns={`auto repeat(${data.length}, 1fr)`}>
      <Stack justify='center'>
        <Tag colorScheme='whiteAlpha' color='green.600'>
          <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
          <TagLabel>My Score</TagLabel>
        </Tag>
        <Tag colorScheme='whiteAlpha' color='purple.600'>
          <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
          <TagLabel>Average</TagLabel>
        </Tag>
      </Stack>
      {data.map((task, i) => <TaskOverview key={i} {...task} />)}
    </SimpleGrid>

export const ProgressBar = ({ value = 0, max = 1, w = 24 }) =>
    <Flex minW={w} h={3}>
      <ResponsiveContainer>
        <BarChart data={[{ value }]} barSize={10} layout='vertical'>
          <XAxis hide type='number' domain={[0, max]} />
          <Bar dataKey='value' fill='#3dcb99' dx={-10} shape={<HBar />} background={<HBar fill='#e1e1e1' />} />
        </BarChart>
      </ResponsiveContainer>
    </Flex>