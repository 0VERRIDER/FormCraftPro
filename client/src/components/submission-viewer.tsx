import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Submission, WebhookLog } from "@shared/schema";

interface SubmissionViewerProps {
  submissionId: number;
  formId: number;
  onClose: () => void;
}

export function SubmissionViewer({ submissionId, formId, onClose }: SubmissionViewerProps) {
  const [activeTab, setActiveTab] = useState("data");
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`/api/submissions/${submissionId}`],
  });
  
  const submission: Submission | undefined = data?.submission;
  const webhookLogs: WebhookLog[] | undefined = data?.webhookLogs;
  
  const retryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/submissions/${submissionId}/retry-webhook`, {});
    },
    onSuccess: () => {
      toast({
        title: "Webhook retry initiated",
        description: "The webhook will be retried shortly",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Webhook retry failed",
        description: "There was an error retrying the webhook",
        variant: "destructive",
      });
    },
  });

  const handleRetryWebhook = () => {
    retryMutation.mutate();
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'retrying':
        return <Badge className="bg-yellow-100 text-yellow-800">Retrying</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  const downloadData = (format: 'json' | 'csv') => {
    if (!submission) return;
    
    let data: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'json') {
      data = JSON.stringify(submission.data, null, 2);
      filename = `submission-${submissionId}.json`;
      mimeType = 'application/json';
    } else {
      // Convert to CSV
      const headers = Object.keys(submission.data);
      const csvRows = [headers.join(',')];
      
      const values = headers.map(header => {
        const value = submission.data[header] || '';
        // Escape quotes and wrap in quotes if needed
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      });
      
      csvRows.push(values.join(','));
      
      data = csvRows.join('\n');
      filename = `submission-${submissionId}.csv`;
      mimeType = 'text/csv';
    }
    
    // Create and download the file
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogDescription>
            Submission ID: SUB-{submissionId} | 
            {submission?.createdAt ? ` Submitted: ${format(new Date(submission.createdAt), 'yyyy-MM-dd HH:mm')}` : ''}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="data">Form Data</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Status</TabsTrigger>
          </TabsList>
          
          {/* Form Data Tab */}
          <TabsContent value="data" className="pt-4">
            {isLoading ? (
              <div className="text-center py-6">Loading submission data...</div>
            ) : !submission ? (
              <div className="text-center py-6 text-red-600">Error loading submission data</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submission ID</h4>
                    <p>SUB-{submission.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submission Date</h4>
                    <p>{submission.createdAt ? format(new Date(submission.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">IP Address</h4>
                    <p>{submission.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Webhook Status</h4>
                    <p>{getStatusBadge(submission.webhookStatus)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium mb-4">Form Responses</h3>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Field
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <tr key={key}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {key}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 break-all">
                              {typeof value === 'boolean' 
                                ? value ? 'Yes' : 'No'
                                : typeof value === 'object' 
                                  ? JSON.stringify(value)
                                  : String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Webhook Tab */}
          <TabsContent value="webhook" className="pt-4">
            {isLoading ? (
              <div className="text-center py-6">Loading webhook data...</div>
            ) : !submission ? (
              <div className="text-center py-6 text-red-600">Error loading webhook data</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Webhook Status</h4>
                    <p>{getStatusBadge(submission.webhookStatus)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Webhook Attempts</h4>
                    <p>{submission.webhookAttempts || 0}</p>
                  </div>
                </div>
                
                {submission.webhookResponse && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Latest Response</h4>
                    <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                      {submission.webhookResponse}
                    </div>
                  </div>
                )}
                
                {webhookLogs && webhookLogs.length > 0 ? (
                  <>
                    <h3 className="font-medium mb-2">Webhook Attempts</h3>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attempt
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Response
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {webhookLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {log.attemptNumber}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {log.createdAt ? format(new Date(log.createdAt), 'HH:mm:ss') : 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {log.successful 
                                  ? <span className="text-green-600">Success</span> 
                                  : <span className="text-red-600">Failed</span>}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {log.responseStatus || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No webhook logs available
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              <Button
                variant="outline"
                onClick={() => downloadData('json')}
                className="mr-2"
              >
                <i className="fas fa-download mr-2"></i> JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadData('csv')}
              >
                <i className="fas fa-download mr-2"></i> CSV
              </Button>
            </div>
            <div>
              {submission?.webhookStatus === 'failed' && (
                <Button
                  onClick={handleRetryWebhook}
                  disabled={retryMutation.isPending}
                  className="mr-2"
                >
                  <i className="fas fa-sync-alt mr-2"></i> Retry Webhook
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
