import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/hooks/useStore';
import { downloadManagerReport, MANAGER_REPORTS } from '@/lib/reportExports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ManagerReportsPage() {
  const store = useStore();

  const handleExport = (reportId: (typeof MANAGER_REPORTS)[number]['id'], title: string) => {
    const file = downloadManagerReport(reportId, store);
    toast.success(`${title} exported as ${file.filename}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MANAGER_REPORTS.map(report => (
          <Card key={report.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{report.period}</span>
                <Button size="sm" variant="outline" onClick={() => handleExport(report.id, report.title)}>
                  <Download className="h-3.5 w-3.5 mr-1" />Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
