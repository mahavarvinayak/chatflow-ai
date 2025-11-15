import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { 
  Activity, 
  BarChart3, 
  Bot, 
  Instagram, 
  Loader2, 
  LogOut,
  MessageSquare, 
  Settings, 
  User,
  Zap 
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.analytics.getDashboardStats);
  const flows = useQuery(api.flows.list);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const planLimits = {
    free: 100,
    starter: 600,
    pro: 1500,
    enterprise: Infinity,
  };

  const currentLimit = planLimits[stats?.planType as keyof typeof planLimits] || 100;
  const usagePercentage = currentLimit === Infinity 
    ? 0 
    : ((stats?.messagesUsedToday || 0) / currentLimit) * 100;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Optimized 3D Animated gradient orbs with depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform" style={{ perspective: '1000px' }}>
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 100%)',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full blur-3xl will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.15) 50%, transparent 100%)',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, rgba(71, 85, 105, 0.18) 50%, transparent 100%)',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            x: [0, -60, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-slate-200/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-blue-50/40 to-white/60 backdrop-blur-xl" />
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <Logo size="md" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AutoFlow.AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">
            Welcome back, {user?.name || "User"}!
          </h2>
          <p className="text-slate-600 mb-8">
            Manage your Instagram and WhatsApp automations
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-100">
                  Messages Today
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-slate-100" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">{stats?.messagesUsedToday || 0}</div>
                <p className="text-xs text-slate-200 mt-1">
                  of {currentLimit === Infinity ? "unlimited" : currentLimit} limit
                </p>
                <div className="w-full bg-slate-600/40 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-blue-100">
                  Active Flows
                </CardTitle>
                <Zap className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">{stats?.activeFlowsCount || 0}</div>
                <p className="text-xs text-blue-100 mt-1">
                  {flows?.length || 0} total flows
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-amber-600 to-amber-700 text-white border-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-amber-100">
                  Integrations
                </CardTitle>
                <Instagram className="h-4 w-4 text-amber-100" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">{stats?.integrationsCount || 0}</div>
                <p className="text-xs text-amber-100 mt-1">
                  Connected accounts
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <Card className="shadow-xl hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-md border border-slate-200/50 hover:border-blue-300/50 relative overflow-hidden group" onClick={() => navigate("/flows")}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-4 shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900">Create Flow</CardTitle>
              <CardDescription>
                Build automated responses for Instagram and WhatsApp
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-md border border-slate-200/50 hover:border-blue-300/50 relative overflow-hidden group" onClick={() => navigate("/integrations")}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-slate-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-4 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900">Connect Account</CardTitle>
              <CardDescription>
                Link your Instagram or WhatsApp Business account
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-xl bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-md border border-slate-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-slate-400/5" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Today's Activity</CardTitle>
                  <CardDescription>Message delivery statistics</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-2 border-slate-300 hover:bg-slate-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-white/50 border border-slate-200/50 shadow-sm">
                  <div className="text-2xl font-bold text-green-700">{stats?.todayStats.sentMessages || 0}</div>
                  <div className="text-xs text-green-600 mt-1">Sent</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/50 border border-slate-200/50 shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">{stats?.todayStats.deliveredMessages || 0}</div>
                  <div className="text-xs text-blue-600 mt-1">Delivered</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/50 border border-slate-200/50 shadow-sm">
                  <div className="text-2xl font-bold text-red-700">{stats?.todayStats.failedMessages || 0}</div>
                  <div className="text-xs text-red-600 mt-1">Failed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/50 border border-slate-200/50 shadow-sm">
                  <div className="text-2xl font-bold text-purple-700">{stats?.todayStats.flowExecutions || 0}</div>
                  <div className="text-xs text-purple-600 mt-1">Executions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}