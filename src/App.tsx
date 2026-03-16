import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { PLYearData, PLCalculations } from './types';
import { calculatePL, formatCurrency, formatPercent } from './utils/finance';
import { getPLInsights } from './services/geminiService';

const INITIAL_YEAR_DATA: PLYearData = {
  year: new Date().getFullYear(),
  revenue: 100000,
  cogs: 40000,
  operatingExpenses: {
    marketing: 10000,
    salaries: 30000,
    rent: 5000,
    utilities: 1000,
    other: 2000,
  },
  interest: 1000,
  taxRate: 25,
};

export default function App() {
  const [data, setData] = useState<PLYearData[]>([
    { ...INITIAL_YEAR_DATA },
    { ...INITIAL_YEAR_DATA, year: INITIAL_YEAR_DATA.year + 1, revenue: 150000 },
    { ...INITIAL_YEAR_DATA, year: INITIAL_YEAR_DATA.year + 2, revenue: 220000 },
  ]);
  const [insights, setInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');

  const fullData = data.map(yearData => ({
    ...yearData,
    calcs: calculatePL(yearData)
  }));

  const handleUpdateYear = (index: number, field: string, value: any) => {
    const newData = [...data];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (newData[index] as any)[parent][child] = Number(value);
    } else {
      (newData[index] as any)[field] = Number(value);
    }
    setData(newData);
  };

  const addYear = () => {
    const lastYear = data[data.length - 1].year;
    setData([...data, { ...INITIAL_YEAR_DATA, year: lastYear + 1 }]);
  };

  const removeYear = (index: number) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index));
    }
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    const result = await getPLInsights(fullData);
    setInsights(result);
    setIsGeneratingInsights(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">P&L Planner</h1>
          <p className="text-gray-500 mt-1">Professional financial projections for your business plan.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'table' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Data Entry
          </button>
          <button 
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'charts' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Visual Analysis
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'table' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-bottom border-black/5 bg-gray-50/50">
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400 w-48">Category</th>
                      {fullData.map((year, idx) => (
                        <th key={idx} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-lg">FY {year.year}</span>
                            <button onClick={() => removeYear(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="p-4 w-12">
                        <button onClick={addYear} className="p-2 bg-black text-white rounded-full hover:scale-110 transition-transform">
                          <Plus size={16} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {/* Revenue Section */}
                    <tr className="bg-emerald-50/30">
                      <td className="p-4 font-semibold text-emerald-700">Revenue</td>
                      {data.map((year, idx) => (
                        <td key={idx} className="p-2">
                          <input 
                            type="number" 
                            value={year.revenue} 
                            onChange={(e) => handleUpdateYear(idx, 'revenue', e.target.value)}
                            className="input-field text-center font-medium"
                          />
                        </td>
                      ))}
                      <td></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600 pl-8">COGS</td>
                      {data.map((year, idx) => (
                        <td key={idx} className="p-2">
                          <input 
                            type="number" 
                            value={year.cogs} 
                            onChange={(e) => handleUpdateYear(idx, 'cogs', e.target.value)}
                            className="input-field text-center"
                          />
                        </td>
                      ))}
                      <td></td>
                    </tr>
                    <tr className="bg-gray-50/80 font-bold">
                      <td className="p-4">Gross Profit</td>
                      {fullData.map((year, idx) => (
                        <td key={idx} className="p-4 text-center text-emerald-600">
                          {formatCurrency(year.calcs.grossProfit)}
                        </td>
                      ))}
                      <td></td>
                    </tr>

                    {/* Expenses Section */}
                    <tr>
                      <td colSpan={data.length + 2} className="p-4 bg-gray-100/50 text-xs font-bold uppercase tracking-widest text-gray-400">Operating Expenses</td>
                    </tr>
                    {['marketing', 'salaries', 'rent', 'utilities', 'other'].map((exp) => (
                      <tr key={exp}>
                        <td className="p-4 text-gray-600 pl-8 capitalize">{exp}</td>
                        {data.map((year, idx) => (
                          <td key={idx} className="p-2">
                            <input 
                              type="number" 
                              value={(year.operatingExpenses as any)[exp]} 
                              onChange={(e) => handleUpdateYear(idx, `operatingExpenses.${exp}`, e.target.value)}
                              className="input-field text-center"
                            />
                          </td>
                        ))}
                        <td></td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/80 font-bold">
                      <td className="p-4">EBITDA</td>
                      {fullData.map((year, idx) => (
                        <td key={idx} className="p-4 text-center">
                          {formatCurrency(year.calcs.ebitda)}
                        </td>
                      ))}
                      <td></td>
                    </tr>

                    {/* Bottom Line Section */}
                    <tr>
                      <td className="p-4 text-gray-600 pl-8">Interest</td>
                      {data.map((year, idx) => (
                        <td key={idx} className="p-2">
                          <input 
                            type="number" 
                            value={year.interest} 
                            onChange={(e) => handleUpdateYear(idx, 'interest', e.target.value)}
                            className="input-field text-center"
                          />
                        </td>
                      ))}
                      <td></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600 pl-8">Tax Rate (%)</td>
                      {data.map((year, idx) => (
                        <td key={idx} className="p-2">
                          <input 
                            type="number" 
                            value={year.taxRate} 
                            onChange={(e) => handleUpdateYear(idx, 'taxRate', e.target.value)}
                            className="input-field text-center"
                          />
                        </td>
                      ))}
                      <td></td>
                    </tr>
                    <tr className="bg-black text-white font-bold">
                      <td className="p-4 rounded-bl-2xl">Net Income</td>
                      {fullData.map((year, idx) => (
                        <td key={idx} className="p-4 text-center">
                          {formatCurrency(year.calcs.netIncome)}
                        </td>
                      ))}
                      <td className="rounded-br-2xl"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 h-[400px]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                    <TrendingUp size={16} /> Revenue vs Net Income
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fullData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" />
                      <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="calcs.netIncome" name="Net Income" fill="#000000" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card p-6 h-[400px]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                    <PieChart size={16} /> Margin Trends
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fullData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} unit="%" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" />
                      <Line type="monotone" dataKey="calcs.grossMargin" name="Gross Margin" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                      <Line type="monotone" dataKey="calcs.netMargin" name="Net Margin" stroke="#000000" strokeWidth={3} dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 h-[400px]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                  <BarChart3 size={16} /> Expense Breakdown
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fullData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" />
                    <Area type="monotone" dataKey="operatingExpenses.marketing" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="operatingExpenses.salaries" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="operatingExpenses.rent" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="operatingExpenses.utilities" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="operatingExpenses.other" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar / Insights Area */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} /> AI Insights
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Get an automated analysis of your financial projections using Gemini.
            </p>
            
            <button 
              onClick={generateInsights}
              disabled={isGeneratingInsights}
              className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {isGeneratingInsights ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Analysis
                </>
              )}
            </button>

            <AnimatePresence mode="wait">
              {insights && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-black/5"
                >
                  <div className="prose prose-sm text-gray-600">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {insights}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-card p-6 bg-black text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Summary (Final Year)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Projected Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(fullData[fullData.length - 1].revenue)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Net Margin</p>
                  <p className="text-lg font-semibold text-emerald-400">{formatPercent(fullData[fullData.length - 1].calcs.netMargin)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Gross Margin</p>
                  <p className="text-lg font-semibold text-emerald-400">{formatPercent(fullData[fullData.length - 1].calcs.grossMargin)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Aim for a gross margin above 40% for most SaaS businesses.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                Marketing spend should typically be 10-20% of revenue in growth stages.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                Ensure your salaries projection accounts for future hires.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
