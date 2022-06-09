import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Analytics from './pages/Analytics'
import AssignmentCreator from './pages/AssignmentCreator'
import Course from './pages/Course'
import CourseCreator from './pages/CourseCreator'
import Courses from './pages/Courses'
import Error from './pages/Error'
import Layout from './pages/Layout'
import Sandbox from './pages/Sandbox'
import Students from './pages/Students'
import TaskCreator from './pages/TaskCreator'

export default function Navigation() {
  return (
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Courses />} />
          <Route path='courses' element={<Navigate to='/' />} />
          <Route path='create-course' element={<CourseCreator />} />
          <Route path='courses/:courseURL'>
            <Route index element={<Course />} />
            <Route path='create-assignment' element={<AssignmentCreator />} />
            <Route path='students' element={<Students />} />
            <Route path='analytics' element={<Analytics />} />
            <Route path='assignments' element={<Navigate to='..' />} />
            <Route path='assignments/:assignmentURL'>
              <Route index element={<Navigate to='1' />} />
              <Route path='create-task' element={<TaskCreator />} />
              <Route path=':taskNum' element={<Sandbox />} />
            </Route>
          </Route>
        </Route>
        <Route path='*' element={<Error />} />
      </Routes>
  )
}