import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Submission } from "@shared/schema";
import { format } from "date-fns";
import { SubmissionViewer } from "@/components/submission-viewer";

interface FormSubmissionsProps {
  formId: string;
}

export function FormSubmissions({ formId }: FormSubmissionsProps) {
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: submissions, isLoading, isError } = useQuery({
    queryKey: [`/api/forms/${formId}/submissions`],
  });

  const filteredSubmissions = submissions 
    ? submissions.filter((sub: Submission) => {
        if (!searchQuery) return true;
        // Convert data to string and check if it contains the search query
        const dataStr = JSON.stringify(sub.data).toLowerCase();
        return dataStr.includes(searchQuery.toLowerCase());
      })
    : [];

  const pageSize = 10;
  const totalPages = Math.ceil((filteredSubmissions?.length || 0) / pageSize);
  const paginatedSubmissions = filteredSubmissions
    ? filteredSubmissions.slice((page - 1) * pageSize, page * pageSize)
    : [];

  const handleExport = (format: 'csv' | 'json') => {
    if (!submissions) return;
    
    let data: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'json') {
      data = JSON.stringify(submissions, null, 2);
      filename = `form-${formId}-submissions.json`;
      mimeType = 'application/json';
    } else {
      // Convert to CSV
      const keys = new Set<string>();
      submissions.forEach((submission: Submission) => {
        Object.keys(submission.data).forEach(key => keys.add(key));
      });
      
      const headers = Array.from(keys);
      const csvRows = [
        ['ID', 'Date', ...headers].join(',')
      ];
      
      submissions.forEach((submission: Submission) => {
        const values = headers.map(header => {
          const value = submission.data[header] || '';
          // Escape quotes and wrap in quotes if needed
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        });
        
        csvRows.push([
          submission.id.toString(),
          new Date(submission.createdAt).toISOString(),
          ...values
        ].join(','));
      });
      
      data = csvRows.join('\n');
      filename = `form-${formId}-submissions.csv`;
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
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
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-red-600">Error Loading Submissions</h3>
            <p className="mt-1 text-gray-500">There was an error loading the submissions. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle>Form Submissions</CardTitle>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search submissions..."
                className="pl-8 w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <div className="relative" x-data="{ open: false }">
              <Button variant="outline" className="relative">
                <i className="fas fa-download mr-2"></i> Export <i className="fas fa-chevron-down ml-1"></i>
                <select 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full" 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleExport(e.target.value as 'csv' | 'json');
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Select format</option>
                  <option value="csv">Export as CSV</option>
                  <option value="json">Export as JSON</option>
                </select>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
              <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Submissions will appear here once users fill out your form.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission ID</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Webhook Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission: Submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">SUB-{submission.id}</TableCell>
                        <TableCell>
                          {submission.createdAt ? format(new Date(submission.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell>{submission.ipAddress || 'Unknown'}</TableCell>
                        <TableCell>{getStatusBadge(submission.webhookStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="link" 
                            onClick={() => setSelectedSubmission(submission.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = page;
                      if (page > 2) {
                        pageNum = Math.min(page - 2 + i + 1, totalPages);
                      } else {
                        pageNum = i + 1;
                      }
                      
                      if (pageNum <= totalPages) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={page === pageNum}
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                        disabled={page === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {selectedSubmission !== null && (
        <SubmissionViewer 
          submissionId={selectedSubmission} 
          formId={parseInt(formId)}
          onClose={() => setSelectedSubmission(null)} 
        />
      )}
    </>
  );
}
