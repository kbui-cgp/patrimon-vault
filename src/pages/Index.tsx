import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus
} from "lucide-react";

const Index = () => {
  const recentClients = [
    { name: "Marie Dubois", status: "En cours", lastAction: "DER en attente", priority: "high" },
    { name: "Jean Martin", status: "Validé", lastAction: "Convention signée", priority: "low" },
    { name: "Sophie Laurent", status: "À réviser", lastAction: "RTO incomplet", priority: "medium" },
    { name: "Pierre Durand", status: "En cours", lastAction: "Lettre de mission", priority: "high" },
  ];

  const complianceAlerts = [
    { type: "DER", client: "Marie Dubois", deadline: "2 jours", severity: "high" },
    { type: "RTO", client: "Sophie Laurent", deadline: "5 jours", severity: "medium" },
    { type: "Convention", client: "Luc Bernard", deadline: "1 semaine", severity: "low" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de vos dossiers et conformité réglementaire
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-professional">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Dossier
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Dossiers Actifs"
            value="247"
            icon={Users}
            description="Clients en portefeuille"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Documents Générés"
            value="1,284"
            icon={FileText}
            description="Ce mois-ci"
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Conformité"
            value="94%"
            icon={Shield}
            description="Taux de validation"
            variant="success"
            trend={{ value: 3, isPositive: true }}
          />
          <MetricCard
            title="Alertes"
            value="7"
            icon={AlertTriangle}
            description="À traiter"
            variant="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <Card className="shadow-card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Dossiers Récents
              </CardTitle>
              <CardDescription>
                Dernières activités sur vos dossiers clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{client.name}</span>
                        <Badge variant={
                          client.status === "Validé" ? "default" :
                          client.status === "À réviser" ? "destructive" : "secondary"
                        }>
                          {client.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{client.lastAction}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {client.priority === "high" && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      {client.status === "Validé" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Alerts */}
          <Card className="shadow-card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Alertes Conformité
              </CardTitle>
              <CardDescription>
                Documents nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border-l-4 border-l-primary bg-primary/5 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.type}</span>
                        <Badge variant="outline">{alert.client}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Échéance dans {alert.deadline}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {alert.severity === "high" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : alert.severity === "medium" ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-success" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card-professional bg-gradient-subtle">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                Générer DER
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Shield className="h-6 w-6" />
                Audit Conformité
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Nouveau Client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
