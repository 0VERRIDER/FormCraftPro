import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WebhookLog } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FormWebhooksProps {
  formId: string;
}

export function FormWebhooks({ formId }: FormWebhooksProps) {
  const { data: webhookLogs, isLoading, isError, refetch } = useQuery({
    queryKey: [`/api/forms/${formId}/webhook-logs`],
  });
  
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const { toast } = useToast();

  const retryMutation = useMutation({
    mutationFn: async (submissionId: number) => {
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

  const handleRetry = (submissionId: number) => {
    retryMutation.mutate(submissionId);
  };

  const getStatusBadge = (successful: boolean) => {
    return successful 
      ? <Badge className="bg-green-100 text-green-800">Success</Badge>
      : <Badge className="bg-red-100 text-red-800">Failed</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-red-600">Error Loading Webhook Logs</h3>
            <p className="mt-1 text-gray-500">There was an error loading the webhook logs. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Webhook Delivery Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {webhookLogs?.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-plug text-4xl text-gray-300 mb-3"></i>
              <h3 className="text-lg font-medium text-gray-900">No webhook logs yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Webhook logs will appear here once submissions are received and dispatched.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs?.map((log: WebhookLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">SUB-{log.submissionId}</TableCell>
                      <TableCell>
                        {log.createdAt ? format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                      </TableCell>
                      <TableCell>{log.responseStatus || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(log.successful)}</TableCell>
                      <TableCell>{log.attemptNumber}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="link" 
                          onClick={() => setSelectedLog(log)}
                          className="mr-2"
                        >
                          View Details
                        </Button>
                        {!log.successful && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(log.submissionId)}
                            disabled={retryMutation.isPending}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Log Details Dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook Log Details</DialogTitle>
            <DialogDescription>
              Submission ID: SUB-{selectedLog?.submissionId} | Attempt: {selectedLog?.attemptNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Request URL</h4>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono break-all">
                {selectedLog?.requestUrl}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Request Headers</h4>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                <pre className="whitespace-pre-wrap">
                  {selectedLog?.requestHeaders 
                    ? JSON.stringify(selectedLog.requestHeaders, null, 2) 
                    : 'No headers'}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Request Body</h4>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono max-h-40 overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {selectedLog?.requestBody 
                    ? JSON.stringify(selectedLog.requestBody, null, 2) 
                    : 'No body'}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Response Status</h4>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {selectedLog?.responseStatus || 'N/A'} 
                {selectedLog?.successful 
                  ? <span className="ml-2 text-green-600">Success</span>
                  : <span className="ml-2 text-red-600">Failed</span>
                }
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Response Body</h4>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono max-h-40 overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {selectedLog?.responseBody || 'No response body'}
                </pre>
              </div>
            </div>
            
            <div className="text-right">
              {selectedLog && !selectedLog.successful && (
                <Button 
                  variant="default"
                  onClick={() => handleRetry(selectedLog.submissionId)}
                  disabled={retryMutation.isPending}
                >
                  Retry Webhook
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
