import { toast } from 'react-toastify'

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const tableName = 'task'

export const taskService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category_id" } },
          { field: { Name: "priority" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } },
          { field: { Name: "completed_at" } }
        ],
        orderBy: [
          {
            fieldName: "Id",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      }
      
      const response = await apperClient.fetchRecords(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      // Handle empty or non-existent data
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      // Map database fields to UI format
      return response.data.map(task => ({
        Id: task.Id,
        title: task.title || '',
        description: task.description || '',
        categoryId: task.category_id?.toString() || '',
        priority: task.priority || 'medium',
        dueDate: task.due_date || null,
        completed: task.completed === 'true' || task.completed === true,
        createdAt: task.created_at || task.CreatedOn,
        completedAt: task.completed_at || null
      }))
    } catch (error) {
      console.error("Error fetching tasks:", error)
      return []
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category_id" } },
          { field: { Name: "priority" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "created_at" } },
          { field: { Name: "completed_at" } }
        ]
      }
      
      const response = await apperClient.getRecordById(tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error('Task not found')
      }
      
      const task = response.data
      return {
        Id: task.Id,
        title: task.title || '',
        description: task.description || '',
        categoryId: task.category_id?.toString() || '',
        priority: task.priority || 'medium',
        dueDate: task.due_date || null,
        completed: task.completed === 'true' || task.completed === true,
        createdAt: task.created_at || task.CreatedOn,
        completedAt: task.completed_at || null
      }
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error)
      throw error
    }
  },

  async create(taskData) {
    try {
      // Only include Updateable fields for creation
      const params = {
        records: [
          {
            Name: taskData.title || '',
            title: taskData.title || '',
            description: taskData.description || '',
            category_id: parseInt(taskData.categoryId),
            priority: taskData.priority || 'medium',
            due_date: taskData.dueDate || null,
            completed: taskData.completed ? 'true' : 'false',
            created_at: new Date().toISOString(),
            completed_at: taskData.completed ? new Date().toISOString() : null
          }
        ]
      }
      
      const response = await apperClient.createRecord(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data
        }
      }
      
      throw new Error('Failed to create task')
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  },

  async update(id, taskData) {
    try {
      // Only include Updateable fields for update
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: taskData.title || '',
            title: taskData.title || '',
            description: taskData.description || '',
            category_id: parseInt(taskData.categoryId),
            priority: taskData.priority || 'medium',
            due_date: taskData.dueDate || null,
            completed: taskData.completed ? 'true' : 'false',
            completed_at: taskData.completed ? (taskData.completedAt || new Date().toISOString()) : null
          }
        ]
      }
      
      const response = await apperClient.updateRecord(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data
        }
      }
      
      throw new Error('Failed to update task')
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }
}