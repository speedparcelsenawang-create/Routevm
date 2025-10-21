import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface DescriptionItem {
  term: string;
  definition: string;
}

interface EditableDescriptionListProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditable?: boolean;
}

export function EditableDescriptionList({ value, onSave, isEditable = true }: EditableDescriptionListProps) {
  const parseItems = (text: string): DescriptionItem[] => {
    if (!text.trim()) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => ({
        term: `Item ${index + 1}`,
        definition: line
      }));
  };

  const [items, setItems] = useState<DescriptionItem[]>(parseItems(value));

  // Sync items when value prop changes
  useEffect(() => {
    setItems(parseItems(value));
  }, [value]);

  const handleAddItem = () => {
    const newItems = [...items, { term: `Item ${items.length + 1}`, definition: '' }];
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    
    // Auto-save after removal
    const newValue = newItems
      .filter(item => item.definition.trim())
      .map(item => item.definition)
      .join('\n');
    onSave(newValue);
  };

  const handleTermChange = (index: number, newTerm: string) => {
    const newItems = [...items];
    newItems[index].term = newTerm;
    setItems(newItems);
  };

  const handleDefinitionChange = (index: number, newDefinition: string) => {
    const newItems = [...items];
    newItems[index].definition = newDefinition;
    setItems(newItems);
    
    // Auto-save after definition change
    const newValue = newItems
      .filter(item => item.definition.trim())
      .map(item => item.definition)
      .join('\n');
    onSave(newValue);
  };

  if (!isEditable) {
    const displayItems = parseItems(value);
    return (
      <div className="space-y-2">
        {displayItems.length > 0 ? (
          <dl className="space-y-2" style={{fontSize: '10px'}}>
            {displayItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <dt className="w-20 flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                  {item.term}
                </dt>
                <dd className="flex-1 text-gray-700 dark:text-gray-300 m-0">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground" style={{fontSize: '10px'}}>No information available</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                value={item.term}
                onChange={(e) => handleTermChange(index, e.target.value)}
                className="w-24"
                style={{fontSize: '10px'}}
                placeholder="Term"
                data-testid={`input-item-term-${index}`}
              />
              <Input
                value={item.definition}
                onChange={(e) => handleDefinitionChange(index, e.target.value)}
                className="flex-1"
                style={{fontSize: '10px'}}
                placeholder="Definition"
                data-testid={`input-item-definition-${index}`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-red-600 hover:text-red-700"
                onClick={() => handleRemoveItem(index)}
                data-testid={`button-remove-item-${index}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground" style={{fontSize: '10px'}}>No items yet. Click "Add Item" to start.</p>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-blue-600 hover:text-blue-700"
        style={{fontSize: '10px'}}
        data-testid="button-add-item"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Item
      </Button>
    </div>
  );
}
