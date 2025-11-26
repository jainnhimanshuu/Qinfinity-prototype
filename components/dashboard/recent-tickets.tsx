"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Avatar,
  Button,
} from "@heroui/react";
import { Ticket, TicketPriority, TicketCategory } from "@/types/services";
import Link from "next/link";

interface RecentTicketsProps {
  tickets: Ticket[];
  title?: string;
  maxItems?: number;
}

const priorityColors: Record<TicketPriority, "default" | "primary" | "success" | "warning" | "danger"> = {
  low: "default",
  medium: "primary",
  high: "warning",
  critical: "danger",
};

const categoryIcons: Record<TicketCategory, string> = {
  procurement: "📦",
  facilities: "🏢",
  it_support: "💻",
  hr: "👥",
  project: "📋",
  training: "📚",
  general: "📝",
};

export function RecentTicketsWidget({
  tickets,
  title = "Recent Tickets",
  maxItems = 5,
}: RecentTicketsProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: Ticket["status"]) => {
    const colors: Record<Ticket["status"], "default" | "primary" | "success" | "warning" | "danger"> = {
      open: "primary",
      in_progress: "warning",
      pending: "default",
      resolved: "success",
      closed: "success",
      cancelled: "danger",
    };
    return colors[status];
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          as={Link}
          href="/services/ticketing"
          size="sm"
          variant="light"
          color="primary"
        >
          View All
        </Button>
      </CardHeader>
      <CardBody className="gap-4">
        {tickets.length === 0 ? (
          <div className="text-center text-default-500 py-8">
            No recent tickets
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.slice(0, maxItems).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-default-100 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{categoryIcons[ticket.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{ticket.title}</span>
                    <Chip
                      size="sm"
                      color={priorityColors[ticket.priority]}
                      variant="flat"
                    >
                      {ticket.priority}
                    </Chip>
                  </div>
                  <p className="text-sm text-default-500 truncate">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip
                      size="sm"
                      color={getStatusColor(ticket.status)}
                      variant="dot"
                    >
                      {ticket.status.replace("_", " ")}
                    </Chip>
                    <span className="text-xs text-default-400">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

