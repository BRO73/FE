import { useState } from "react";
import { Search, Calendar, DollarSign, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  amount: number;
  table: string;
  date: string;
  time: string;
  paymentMethod: "cash" | "card" | "mobile" | "online";
  status: "completed" | "pending" | "refunded" | "failed";
  orderItems: string[];
  customerName?: string;
  tip?: number;
}

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock data
  const [transactions] = useState<Transaction[]>([
    { id: "TXN-001", amount: 67.50, table: "T03", date: "2024-03-15", time: "19:30", paymentMethod: "card", status: "completed", orderItems: ["Grilled Salmon", "Caesar Salad", "Wine"], customerName: "Alice Johnson", tip: 10.00 },
    { id: "TXN-002", amount: 45.25, table: "T01", date: "2024-03-15", time: "18:45", paymentMethod: "cash", status: "completed", orderItems: ["Fish & Chips", "Beer"], tip: 7.00 },
    { id: "TXN-003", amount: 125.80, table: "T05", date: "2024-03-15", time: "20:15", paymentMethod: "mobile", status: "completed", orderItems: ["Truffle Pasta", "Chocolate Cake", "Wine x2"], customerName: "Bob Smith", tip: 20.00 },
    { id: "TXN-004", amount: 89.99, table: "T02", date: "2024-03-15", time: "19:00", paymentMethod: "card", status: "pending", orderItems: ["Steak", "Side Salad", "Cocktail"] },
    { id: "TXN-005", amount: 34.75, table: "T04", date: "2024-03-14", time: "18:30", paymentMethod: "online", status: "refunded", orderItems: ["Burger", "Fries"], customerName: "Carol Davis" },
    { id: "TXN-006", amount: 156.50, table: "T06", date: "2024-03-14", time: "20:45", paymentMethod: "card", status: "completed", orderItems: ["Special Menu x2", "Dessert x2", "Wine"], tip: 25.00 },
    { id: "TXN-007", amount: 78.25, table: "T07", date: "2024-03-14", time: "19:15", paymentMethod: "cash", status: "failed", orderItems: ["Pasta", "Salad", "Juice"] },
    { id: "TXN-008", amount: 92.00, table: "T08", date: "2024-03-13", time: "18:00", paymentMethod: "mobile", status: "completed", orderItems: ["Seafood Platter", "White Wine"], customerName: "David Miller", tip: 15.00 },
  ]);

  const paymentMethods = ["all", "cash", "card", "mobile", "online"];
  const availableStatuses = ["all", "completed", "pending", "refunded", "failed"];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.orderItems.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPaymentMethod = selectedPaymentMethod === "all" || transaction.paymentMethod === selectedPaymentMethod;
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus;
    return matchesSearch && matchesPaymentMethod && matchesStatus;
  });

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "refunded": return "bg-muted text-muted-foreground";
      case "failed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentMethodColor = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "cash": return "bg-emerald-500 text-white";
      case "card": return "bg-blue-500 text-white";
      case "mobile": return "bg-purple-500 text-white";
      case "online": return "bg-orange-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTotalRevenue = () => {
    return filteredTransactions
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + t.amount + (t.tip || 0), 0);
  };

  const getTotalTips = () => {
    return filteredTransactions
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + (t.tip || 0), 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze all payment transactions and order history.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${getTotalRevenue().toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tips</p>
              <p className="text-2xl font-bold text-foreground">${getTotalTips().toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {filteredTransactions.filter(t => t.status === "completed").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
              <p className="text-2xl font-bold text-foreground">
                ${filteredTransactions.length > 0 ? (getTotalRevenue() / filteredTransactions.filter(t => t.status === "completed").length).toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID, table, customer, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="form-input text-sm"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method === "all" ? "All Payment Methods" : method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input text-sm"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="desktop-table">
        <div className="table-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Transactions ({filteredTransactions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Transaction</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Table</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Payment</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="table-row">
                  <td>
                    <div>
                      <div className="font-medium text-foreground">{transaction.id}</div>
                      {transaction.customerName && (
                        <div className="text-sm text-muted-foreground">{transaction.customerName}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {transaction.orderItems.slice(0, 2).join(", ")}
                        {transaction.orderItems.length > 2 && " +more"}
                      </div>
                    </div>
                  </td>
                  <td className="font-medium text-foreground">{transaction.table}</td>
                  <td className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{transaction.date}</span>
                    </div>
                    <div className="text-sm mt-1">{transaction.time}</div>
                  </td>
                  <td>
                    <div className="font-medium text-foreground">${transaction.amount.toFixed(2)}</div>
                    {transaction.tip && (
                      <div className="text-sm text-success">+${transaction.tip.toFixed(2)} tip</div>
                    )}
                  </td>
                  <td>
                    <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                      {transaction.paymentMethod}
                    </Badge>
                  </td>
                  <td>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="mobile-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{transaction.id}</h4>
                {transaction.customerName && (
                  <p className="text-sm text-muted-foreground">{transaction.customerName}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {transaction.orderItems.slice(0, 2).join(", ")}
                  {transaction.orderItems.length > 2 && " +more"}
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                  {transaction.paymentMethod}
                </Badge>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Table:</span> {transaction.table}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{transaction.date} {transaction.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Total: ${transaction.amount.toFixed(2)}</span>
                {transaction.tip && (
                  <span className="text-success">Tip: +${transaction.tip.toFixed(2)}</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card className="dashboard-card">
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              No transactions match your current search criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TransactionsPage;