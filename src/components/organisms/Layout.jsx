import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AuthContext } from '@/App'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { motion } from 'framer-motion'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}

export default Layout