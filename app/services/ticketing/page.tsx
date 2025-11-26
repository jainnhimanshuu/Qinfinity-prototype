"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@heroui/react";
import { useStore, useTickets } from "@/lib/storage";
import { Ticket, TicketPriority, TicketCategory } from "@/types/services";

const priorityColors: Record<TicketPriority, "default" | "primary" | "success" | "warning" | "danger"> = {
  low: "default",
  medium: "primary",
  high: "warning",
  critical: "danger",
};

const statusColors: Record<Ticket["status"], "default" | "primary" | "success" | "warning" | "danger"> = {
  open: "primary",
  in_progress: "warning",
  pending: "default",
  resolved: "success",
  closed: "success",
  cancelled: "danger",
};

const categoryLabels: Record<TicketCategory, string> = {
  procurement: "📦 Procurement",
  facilities: "🏢 Facilities",
  it_support: "💻 IT Support",
  hr: "👥 HR",
  project: "📋 Project",
  training: "📚 Training",
  general: "📝 General",
};

export default function TicketingPage() {
  const initialized = useStore((state) => state.initialized);
  const tickets = useTickets();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!initialized) {
      useStore.getState().initialize();
    }
  }, [initialized]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesCategory = filterCategory === "all" || ticket.category === filterCategory;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    onOpen();
  };

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const criticalTickets = tickets.filter((t) => t.priority === "critical" && t.status !== "closed").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ticketing System</h1>
          <p className="text-default-500 mt-1">
            Project management and IT support tickets
          </p>
        </div>
        <Button color="primary">Create Ticket</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-primary">{openTickets}</p>
            <p className="text-sm text-default-500">Open Tickets</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-warning">{inProgressTickets}</p>
            <p className="text-sm text-default-500">In Progress</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-danger">{criticalTickets}</p>
            <p className="text-sm text-default-500">Critical</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold">{tickets.length}</p>
            <p className="text-sm text-default-500">Total Tickets</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4 flex-wrap">
            <Input
              className="max-w-xs"
              placeholder="Search tickets..."
              size="sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={
                <svg className="w-4 h-4 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <Select
              className="max-w-xs"
              size="sm"
              label="Status"
              selectedKeys={[filterStatus]}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <SelectItem key="all">All Statuses</SelectItem>
              <SelectItem key="open">Open</SelectItem>
              <SelectItem key="in_progress">In Progress</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="resolved">Resolved</SelectItem>
              <SelectItem key="closed">Closed</SelectItem>
            </Select>
            <Select
              className="max-w-xs"
              size="sm"
              label="Category"
              selectedKeys={[filterCategory]}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <SelectItem key="all">All Categories</SelectItem>
              <SelectItem key="procurement">Procurement</SelectItem>
              <SelectItem key="facilities">Facilities</SelectItem>
              <SelectItem key="it_support">IT Support</SelectItem>
              <SelectItem key="hr">HR</SelectItem>
              <SelectItem key="training">Training</SelectItem>
              <SelectItem key="project">Project</SelectItem>
              <SelectItem key="general">General</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Tickets ({filteredTickets.length})
          </h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Tickets table">
            <TableHeader>
              <TableColumn>TICKET</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>PRIORITY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredTickets.slice(0, 15).map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{ticket.title}</span>
                      <span className="text-xs text-default-400 truncate max-w-xs">
                        {ticket.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{categoryLabels[ticket.category]}</span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={priorityColors[ticket.priority]} variant="flat">
                      {ticket.priority}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={statusColors[ticket.status]} variant="dot">
                      {ticket.status.replace("_", " ")}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-default-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="light" onPress={() => handleViewTicket(ticket)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Ticket Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {selectedTicket && (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <span>{categoryLabels[selectedTicket.category].split(" ")[0]}</span>
                  <span>{selectedTicket.title}</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Chip color={priorityColors[selectedTicket.priority]} variant="flat">
                      {selectedTicket.priority} priority
                    </Chip>
                    <Chip color={statusColors[selectedTicket.status]} variant="dot">
                      {selectedTicket.status.replace("_", " ")}
                    </Chip>
                    <Chip variant="flat">{selectedTicket.category}</Chip>
                  </div>

                  <div>
                    <p className="text-sm text-default-500 mb-1">Description</p>
                    <p>{selectedTicket.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500 mb-1">Created</p>
                      <p>{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedTicket.dueDate && (
                      <div>
                        <p className="text-sm text-default-500 mb-1">Due Date</p>
                        <p>{new Date(selectedTicket.dueDate).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {selectedTicket.relatedEntityType && (
                    <div>
                      <p className="text-sm text-default-500 mb-1">Related To</p>
                      <Chip variant="flat">
                        {selectedTicket.relatedEntityType}: {selectedTicket.relatedEntityId}
                      </Chip>
                    </div>
                  )}

                  {selectedTicket.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-default-500 mb-1">Tags</p>
                      <div className="flex gap-1">
                        {selectedTicket.tags.map((tag) => (
                          <Chip key={tag} size="sm" variant="flat">{tag}</Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTicket.comments.length > 0 && (
                    <div>
                      <p className="text-sm text-default-500 mb-2">Comments</p>
                      <div className="space-y-2">
                        {selectedTicket.comments.map((comment) => (
                          <div key={comment.id} className="p-3 bg-default-50 rounded-lg">
                            <p className="text-sm">{comment.content}</p>
                            <p className="text-xs text-default-400 mt-1">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Close</Button>
                <Button color="primary">Update Status</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

