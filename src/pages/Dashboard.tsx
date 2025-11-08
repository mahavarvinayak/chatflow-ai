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
  MessageSquare, 
  Package, 
  Settings, 
  Zap 
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.analytics.getDashboardStats);
  const flows = useQuery(api.flows.list);
  const integrations = useQuery(api.integrations.list);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.svg" alt="AutoFlow.AI" className="h-8 w-8" />
            <h1 className="text-xl font-bold tracking-tight">AutoFlow.AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
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
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user?.name || "User"}!
          </h2>
          <p className="text-muted-foreground mb-8">
            Manage your Instagram and WhatsApp automations
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Messages Today
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.messagesUsedToday || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {currentLimit === Infinity ? "unlimited" : currentLimit} limit
                </p>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Flows
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeFlowsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Integrations
                </CardTitle>
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.integrationsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Connected accounts
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.productsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In catalog
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
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/flows")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Create Flow</CardTitle>
              <CardDescription>
                Build automated responses for Instagram and WhatsApp
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/integrations")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Connect Account</CardTitle>
              <CardDescription>
                Link your Instagram or WhatsApp Business account
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/products")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Add Products</CardTitle>
              <CardDescription>
                Upload your product catalog for automated responses
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
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Activity</CardTitle>
                  <CardDescription>Message delivery statistics</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/analytics")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{stats?.todayStats.sentMessages || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sent</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{stats?.todayStats.deliveredMessages || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Delivered</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{stats?.todayStats.failedMessages || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Failed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{stats?.todayStats.flowExecutions || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Executions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
