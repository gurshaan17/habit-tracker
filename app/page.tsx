'use client'

import { Github, Mail } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

interface Habit {
  id: string
  name: string
  dates: { [key: string]: boolean }
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [daysToNewYear, setDaysToNewYear] = useState(0)

  const loadHabits = useCallback(() => {
    const storedHabits = localStorage.getItem('habits')
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits))
    }
  }, [])

  const saveHabits = useCallback((habitsToSave: Habit[]) => {
    localStorage.setItem('habits', JSON.stringify(habitsToSave))
  }, [])

  const updateDaysToNewYear = useCallback(() => {
    const now = new Date()
    const newYear = new Date(now.getFullYear() + 1, 0, 1)
    const timeDiff = newYear.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    setDaysToNewYear(daysDiff)
  }, [])

  const resetHabitsIfNewYear = useCallback(() => {
    const now = new Date()
    if (now.getMonth() === 0 && now.getDate() === 1) {
      const resetHabits = habits.map(habit => ({
        ...habit,
        dates: {}
      }))
      setHabits(resetHabits)
      saveHabits(resetHabits)
    }
  }, [habits, saveHabits])

  useEffect(() => {
    loadHabits()
    updateDaysToNewYear()
    const timer = setInterval(updateDaysToNewYear, 1000 * 60 * 60) // Update every hour
    return () => clearInterval(timer)
  }, [loadHabits, updateDaysToNewYear])

  useEffect(() => {
    resetHabitsIfNewYear()
  }, [resetHabitsIfNewYear])

  useEffect(() => {
    saveHabits(habits)
  }, [habits, saveHabits])

  const addHabit = useCallback(() => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        dates: {}
      }
      setHabits(prevHabits => [...prevHabits, newHabit])
      setNewHabitName('')
    }
  }, [newHabitName])

  const toggleHabit = useCallback((habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          return {
            ...habit,
            dates: {
              ...habit.dates,
              [today]: !habit.dates[today]
            }
          }
        }
        return habit
      })
    )
  }, [])

  const getCompletionRate = useCallback((habit: Habit) => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const daysSinceStartOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const completedDays = Object.values(habit.dates).filter(Boolean).length
    return `${completedDays}/${daysSinceStartOfYear}`
  }, [])

  return (
    <div className="min-h-screen p-4 bg-white text-gray-800">
      <header className="mb-6">
        <h1 className="text-5xl font-bold">Habit Tracker</h1>
        {daysToNewYear <= 12 && (
          <p className="text-lg text-gray-600 mt-2">
            {daysToNewYear} day{daysToNewYear !== 1 ? 's' : ''} to New Year
          </p>
        )}
      </header>
      <h2 className='pb-5'>A simple habit tacker that stores data on your browser.</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="Enter new habit"
          className="mr-2 px-2 py-1 rounded border border-gray-300"
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Add Habit
        </button>
      </div>
      <ul>
        {habits.map(habit => (
          <li key={habit.id} className="mb-4 p-4 border rounded">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{habit.name}</span>
              <span className="text-sm text-gray-600">{getCompletionRate(habit)}</span>
            </div>
            <button
              onClick={() => toggleHabit(habit.id)}
              className={`mt-2 px-4 py-2 rounded ${
                habit.dates[new Date().toISOString().split('T')[0]]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {habit.dates[new Date().toISOString().split('T')[0]] ? 'Completed' : 'Mark as Complete'}
            </button>
          </li>
        ))}
      </ul>
        <footer className="mt-auto flex justify-center py-48">
          <div className="flex gap-4">
            <a
              href="mailto:gurshaansinghd@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              <Mail className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/gurshaan17/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </footer>
    </div>
  )
}

