"use client";

import { Card, CardHeader, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  stats?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
  }[];
  status?: "online" | "offline" | "degraded";
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export function ServiceCard({
  title,
  description,
  icon,
  href,
  stats,
  status = "online",
  color = "primary",
}: ServiceCardProps) {
  const statusColors = {
    online: "success",
    offline: "danger",
    degraded: "warning",
  } as const;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex gap-3">
        <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
          {icon}
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">{title}</p>
            <Chip
              size="sm"
              color={statusColors[status]}
              variant="flat"
            >
              {status}
            </Chip>
          </div>
          <p className="text-small text-default-500">{description}</p>
        </div>
      </CardHeader>
      <CardBody className="py-2">
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-small text-default-500">{stat.label}</span>
                <span className="text-xl font-bold">
                  {stat.value}
                  {stat.trend && (
                    <span
                      className={`text-sm ml-1 ${
                        stat.trend === "up"
                          ? "text-success"
                          : stat.trend === "down"
                          ? "text-danger"
                          : "text-default-400"
                      }`}
                    >
                      {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
      <CardFooter>
        <Button
          as={Link}
          href={href}
          color={color}
          variant="flat"
          className="w-full"
        >
          Open {title}
        </Button>
      </CardFooter>
    </Card>
  );
}

