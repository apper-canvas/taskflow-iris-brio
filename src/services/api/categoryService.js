import { toast } from 'react-toastify'

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const tableName = 'category'

export const categoryService = {
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
          { field: { Name: "color" } },
          { field: { Name: "task_count" } }
        ],
        orderBy: [
          {
            fieldName: "Id",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 50,
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
      return response.data.map(category => ({
        Id: category.Id,
        name: category.Name || '',
        color: category.color || '#5B47E0',
        taskCount: category.task_count || 0
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
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
          { field: { Name: "color" } },
          { field: { Name: "task_count" } }
        ]
      }
      
      const response = await apperClient.getRecordById(tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error('Category not found')
      }
      
      const category = response.data
      return {
        Id: category.Id,
        name: category.Name || '',
        color: category.color || '#5B47E0',
        taskCount: category.task_count || 0
      }
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error)
      throw error
    }
  },

  async create(categoryData) {
    try {
      // Only include Updateable fields for creation
      const params = {
        records: [
          {
            Name: categoryData.name || '',
            color: categoryData.color || '#5B47E0',
            task_count: 0
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
      
      throw new Error('Failed to create category')
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  },

  async update(id, categoryData) {
    try {
      // Only include Updateable fields for update
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: categoryData.name || '',
            color: categoryData.color || '#5B47E0',
            task_count: categoryData.taskCount || 0
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
      
      throw new Error('Failed to update category')
    } catch (error) {
      console.error("Error updating category:", error)
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
      console.error("Error deleting category:", error)
      throw error
    }
  }
}