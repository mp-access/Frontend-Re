import React, { SVGProps } from 'react'
import { divide, round } from 'lodash'
import { Bar, BarChart, Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Box, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const Rounded = ({ x, y, height, width, fill }: SVGProps<any>) =>
    <rect x={x} y={y} height={height} width={width} rx={8} fill={fill === '#eee' ? '#ffffff61' : fill} />
const NameLabel = ({ x, y, cx, cy, fill, textAnchor, name }: SVGProps<any>) =>
    <text x={x} y={y} cx={cx} cy={cy} fill={fill} textAnchor={textAnchor} children={name}
          dx={5 * (textAnchor === 'start' ? 1 : -1)} alignmentBaseline='middle' fontSize='80%' />

const roundedStyle = { shape: <Rounded />, minPointSize: 10, background: <Rounded /> }
const tooltipStyle = {
  contentStyle: { borderRadius: 8, background: '#000000ad', border: 'none', fontSize: '80%' },
  wrapperStyle: { outline: 'none' }, itemStyle: { padding: 1, color: 'inherit' },
  cursor: { fill: 'transparent', cursor: 'pointer' }
}

export const CourseScore = ({ points = 0, maxPoints = 1 }) =>
    <ResponsiveContainer>
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Pie dataKey='points' innerRadius={50} outerRadius={80} startAngle={90} endAngle={-270} label={NameLabel}
             nameKey='name'
             data={[{ points, name: 'My Score' }, { points: maxPoints - points, name: 'Remaining' }]} fill='#ffffff61'>
          <Cell key='cell-0' fill='#3dcb99' />
          <Cell key='cell-1' fill='#ffffff61' />
          <Label value={`${round(points / maxPoints * 100, 1)}%`} fill='#fff'
                 fontWeight={600} position='center' />
        </Pie>
      </PieChart>
    </ResponsiveContainer>


export const AssignmentScore = ({ data }: { data: AssignmentProps }) => {
  const scoredTasks = data.tasks.filter(task => task.points)
  return (
      <ResponsiveContainer>
        <PieChart>
          <Tooltip {...tooltipStyle} formatter={(value) => `${value} Points`} />
          <Pie dataKey='points' innerRadius={50} outerRadius={80} startAngle={90} endAngle={-270} fill='#ffffff61'
               nameKey={({ ordinalNum }) => ordinalNum ? `Task ${ordinalNum}` : 'Remaining'}
               data={[...scoredTasks, { points: data.maxPoints - data.points }]} label={NameLabel}>
            {scoredTasks.map((_, i) => <Cell key={`cell-${i}`} fill='#3dcb99' />)}
            <Cell key={`cell-${scoredTasks.length}`} fill='#ffffff61' />
            <Label value={`${round(data.points / data.maxPoints * 100, 1)}%`} fill='#fff'
                   fontWeight={600} position='center' />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
  )
}

export const TasksOverview = ({ data }: { data: Array<TaskOverview> }) =>
    <ResponsiveContainer>
      <BarChart data={data} barSize={15}>
        <XAxis axisLine={false} tick={{ fill: '#fff', fontSize: '80%', fontWeight: 600 }} dataKey='ordinalNum'
               tickFormatter={(value) => `Task ${value}`} />
        <Tooltip formatter={(value, _, item) => `${value} / ${item.payload.maxPoints}`}
                 labelFormatter={(label) => <b>{`Task ${label}`}</b>} {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '80%', lineHeight: 1.2 }} iconType='circle' iconSize={8} />
        <Bar dataKey='points' name='My Score' fill='#3dcb99' {...roundedStyle} />
        <Bar dataKey='avgPoints' name='Average' fill='#d7d9e2' {...roundedStyle} />
      </BarChart>
    </ResponsiveContainer>

export const ProgressBar = ({ value = 0, max = 1, w = '3xs' }) =>
    <HStack w={w}>
      <HStack h={3} w='full' rounded='2xl' bg='gray.200' position='relative' overflow='hidden'>
        <Box as={motion.div} position='absolute' top={0} left={0} right={0} h='full' bg='green.300' transformOrigin={0}
             style={{ scaleX: divide(value, max || 1) }} />
      </HStack>
      <Text w={6} whiteSpace='nowrap' fontSize='70%'>{Math.round(divide(value, max || 1) * 100)}%</Text>
    </HStack>