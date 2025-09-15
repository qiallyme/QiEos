import React, { useState } from "react";
import { MainLayout } from "../../../../components/admin/layout/MainLayout";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Card } from "../../../../components/admin/ui/card";
import { Button } from "../../../../components/admin/ui/button";
import { FiPlus } from "react-icons/fi";

const initialData = {
  columns: {
    "column-1": {
      id: "column-1",
      title: "Lead In",
      dealIds: ["deal-1", "deal-2"],
    },
    "column-2": {
      id: "column-2",
      title: "Contact Made",
      dealIds: ["deal-3"],
    },
    "column-3": {
      id: "column-3",
      title: "Proposal Made",
      dealIds: ["deal-4"],
    },
    "column-4": {
      id: "column-4",
      title: "Won",
      dealIds: [],
    },
  } as Record<string, { id: string; title: string; dealIds: string[] }>,
  deals: {
    "deal-1": { id: "deal-1", content: "Acme Corp - Website Redesign" },
    "deal-2": { id: "deal-2", content: "Stark Industries - API Integration" },
    "deal-3": { id: "deal-3", content: "Wayne Enterprises - Mobile App" },
    "deal-4": { id: "deal-4", content: "Cyberdyne - AI Consulting" },
  } as Record<string, { id: string; content: string }>,
  columnOrder: ["column-1", "column-2", "column-3", "column-4"],
};

export const CrmPage: React.FC = () => {
  const [data, setData] = useState(initialData);

  const onDragEnd = (_result: DropResult) => {
    // TODO: Implement drag and drop
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deals Pipeline</h1>
        <Button>
          <FiPlus className="mr-2" />
          New Deal
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-6">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const deals = column.dealIds.map(
              (dealId: string) => data.deals[dealId]
            );

            return (
              <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[500px]"
                    >
                      {deals.map((deal: any, index: number) => (
                        <Draggable
                          key={deal.id}
                          draggableId={deal.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-4"
                            >
                              <Card>
                                <div className="p-4">{deal.content}</div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </MainLayout>
  );
};
