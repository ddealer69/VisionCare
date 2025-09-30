import { useEffect, useState } from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useSession } from '../contexts/SessionContext'

interface ChartDataPoint {
  time: string
  bpm: number
  totalBlinks: number
  timestamp: number
}

const BlinkChart = () => {
  const { isSessionActive } = useSession()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // Generate mock data for demonstration
  useEffect(() => {
    if (!isSessionActive) {
      setChartData([])
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        minute: '2-digit', 
        second: '2-digit' 
      })

      setChartData(prev => {
        const newPoint: ChartDataPoint = {
          time: timeString,
          bpm: Math.floor(12 + Math.random() * 8), // 12-20 BPM
          totalBlinks: prev.length > 0 ? prev[prev.length - 1].totalBlinks + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5),
          timestamp: now.getTime()
        }

        const updated = [...prev, newPoint]
        
        // Keep only last 20 data points for better visualization
        if (updated.length > 20) {
          return updated.slice(-20)
        }
        
        return updated
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [isSessionActive])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-medium">{`Time: ${label}`}</p>
          <p className="text-blue-300">
            {`BPM: ${payload[0].value}`}
          </p>
          <p className="text-green-300">
            {`Total Blinks: ${payload[1]?.value || 'N/A'}`}
          </p>
        </div>
      )
    }
    return null
  }

  if (!isSessionActive) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-300">Start a session to view blink rate chart</p>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-300">Collecting data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="blinksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          
          <XAxis 
            dataKey="time" 
            stroke="#ffffff80"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            yAxisId="bpm"
            orientation="left"
            stroke="#3b82f6"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 30]}
          />
          
          <YAxis 
            yAxisId="blinks"
            orientation="right"
            stroke="#10b981"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            yAxisId="bpm"
            type="monotone"
            dataKey="bpm"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#bpmGradient)"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
          />
          
          <Line
            yAxisId="blinks"
            type="monotone"
            dataKey="totalBlinks"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Chart Legend */}
      <div className="flex justify-center mt-2 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-blue-300 text-sm">BPM (Blinks per Minute)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-300 text-sm">Total Blinks</span>
        </div>
      </div>
    </div>
  )
}

export default BlinkChart