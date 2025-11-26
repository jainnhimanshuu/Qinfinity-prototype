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
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { useStore, useEmployees, useHiringRequisitions } from "@/lib/storage";
import { Employee, HiringRequisition } from "@/types/services";

export default function H2RPage() {
  const initialized = useStore((state) => state.initialized);
  const employees = useEmployees();
  const requisitions = useHiringRequisitions();
  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!initialized) {
      useStore.getState().initialize();
    }
  }, [initialized]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
    active: "success",
    inactive: "default",
    on_leave: "warning",
    terminated: "danger",
    draft: "default",
    pending: "warning",
    approved: "primary",
    in_progress: "primary",
    completed: "success",
    cancelled: "danger",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">H2R Portal</h1>
          <p className="text-default-500 mt-1">
            HR services, employee management, and hiring requisitions
          </p>
        </div>
        <Button color="primary" onPress={onOpen}>
          New Requisition
        </Button>
      </div>

      <Tabs aria-label="H2R tabs">
        <Tab key="employees" title={`Employees (${employees.length})`}>
          <Card className="mt-4">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Employee Directory</h3>
              <Input
                className="max-w-xs"
                placeholder="Search employees..."
                size="sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={
                  <svg className="w-4 h-4 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </CardHeader>
            <CardBody>
              <Table aria-label="Employees table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>DEPARTMENT</TableColumn>
                  <TableColumn>POSITION</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>HIRE DATE</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.slice(0, 10).map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                          <span className="text-xs text-default-400">{emp.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>
                        <Chip size="sm" color={statusColors[emp.status]} variant="flat">
                          {emp.status.replace("_", " ")}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {new Date(emp.hireDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="requisitions" title={`Requisitions (${requisitions.length})`}>
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Hiring Requisitions</h3>
            </CardHeader>
            <CardBody>
              <Table aria-label="Requisitions table">
                <TableHeader>
                  <TableColumn>POSITION</TableColumn>
                  <TableColumn>DEPARTMENT</TableColumn>
                  <TableColumn>WORK MODE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>TICKETS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {requisitions.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{req.title}</span>
                          <span className="text-xs text-default-400">{req.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{req.department}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {req.workMode}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color={statusColors[req.status]} variant="flat">
                          {req.status.replace("_", " ")}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {req.ticketIds.length} tickets
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-default-400 text-sm">-</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* New Requisition Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Create Hiring Requisition</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input label="Position Title" placeholder="e.g., Software Engineer" />
              <Select label="Department">
                <SelectItem key="engineering">Engineering</SelectItem>
                <SelectItem key="sales">Sales</SelectItem>
                <SelectItem key="marketing">Marketing</SelectItem>
                <SelectItem key="hr">HR</SelectItem>
                <SelectItem key="finance">Finance</SelectItem>
              </Select>
              <Select label="Work Mode">
                <SelectItem key="onsite">Onsite</SelectItem>
                <SelectItem key="hybrid">Hybrid</SelectItem>
                <SelectItem key="remote">Remote</SelectItem>
              </Select>
              <Input label="Shift Timings" placeholder="e.g., 9 AM - 6 PM" />
              <Input label="Compensation" placeholder="e.g., Competitive salary + bonus" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={onClose}>Create & Start Workflow</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

