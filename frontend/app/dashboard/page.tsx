"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authAPI, milestoneAPI, taskAPI } from "@/lib/api"
import { UserIcon, ListTodo, CalendarIcon, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// 任务状态类型
type TaskStatus = "待处理" | "进行中" | "已完成" | "已延期"
// 任务紧急程度类型
type TaskUrgency = "低" | "中" | "高" | "紧急"
// 任务类型
type Task = {
  id: number
  name: string
  deadline: string
  status: TaskStatus
  urgency: TaskUrgency
  assignee: string
}
// 里程碑类型
type Milestone = {
  id: number
  title: string
  date: string
  description: string
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    milestones: 0
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [taskStats, setTaskStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // 并行获取所有数据
        const [tasksData, milestonesData, currentUser] = await Promise.all([
          taskAPI.getAll(),
          milestoneAPI.getAll(),
          authAPI.getCurrentUser()
        ])
        
        // 格式化任务数据
        const formattedTasks = Array.isArray(tasksData) ? tasksData.map((task: any) => ({
          ...task,
          deadline: new Date(task.deadline).toISOString().split('T')[0]
        })) : []
        
        // 格式化里程碑数据
        const formattedMilestones = Array.isArray(milestonesData) ? milestonesData.map((milestone: any) => ({
          ...milestone,
          date: new Date(milestone.date).toISOString().split('T')[0]
        })) : []
        
        // 设置数据
        setTasks(formattedTasks)
        setMilestones(formattedMilestones)
        
        // 计算任务状态统计
        const taskStatusCounts = countTasksByStatus(formattedTasks)
        setTaskStats(taskStatusCounts)
        
        // 设置统计信息
        setStats({
          users: currentUser?.organization_users || 1, // 如果有组织用户数就使用，否则至少有当前用户
          tasks: formattedTasks.length,
          milestones: formattedMilestones.length
        })
      } catch (error) {
        console.error("获取统计信息失败", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // 计算任务状态统计
  const countTasksByStatus = (taskList: Task[]) => {
    return {
      pending: taskList.filter(task => task.status === "待处理").length,
      inProgress: taskList.filter(task => task.status === "进行中").length,
      completed: taskList.filter(task => task.status === "已完成").length,
      delayed: taskList.filter(task => task.status === "已延期").length
    }
  }

  // 获取项目完成率
  const getCompletionRate = () => {
    if (tasks.length === 0) return 0
    return Math.round((taskStats.completed / tasks.length) * 100)
  }

  // 获取近期的里程碑（包括最近过去的和未来的，总共最近的6个）
  const getRecentMilestones = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 按日期排序所有里程碑
    const sortedMilestones = [...milestones].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const todayTime = today.getTime();
      
      // 计算与今天的时间差的绝对值
      const diffA = Math.abs(dateA - todayTime);
      const diffB = Math.abs(dateB - todayTime);
      
      return diffA - diffB; // 按与当前日期的接近程度排序
    });
    
    return sortedMilestones.slice(0, 6); // 取最近的6个
  }

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  // 计算里程碑日期与今天的天数差
  const getDaysFromToday = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const milestoneDate = new Date(dateString)
    const diffTime = milestoneDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "今天"
    if (diffDays === 1) return "明天"
    return `${diffDays}天后`
  }

  const StatCard = ({ title, value, description, icon: Icon }: { 
    title: string, 
    value: number, 
    description: string,
    icon: any
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "加载中..." : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  // 获取状态徽章的样式
  const getStatusColor = (status: string) => {
    switch(status) {
      case "待处理": return "bg-blue-100 text-blue-800"
      case "进行中": return "bg-yellow-100 text-yellow-800"
      case "已完成": return "bg-green-100 text-green-800"
      case "已延期": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const recentMilestones = getRecentMilestones()
  const completionRate = getCompletionRate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">项目概览</h1>
        <p className="text-muted-foreground">
          查看当前项目的统计信息和总体进度
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="注册用户" 
          value={stats.users} 
          description="系统中注册的用户总数" 
          icon={UserIcon} 
        />
        <StatCard 
          title="项目任务" 
          value={stats.tasks} 
          description="创建的任务总数" 
          icon={ListTodo} 
        />
        <StatCard 
          title="项目里程碑" 
          value={stats.milestones} 
          description="设置的项目里程碑总数" 
          icon={CalendarIcon} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>项目状态</CardTitle>
            <CardDescription>
              项目总体完成情况和进度
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <p>加载中...</p>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">完成进度</span>
                    <span className="text-sm font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">任务状态分布</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                      <Badge className={getStatusColor("待处理")}>待处理</Badge>
                      <span className="font-medium">{taskStats.pending}个</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                      <Badge className={getStatusColor("进行中")}>进行中</Badge>
                      <span className="font-medium">{taskStats.inProgress}个</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                      <Badge className={getStatusColor("已完成")}>已完成</Badge>
                      <span className="font-medium">{taskStats.completed}个</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                      <Badge className={getStatusColor("已延期")}>已延期</Badge>
                      <span className="font-medium">{taskStats.delayed}个</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                暂无任务数据
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>近期的里程碑</CardTitle>
            <CardDescription>
              项目近期的重要时间点
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <p>加载中...</p>
              </div>
            ) : recentMilestones.length > 0 ? (
              <div className="space-y-4">
                {recentMilestones.map(milestone => (
                  <div key={milestone.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge variant="outline" className={new Date(milestone.date) < today ? "bg-gray-100" : "ml-2"}>
                        {new Date(milestone.date) < today ? "已过期" : getDaysFromToday(milestone.date)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(milestone.date)}
                    </p>
                    {milestone.description && (
                      <p className="text-sm mt-2 line-clamp-2">{milestone.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                {stats.milestones > 0 ? "暂无里程碑数据" : "暂无里程碑数据"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

