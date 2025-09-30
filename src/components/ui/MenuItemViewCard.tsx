import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  status: "available" | "unavailable" | "seasonal";
  prepTime: number;
  imageUrl?: string;
}

interface MenuItemViewCardProps {
  item: MenuItem;
  onUpdate: (id: number, updates: Partial<MenuItem>) => void;
}

const MenuItemViewCard = ({ item, onUpdate }: MenuItemViewCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const getStatusColor = (status: MenuItem["status"]) => {
    switch (status) {
      case "available": return "bg-success text-success-foreground";
      case "unavailable": return "bg-destructive text-destructive-foreground";
      case "seasonal": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "appetizer": return "bg-emerald-500 text-white";
      case "main": return "bg-blue-500 text-white";
      case "dessert": return "bg-pink-500 text-white";
      case "beverage": return "bg-amber-500 text-white";
      case "special": return "bg-purple-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleSave = () => {
    onUpdate(item.id, editedItem);
    setIsEditing(false);
    toast({
      title: "Menu Item Updated",
      description: `${editedItem.name} has been updated successfully.`,
    });
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3 h-64 md:h-auto bg-muted relative">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getCategoryColor(item.category)}>
              {item.category}
            </Badge>
            <Badge className={getStatusColor(item.status)}>
              {item.status}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-4">
            {isEditing ? (
              <div className="flex-1 space-y-3">
                <Input
                  value={editedItem.name}
                  onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                  className="text-2xl font-bold"
                  placeholder="Item name"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-foreground">{item.name}</h3>
              </div>
            )}
            
            <div className="flex gap-2 ml-4">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            {isEditing ? (
              <Textarea
                value={editedItem.description}
                onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                rows={3}
                placeholder="Description"
              />
            ) : (
              <p className="text-muted-foreground">{item.description}</p>
            )}
          </div>

          {/* Price and Prep Time */}
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) })}
                  className="w-24"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">${item.price}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editedItem.prepTime}
                    onChange={(e) => setEditedItem({ ...editedItem, prepTime: parseInt(e.target.value) })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              ) : (
                <span className="text-muted-foreground">{item.prepTime} minutes</span>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-border">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Item ID: #{item.id}</span>
              <span>•</span>
              <span className="capitalize">{item.status}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MenuItemViewCard;