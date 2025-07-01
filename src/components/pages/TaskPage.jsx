import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProgressHeader from '@/components/molecules/ProgressHeader'
import QuickAddBar from '@/components/molecules/QuickAddBar'
import CategorySidebar from '@/components/organisms/CategorySidebar'
import TaskList from '@/components/organisms/TaskList'
import TaskModal from '@/components/organisms/TaskModal'
import CategoryModal from '@/components/organisms/CategoryModal'
import { taskService } from '@/services/api/taskService'
import { categoryService } from '@/services/api/categoryService'
import { toast } from 'react-toastify'

const TaskPage = () => {
  const { categoryId } = useParams()
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadData()
  }, [refreshTrigger])

  const loadData = async () => {
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ])
      setTasks(tasksData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      await taskService.create(taskData)
      toast.success('Task created successfully! 🎉')
      triggerRefresh()
    } catch (err) {
      toast.error('Failed to create task')
      console.error('Error creating task:', err)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const handleTaskSaved = () => {
    setEditingTask(null)
    triggerRefresh()
  }

  const handleCategorySaved = () => {
    setEditingCategory(null)
    triggerRefresh()
  }

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const getFilteredTasks = () => {
    return categoryId 
      ? tasks.filter(task => task.categoryId === categoryId)
      : tasks
  }

  const filteredTasks = getFilteredTasks()
  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter(task => task.completed).length
  const todayTasks = filteredTasks.filter(task => {
    const today = new Date()
    const taskDate = new Date(task.createdAt)
    return taskDate.toDateString() === today.toDateString()
  }).length

  const currentCategory = categoryId 
    ? categories.find(cat => cat.Id.toString() === categoryId)
    : null

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ProgressHeader
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          todayTasks={todayTasks}
        />
      </motion.div>

      {/* Quick Add Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      >
        <QuickAddBar
          onAddTask={handleAddTask}
          categories={categories}
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-1"
        >
          <CategorySidebar
            onAddCategory={handleAddCategory}
          />
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 font-display">
                {currentCategory ? currentCategory.name : 'All Tasks'}
              </h2>
              <div className="text-sm text-gray-500 font-body">
                {totalTasks} tasks
              </div>
            </div>

<TaskList
              categoryId={categoryId}
              onEditTask={handleEditTask}
              onTaskUpdate={triggerRefresh}
              refresh={triggerRefresh}
            />
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onTaskSaved={handleTaskSaved}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        onCategorySaved={handleCategorySaved}
      />
    </div>
  )
}

export default TaskPage