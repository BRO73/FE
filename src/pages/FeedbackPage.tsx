import { useState } from "react";
import { Search, Star, MessageSquare, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Feedback {
  id: number;
  customerName: string;
  email?: string;
  rating: number;
  comment: string;
  date: string;
  orderNumber?: string;
  category: "food" | "service" | "ambiance" | "overall";
  status: "new" | "reviewed" | "responded";
}

const FeedbackPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  // Mock data
  const [feedback] = useState<Feedback[]>([
    { id: 1, customerName: "Sarah Johnson", email: "sarah@email.com", rating: 5, comment: "Absolutely fantastic experience! The food was delicious and the service was impeccable. Will definitely be coming back!", date: "2024-03-14", orderNumber: "ORD-001", category: "overall", status: "new" },
    { id: 2, customerName: "Mike Chen", rating: 4, comment: "Great food and atmosphere. The only minor issue was the wait time, but it was worth it.", date: "2024-03-13", category: "service", status: "reviewed" },
    { id: 3, customerName: "Emma Davis", email: "emma@email.com", rating: 3, comment: "Food was okay, but the service could be improved. Our waiter seemed overwhelmed.", date: "2024-03-12", orderNumber: "ORD-002", category: "service", status: "responded" },
    { id: 4, customerName: "James Wilson", rating: 5, comment: "Amazing salmon dish! The chef really knows what they're doing. Highly recommended!", date: "2024-03-11", category: "food", status: "reviewed" },
    { id: 5, customerName: "Lisa Brown", email: "lisa@email.com", rating: 2, comment: "The ambiance was nice but the food was cold when it arrived. Disappointed with the overall experience.", date: "2024-03-10", orderNumber: "ORD-003", category: "food", status: "new" },
    { id: 6, customerName: "David Miller", rating: 4, comment: "Love the new interior design! Very cozy and romantic. Perfect for date nights.", date: "2024-03-09", category: "ambiance", status: "reviewed" },
  ]);

  const ratings = ["all", "5", "4", "3", "2", "1"];

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = selectedRating === "all" || item.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const getStatusColor = (status: Feedback["status"]) => {
    switch (status) {
      case "new": return "bg-primary text-primary-foreground";
      case "reviewed": return "bg-warning text-warning-foreground";
      case "responded": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: Feedback["category"]) => {
    switch (category) {
      case "food": return "bg-orange-500 text-white";
      case "service": return "bg-blue-500 text-white";
      case "ambiance": return "bg-purple-500 text-white";
      case "overall": return "bg-emerald-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const getAverageRating = () => {
    const total = filteredFeedback.reduce((sum, item) => sum + item.rating, 0);
    return (total / filteredFeedback.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredFeedback.forEach(item => {
      distribution[item.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Feedback</h1>
          <p className="text-muted-foreground mt-1">
            View and manage customer reviews and feedback.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold text-foreground">{getAverageRating()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold text-foreground">{filteredFeedback.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Feedback</p>
              <p className="text-2xl font-bold text-foreground">
                {filteredFeedback.filter(f => f.status === "new").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
              <p className="text-2xl font-bold text-foreground">
                {getRatingDistribution()[5]}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
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
              placeholder="Search feedback by customer name or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ratings.map((rating) => (
              <Button
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRating(rating)}
              >
                {rating === "all" ? "All Ratings" : `${rating} Stars`}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <Card key={item.id} className="dashboard-card">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Customer Info & Rating */}
              <div className="flex-shrink-0 lg:w-64">
                <div className="flex items-center justify-between lg:flex-col lg:items-start lg:space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.customerName}</h4>
                    {item.email && (
                      <p className="text-sm text-muted-foreground">{item.email}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                  <div className="lg:w-full">
                    {renderStars(item.rating)}
                  </div>
                </div>
              </div>

              {/* Comment & Details */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  {item.orderNumber && (
                    <Badge variant="outline">
                      {item.orderNumber}
                    </Badge>
                  )}
                </div>
                <p className="text-foreground leading-relaxed">{item.comment}</p>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Mark as Reviewed
                  </Button>
                  <Button variant="outline" size="sm">
                    Respond
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <Card className="dashboard-card">
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No feedback found</h3>
            <p className="text-muted-foreground">
              No feedback matches your current search criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FeedbackPage;