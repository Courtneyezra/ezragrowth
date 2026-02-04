import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, Send, Check, Clock } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  totalAmount: number;
  balanceDue: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

export default function InvoicesPage() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  const sendInvoice = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/invoices/${id}/send`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const markPaid = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/invoices/${id}/pay`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">Draft</span>;
      case "sent":
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Sent</span>;
      case "paid":
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Paid</span>;
      case "overdue":
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Overdue</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Invoice #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Balance Due</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {invoices?.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-yellow-500 font-mono">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-white">{invoice.customerName}</p>
                    {invoice.customerEmail && (
                      <p className="text-gray-400 text-sm">{invoice.customerEmail}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    £{(invoice.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    £{(invoice.balanceDue / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {invoice.status === "draft" && (
                      <button
                        onClick={() => sendInvoice.mutate(invoice.id)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                        title="Send Invoice"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {invoice.status === "sent" && (
                      <button
                        onClick={() => markPaid.mutate(invoice.id)}
                        className="text-green-400 hover:text-green-300"
                        title="Mark as Paid"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!invoices || invoices.length === 0) && (
            <div className="p-8 text-center text-gray-400">
              No invoices created yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
