import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import TaskCard from "@/components/molecules/TaskCard";
import SearchBar from "@/components/molecules/SearchBar";
import FilterBar from "@/components/molecules/FilterBar";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { taskService } from "@/services/api/taskService";
import { categoryService } from "@/services/api/categoryService";
const TaskList = ({ 
  categoryId = null, 
  onEditTask, 
  onTaskUpdate,
  className = '' 
}) => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    category: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ])
      setTasks(tasksData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId)
      if (!task) return

      const updatedTask = {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      }

      await taskService.update(taskId, updatedTask)
      setTasks(tasks.map(t => t.Id === taskId ? updatedTask : t))
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉')
      } else {
        toast.info('Task marked as pending')
      }
      
      onTaskUpdate?.()
    } catch (err) {
      toast.error('Failed to update task')
      console.error('Error updating task:', err)
    }
  }

  const handleDeleteTask = async (taskId) => {
const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId)
      setTasks(tasks.filter(t => t.Id !== taskId))
      toast.success('Task deleted')
      onTaskUpdate?.()
    } catch (err) {
      toast.error('Failed to delete task')
      console.error('Error deleting task:', err)
    }
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    // Filter by category if specified
    if (categoryId) {
      filtered = filtered.filter(task => task.categoryId === categoryId)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply filters
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    if (filters.status) {
      if (filters.status === 'completed') {
        filtered = filtered.filter(task => task.completed)
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(task => !task.completed)
      }
    }

    if (filters.category) {
      filtered = filtered.filter(task => task.categoryId === filters.category)
    }

    return filtered
  }

  const filteredTasks = getFilteredTasks()
  const pendingTasks = filteredTasks.filter(task => !task.completed)
  const completedTasks = filteredTasks.filter(task => task.completed)

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search tasks..."
          />
        </div>
        <div className="flex-shrink-0">
          <FilterBar
            onFilterChange={setFilters}
            categories={categories}
            currentFilters={filters}
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          description={searchTerm || Object.values(filters).some(f => f) 
            ? "Try adjusting your search or filters"
            : "Create your first task to get started"
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">
                Pending Tasks ({pendingTasks.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {pendingTasks.map((task) => {
                    const category = categories.find(c => c.Id.toString() === task.categoryId)
                    return (
                      <TaskCard
                        key={task.Id}
                        task={task}
                        category={category}
                        onToggleComplete={handleToggleComplete}
                        onEdit={onEditTask}
                        onDelete={handleDeleteTask}
                        className="group"
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">
                Completed Tasks ({completedTasks.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {completedTasks.map((task) => {
                    const category = categories.find(c => c.Id.toString() === task.categoryId)
                    return (
                      <TaskCard
                        key={task.Id}
                        task={task}
                        category={category}
                        onToggleComplete={handleToggleComplete}
                        onEdit={onEditTask}
                        onDelete={handleDeleteTask}
                        className="group"
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskList